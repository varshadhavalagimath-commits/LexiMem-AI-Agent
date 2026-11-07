const fs = require('fs');
const path = require('path');
const Contract = require('../models/Contract');
const ContractVersion = require('../models/ContractVersion');
const Clause = require('../models/Clause');
const RiskFinding = require('../models/RiskFinding');
const Obligation = require('../models/Obligation');
const documentProcessorClient = require('../integrations/documentProcessorClient');
const agentOrchestrator = require('../agents/AgentOrchestrator');
const { logAudit } = require('../middleware/auditLogger');

class ContractService {
  async uploadAndProcessContract(file, user, bodyMeta = {}) {
    if (!file) {
      throw new Error('No document file was provided for upload.');
    }

    const filePath = file.path;
    const originalFilename = file.originalname;

    // 1. Extract text and structure using Document Processor Client
    const extractionResult = await documentProcessorClient.extractDocument(filePath, originalFilename);
    const { fullText, pageCount, isScanned, ocrRequired, statusMessage } = extractionResult;

    // 2. Run the Multi-Agent Orchestration Pipeline
    const pipelineData = await agentOrchestrator.processContractReview({
      fullText,
      filename: originalFilename,
      organizationId: user.organizationId,
      user,
    });

    const { intake, analysis, obligations, workflow } = pipelineData;

    // 3. Compute Dates
    const effectiveDate = intake.effectiveDate ? new Date(intake.effectiveDate) : new Date();
    let expirationDate = intake.expiryDate ? new Date(intake.expiryDate) : null;
    if (!expirationDate) {
      expirationDate = new Date(effectiveDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    const noticeDays = intake.renewalNoticePeriodDays || 30;
    const renewalNoticeDueDate = new Date(expirationDate.getTime() - (noticeDays * 24 * 3600 * 1000));

    // 4. Create Contract Master Record
    const contract = await Contract.create({
      title: bodyMeta.title || intake.contractTitle || originalFilename.replace(/\.[^/.]+$/, ''),
      contractType: bodyMeta.contractType || intake.contractType || 'Service Agreement',
      parties: intake.partyNames?.length ? intake.partyNames : ['Apex Global Technologies LLC', intake.counterparty || 'Counterparty'],
      counterparty: bodyMeta.counterparty || intake.counterparty || 'Counterparty LLC',
      owner: user._id,
      assignedReviewer: workflow.suggestedReviewer?._id || user._id,
      organizationId: user.organizationId,
      originalFile: {
        filename: file.filename,
        originalName: originalFilename,
        mimeType: file.mimetype,
        size: file.size,
        filePath: file.path,
        uploadDate: new Date(),
      },
      isScanned,
      ocrRequired,
      extractionConfidence: isScanned ? 30 : intake.extractionConfidence,
      extractedFields: intake,
      jurisdiction: bodyMeta.jurisdiction || intake.jurisdiction || 'Delaware, USA',
      effectiveDate,
      expirationDate,
      renewalNoticePeriodDays: noticeDays,
      renewalNoticeDueDate,
      renewalTerms: intake.renewalTerms,
      value: {
        amount: bodyMeta.value ? Number(bodyMeta.value) : (intake.estimatedValue?.amount || 100000),
        currency: 'USD',
      },
      status: 'Under Review',
      riskScore: analysis.riskScore,
      riskLevel: analysis.overallRiskLevel,
      currentVersion: 1,
      tags: bodyMeta.tags ? (Array.isArray(bodyMeta.tags) ? bodyMeta.tags : bodyMeta.tags.split(',').map(t => t.trim())) : ['New Upload', intake.contractType],
      aiReviewSummary: analysis.reviewSummary,
      createdBy: user._id,
    });

    // 5. Create Initial Contract Version Record (v1)
    const versionRecord = await ContractVersion.create({
      contractId: contract._id,
      versionNumber: 1,
      fileReference: {
        filename: file.filename,
        originalName: originalFilename,
        mimeType: file.mimetype,
        size: file.size,
        filePath: file.path,
      },
      extractedText: fullText,
      changeSummary: 'Initial document upload & automatic extraction.',
      differences: [],
      uploadedBy: user._id,
    });

    // 6. Persist Extracted Clauses
    const savedClauses = [];
    for (const cl of analysis.clauses) {
      const clauseDoc = await Clause.create({
        contractId: contract._id,
        versionId: versionRecord._id,
        category: cl.category,
        text: cl.text,
        clauseReference: cl.clauseReference,
        pageNumber: cl.pageNumber || 1,
        riskLevel: cl.riskLevel,
        analysis: {
          summary: cl.analysisSummary || '',
          confidenceScore: 90,
        },
        matchedPrecedentId: cl.precedentMatch?.precedentId || undefined,
        status: cl.riskLevel === 'Critical' || cl.riskLevel === 'High' ? 'flagged' : 'unreviewed',
      });
      savedClauses.push(clauseDoc);
    }

    // 7. Persist Risk Findings
    for (const rf of analysis.riskFindings) {
      // Find matching clause ID if possible
      const matchingClause = savedClauses.find(c => c.category === rf.clauseCategory) || savedClauses[0];
      await RiskFinding.create({
        contractId: contract._id,
        clauseId: matchingClause?._id,
        riskTitle: rf.riskTitle,
        severity: rf.severity,
        clauseText: rf.clauseText,
        pageNumber: rf.pageNumber || 1,
        clauseReference: rf.clauseReference || 'Section Unspecified',
        explanation: rf.explanation,
        businessImpact: rf.businessImpact,
        suggestedAction: rf.suggestedAction,
        relevantPrecedent: rf.relevantPrecedent,
        aiConfidence: rf.aiConfidence,
        status: 'open',
      });
    }

    // 8. Persist Obligations
    for (const ob of obligations) {
      await Obligation.create({
        contractId: contract._id,
        contractTitle: contract.title,
        description: ob.description,
        category: ob.category,
        dueDate: ob.dueDate,
        assignedTo: user._id,
        assignedName: ob.assignedName,
        priority: ob.priority,
        status: ob.status,
      });
    }

    // 9. Record Audit Log
    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'CONTRACT_UPLOADED_AND_ANALYZED',
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
      details: {
        filename: originalFilename,
        riskScore: contract.riskScore,
        clausesCount: savedClauses.length,
        obligationsCount: obligations.length,
        isScanned,
      },
    });

    return this.getContractDetails(contract._id, user.organizationId);
  }

  async uploadNewVersion(contractId, file, user, changeSummary = '') {
    const contract = await Contract.findOne({ _id: contractId, organizationId: user.organizationId });
    if (!contract) throw new Error('Contract not found.');

    const newVersionNumber = contract.currentVersion + 1;
    const extractionResult = await documentProcessorClient.extractDocument(file.path, file.originalname);
    const newText = extractionResult.fullText;

    // Get previous version text
    const prevVersion = await ContractVersion.findOne({
      contractId: contract._id,
      versionNumber: contract.currentVersion,
    });
    const oldText = prevVersion ? prevVersion.extractedText : '';

    // Run Comparison Agent
    const comparison = await agentOrchestrator.comparisonAgent.compareTexts(
      oldText,
      newText,
      `v${contract.currentVersion}`,
      `v${newVersionNumber}`
    );

    // Create New Version Record
    const versionRecord = await ContractVersion.create({
      contractId: contract._id,
      versionNumber: newVersionNumber,
      fileReference: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        filePath: file.path,
      },
      extractedText: newText,
      changeSummary: changeSummary || comparison.summary,
      differences: comparison.differences,
      uploadedBy: user._id,
    });

    // Update contract current version
    contract.currentVersion = newVersionNumber;
    await contract.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'NEW_CONTRACT_VERSION_UPLOADED',
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
      details: {
        versionNumber: newVersionNumber,
        changesCount: comparison.differences.length,
      },
    });

    return versionRecord;
  }

  async getContracts(query = {}, organizationId) {
    const filter = { organizationId };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { counterparty: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.contractType && query.contractType !== 'All') {
      filter.contractType = query.contractType;
    }

    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }

    if (query.riskLevel && query.riskLevel !== 'All') {
      filter.riskLevel = query.riskLevel;
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .populate('owner', 'name email role')
      .populate('assignedReviewer', 'name email role')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    return {
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getContractDetails(contractId, organizationId) {
    const contract = await Contract.findOne({ _id: contractId, organizationId })
      .populate('owner', 'name email role')
      .populate('assignedReviewer', 'name email role');

    if (!contract) throw new Error('Contract not found.');

    const clauses = await Clause.find({ contractId: contract._id }).sort({ pageNumber: 1 });
    const riskFindings = await RiskFinding.find({ contractId: contract._id }).sort({ severity: 1 });
    const obligations = await Obligation.find({ contractId: contract._id }).sort({ dueDate: 1 });
    const versions = await ContractVersion.find({ contractId: contract._id })
      .populate('uploadedBy', 'name email')
      .sort({ versionNumber: -1 });

    return {
      contract,
      clauses,
      riskFindings,
      obligations,
      versions,
    };
  }

  async updateContract(contractId, updates, user) {
    const contract = await Contract.findOne({ _id: contractId, organizationId: user.organizationId });
    if (!contract) throw new Error('Contract not found.');

    const allowedFields = ['title', 'status', 'jurisdiction', 'effectiveDate', 'expirationDate', 'tags', 'assignedReviewer'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        contract[field] = updates[field];
      }
    });

    await contract.save();

    await logAudit({ user, organizationId: user.organizationId }, {
      action: 'CONTRACT_METADATA_UPDATED',
      resourceType: 'contract',
      resourceId: contract._id,
      resourceTitle: contract.title,
      details: updates,
    });

    return contract;
  }
}

module.exports = new ContractService();
