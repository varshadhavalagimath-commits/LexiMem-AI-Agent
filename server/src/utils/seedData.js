const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Contract = require('../models/Contract');
const ContractVersion = require('../models/ContractVersion');
const Clause = require('../models/Clause');
const RiskFinding = require('../models/RiskFinding');
const Precedent = require('../models/Precedent');
const Obligation = require('../models/Obligation');
const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');

const seedInitialData = async () => {
  try {
    const existingOrg = await Organization.findOne({ name: 'Apex Global Technologies LLC' });
    if (existingOrg) {
      console.log('[Seed] Database already contains initialized organization data.');
      return;
    }

    console.log('[Seed] Initializing enterprise LegalTech demonstration data...');

    // 1. Create Organization
    const organization = await Organization.create({
      name: 'Apex Global Technologies LLC',
      domain: 'apextech.com',
      settings: {
        hindsightBankId: 'leximem-precedents-apex',
        defaultJurisdiction: 'Delaware, USA',
        riskThresholds: { critical: 80, high: 60, medium: 40 },
        renewalNoticeDays: [90, 60, 30, 7],
        strictPrecedentEnforcement: true,
      },
    });

    // 2. Create 3 Demo Users
    const adminUser = await User.create({
      name: 'Victoria Vance, Esq.',
      email: 'admin@leximem.com',
      passwordHash: 'LexiMemAdmin2026!',
      role: 'admin',
      department: 'Executive Legal Operations',
      organizationId: organization._id,
      permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_POLICIES', 'VIEW_AUDIT_LOGS'],
    });

    const lawyerUser = await User.create({
      name: 'David Sterling, Esq.',
      email: 'lawyer@leximem.com',
      passwordHash: 'LexiMemLawyer2026!',
      role: 'lawyer',
      department: 'Corporate Commercial Transactions',
      organizationId: organization._id,
      permissions: ['REVIEW_CONTRACTS', 'APPROVE_PRECEDENTS', 'NEGOTIATE_CLAUSES'],
    });

    const businessUser = await User.create({
      name: 'Marcus Chen',
      email: 'employee@leximem.com',
      passwordHash: 'LexiMemEmployee2026!',
      role: 'business_user',
      department: 'Strategic Procurement',
      organizationId: organization._id,
      permissions: ['SUBMIT_CONTRACTS', 'VIEW_ASSIGNED_OBLIGATIONS'],
    });

    console.log('[Seed] 3 Demo User accounts created: admin@leximem.com, lawyer@leximem.com, employee@leximem.com');

    // 3. Create Corporate Policies
    const liabilityPolicy = await Policy.create({
      organizationId: organization._id,
      title: 'Mandatory Aggregate Liability Cap Policy',
      category: 'Liability',
      description: 'All commercial vendor and SaaS agreements must contain an express limitation of aggregate liability not to exceed 12 months fees paid.',
      standardTerm: 'Except for gross negligence or breach of confidentiality, neither party\'s aggregate liability shall exceed the total fees paid under this Agreement in the twelve (12) months preceding the incident.',
      unacceptablePhrases: ['unlimited liability', 'shall not be subject to any limitation', 'without limitation of damages'],
      liabilityCapRule: { capType: 'contract_value_multiple', multiplier: 1, fixedCapUsd: 500000 },
      approvedJurisdictions: ['Delaware, USA', 'New York, USA', 'California, USA'],
      strictness: 'mandatory',
      createdBy: adminUser._id,
    });

    const indemnityPolicy = await Policy.create({
      organizationId: organization._id,
      title: 'Bilateral Reciprocal Indemnification Policy',
      category: 'Indemnification',
      description: 'Indemnification clauses must be reciprocal and confined strictly to third-party claims arising from gross negligence, willful misconduct, or IP infringement.',
      standardTerm: 'Each party agrees to defend, indemnify, and hold harmless the other party against third-party claims arising from gross negligence or intellectual property infringement.',
      unacceptablePhrases: ['solely indemnify', 'unilateral indemnification', 'indemnify for ordinary negligence'],
      strictness: 'mandatory',
      createdBy: adminUser._id,
    });

    const governingLawPolicy = await Policy.create({
      organizationId: organization._id,
      title: 'Corporate Governing Law & Dispute Forum',
      category: 'Governing Law',
      description: 'Default corporate choice of law is the State of Delaware with dispute resolution through binding arbitration.',
      standardTerm: 'This Agreement shall be governed by the laws of the State of Delaware, without regard to conflict of law principles.',
      approvedJurisdictions: ['Delaware, USA', 'New York, USA', 'England & Wales'],
      strictness: 'recommended',
      createdBy: adminUser._id,
    });

    // 4. Create Precedents in Precedent Memory
    const precedent1 = await Precedent.create({
      organizationId: organization._id,
      contractId: new mongoose.Types.ObjectId(),
      contractTitle: 'Vanguard Enterprise Vendor Framework Agreement',
      contractType: 'Vendor Agreement',
      clauseCategory: 'Liability',
      originalClause: 'Vendor liability shall be unlimited and subject to no limitation whatsoever for all direct and indirect claims.',
      proposedClause: 'Except for confidentiality breaches, aggregate liability is capped at 12 months fees paid.',
      finalApprovedClause: 'Except for breaches of Section 4 (Confidentiality), each party\'s total aggregate liability arising out of or related to this Agreement shall be capped at the total amount of fees paid or payable by Customer in the twelve (12) months preceding the event giving rise to liability.',
      decision: 'approved',
      reason: 'Enforce corporate policy PO-2024-01 capping balance-sheet exposure at annual contract value. Uncapped liability rejected as commercially unacceptable.',
      jurisdiction: 'Delaware, USA',
      approvedBy: lawyerUser._id,
      approvalDate: new Date(Date.now() - 45 * 24 * 3600 * 1000),
      status: 'active',
      hindsightMemoryReference: {
        bankId: 'leximem-precedents-apex',
        memoryId: 'hs-mem-seed-001',
        retainedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000),
        status: 'synced',
      },
      relevanceCount: 8,
    });

    const precedent2 = await Precedent.create({
      organizationId: organization._id,
      contractId: new mongoose.Types.ObjectId(),
      contractTitle: 'Nexus Cloud Services Agreement',
      contractType: 'Service Agreement',
      clauseCategory: 'Indemnification',
      originalClause: 'Customer shall solely defend, indemnify and hold harmless Vendor against any and all claims, fines, and liabilities.',
      proposedClause: 'Each party mutually defends the other against IP infringement.',
      finalApprovedClause: 'Each party agrees to defend, indemnify, and hold harmless the other party from and against third-party claims arising from gross negligence, willful misconduct, or unauthorized intellectual property infringement.',
      decision: 'approved',
      reason: 'Eliminated one-sided unilateral defense burden and established standard bilateral risk sharing for IP and willful misconduct.',
      jurisdiction: 'New York, USA',
      approvedBy: lawyerUser._id,
      approvalDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      status: 'active',
      hindsightMemoryReference: {
        bankId: 'leximem-precedents-apex',
        memoryId: 'hs-mem-seed-002',
        retainedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        status: 'synced',
      },
      relevanceCount: 5,
    });

    const precedent3 = await Precedent.create({
      organizationId: organization._id,
      contractId: new mongoose.Types.ObjectId(),
      contractTitle: 'AeroTech Supplier Agreement',
      contractType: 'Vendor Agreement',
      clauseCategory: 'Liability',
      originalClause: 'In the event of delivery delay exceeding 5 business days, Supplier shall pay liquidated damages equal to 50% of the entire purchase order value.',
      proposedClause: 'Liquidated damages of 2% per week capped at 10%.',
      finalApprovedClause: 'In the event of unexcused delivery delay exceeding 10 business days, Supplier shall pay liquidated damages equal to 1.5% per week of delay, not to exceed a maximum aggregate cap of 10% of the delayed order value.',
      decision: 'rejected',
      reason: 'REJECTED: 50% penalty is legally punitive and unconscionable under Delaware commercial precedent. Countered with 10% standard market cap.',
      jurisdiction: 'Delaware, USA',
      approvedBy: lawyerUser._id,
      approvalDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      status: 'active',
      hindsightMemoryReference: {
        bankId: 'leximem-precedents-apex',
        memoryId: 'hs-mem-seed-003',
        retainedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
        status: 'synced',
      },
      relevanceCount: 3,
    });

    // 5. Create 5 Sample Contracts
    // Contract 1: Vendor Agreement
    const contract1 = await Contract.create({
      title: 'CloudFlow Enterprise Vendor Services Agreement',
      contractType: 'Vendor Agreement',
      parties: ['Apex Global Technologies LLC', 'CloudFlow Systems Inc.'],
      counterparty: 'CloudFlow Systems Inc.',
      owner: lawyerUser._id,
      assignedReviewer: lawyerUser._id,
      organizationId: organization._id,
      jurisdiction: 'Delaware, USA',
      effectiveDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      expirationDate: new Date(Date.now() + 305 * 24 * 3600 * 1000),
      renewalNoticePeriodDays: 30,
      renewalNoticeDueDate: new Date(Date.now() + 275 * 24 * 3600 * 1000),
      renewalTerms: 'Automatic 1-year renewal unless written notice provided 30 days prior.',
      value: { amount: 250000, currency: 'USD' },
      status: 'Active',
      riskScore: 28,
      riskLevel: 'Low',
      currentVersion: 2,
      tags: ['Vendor', 'Critical Infrastructure', 'Precedent Applied'],
      aiReviewSummary: 'Precedent-backed negotiation successfully capped aggregate liability and established mutual indemnification. Risk reduced from High (78) to Low (28).',
      createdBy: businessUser._id,
    });

    // Contract 2: NDA
    const contract2 = await Contract.create({
      title: 'NeuralSync Mutual Non-Disclosure Agreement',
      contractType: 'NDA',
      parties: ['Apex Global Technologies LLC', 'NeuralSync AI Labs'],
      counterparty: 'NeuralSync AI Labs',
      owner: businessUser._id,
      assignedReviewer: lawyerUser._id,
      organizationId: organization._id,
      jurisdiction: 'Delaware, USA',
      effectiveDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      expirationDate: new Date(Date.now() + 715 * 24 * 3600 * 1000), // 2 years
      renewalNoticePeriodDays: 0,
      renewalTerms: 'Fixed 2-year term with standard 3-year survival.',
      value: { amount: 0, currency: 'USD' },
      status: 'Active',
      riskScore: 12,
      riskLevel: 'Low',
      currentVersion: 1,
      tags: ['NDA', 'Mutual', 'Low Risk'],
      aiReviewSummary: 'Standard mutual non-disclosure agreement compliant with Delaware law and corporate policy.',
      createdBy: businessUser._id,
    });

    // Contract 3: Software Licensing Agreement (Under Review - HIGH RISK FOR DEMO)
    const contract3 = await Contract.create({
      title: 'DataVanguard SaaS Master Subscription Agreement',
      contractType: 'Software Licensing Agreement',
      parties: ['Apex Global Technologies LLC', 'DataVanguard Corp'],
      counterparty: 'DataVanguard Corp',
      owner: businessUser._id,
      assignedReviewer: lawyerUser._id,
      organizationId: organization._id,
      jurisdiction: 'New York, USA',
      effectiveDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      expirationDate: new Date(Date.now() + 360 * 24 * 3600 * 1000),
      renewalNoticePeriodDays: 60,
      renewalNoticeDueDate: new Date(Date.now() + 300 * 24 * 3600 * 1000),
      renewalTerms: 'Automatic evergreen renewal with 60 days advance written notice requirement.',
      value: { amount: 180000, currency: 'USD' },
      status: 'Under Review',
      riskScore: 82,
      riskLevel: 'Critical',
      currentVersion: 1,
      tags: ['SaaS', 'Pending Review', 'Unlimited Liability Alert'],
      aiReviewSummary: 'CRITICAL RISK DETECTED: Section 8.1 contains unlimited aggregate liability. Precedent memory recall matched 1 historical approved decision from CloudFlow Vendor Agreement (94% match). Counterproposal recommended.',
      createdBy: businessUser._id,
    });

    // Contract 4: Employment Agreement
    const contract4 = await Contract.create({
      title: 'Senior Principal AI Architect Employment Agreement',
      contractType: 'Employment Agreement',
      parties: ['Apex Global Technologies LLC', 'Dr. Alan Vance'],
      counterparty: 'Dr. Alan Vance',
      owner: adminUser._id,
      assignedReviewer: adminUser._id,
      organizationId: organization._id,
      jurisdiction: 'California, USA',
      effectiveDate: new Date(Date.now() - 90 * 24 * 3600 * 1000),
      expirationDate: new Date(Date.now() + 275 * 24 * 3600 * 1000),
      renewalNoticePeriodDays: 30,
      renewalTerms: 'At-will executive employment with standard annual bonus review.',
      value: { amount: 240000, currency: 'USD' },
      status: 'Active',
      riskScore: 18,
      riskLevel: 'Low',
      currentVersion: 1,
      tags: ['Executive', 'Employment', 'Confidential'],
      aiReviewSummary: 'California compliant non-compete carveouts and clear IP assignment clauses verified.',
      createdBy: adminUser._id,
    });

    // Contract 5: Consulting Agreement (Negotiation stage)
    const contract5 = await Contract.create({
      title: 'OmniScale Strategic Advisory Consulting Agreement',
      contractType: 'Consulting Agreement',
      parties: ['Apex Global Technologies LLC', 'OmniScale Partners LLP'],
      counterparty: 'OmniScale Partners LLP',
      owner: lawyerUser._id,
      assignedReviewer: lawyerUser._id,
      organizationId: organization._id,
      jurisdiction: 'Delaware, USA',
      effectiveDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      expirationDate: new Date(Date.now() + 180 * 24 * 3600 * 1000),
      renewalNoticePeriodDays: 30,
      renewalTerms: 'Project milestone completion with optional 6-month extension.',
      value: { amount: 95000, currency: 'USD' },
      status: 'Negotiation',
      riskScore: 54,
      riskLevel: 'Medium',
      currentVersion: 1,
      tags: ['Advisory', 'Consulting', 'Active Negotiation'],
      aiReviewSummary: 'Deliverable milestones are well defined. Indemnity clause currently under negotiation to ensure reciprocal protection.',
      createdBy: businessUser._id,
    });

    // 6. Create Risk Findings for Contract 3 (Demonstrating Precedent match)
    const clauseLiability = await Clause.create({
      contractId: contract3._id,
      category: 'Liability',
      clauseReference: 'Section 8.1 - Aggregate Liability',
      text: 'Neither party shall be subject to any limitation of liability for breaches of this agreement, and total aggregate liability shall be unlimited for all claims arising thereunder.',
      pageNumber: 3,
      riskLevel: 'Critical',
      analysis: {
        summary: 'Explicit open-ended unlimited liability clause.',
        flaggedIssues: ['Unlimited liability', 'No monetary ceiling'],
        confidenceScore: 98,
      },
      matchedPrecedentId: precedent1._id,
      status: 'flagged',
    });

    await RiskFinding.create({
      contractId: contract3._id,
      clauseId: clauseLiability._id,
      riskTitle: 'Unlimited Aggregate Liability Exposure',
      severity: 'Critical',
      clauseText: clauseLiability.text,
      pageNumber: 3,
      clauseReference: 'Section 8.1',
      explanation: 'The clause contains no monetary ceiling or cap on counterparty damages, creating uncapped exposure across direct and consequential claims.',
      businessImpact: 'A single operational interruption or security incident could expose Apex to catastrophic multimillion-dollar liability far exceeding the $180,000 contract value.',
      suggestedAction: 'Propose replacing with approved precedent capping liability at 12 months fees paid ($180,000).',
      relevantPolicy: 'Mandatory Aggregate Liability Cap Policy (PO-2024-01)',
      relevantPrecedent: {
        precedentId: precedent1._id,
        summary: 'Approved precedent from Vanguard Enterprise Vendor Framework Agreement: APPROVED',
        approvedWording: precedent1.finalApprovedClause,
        similarityScore: 94,
      },
      aiConfidence: 97,
      status: 'open',
    });

    // 7. Create Obligations
    await Obligation.create([
      {
        contractId: contract3._id,
        contractTitle: contract3.title,
        description: 'Provide 60 days advance written Non-Renewal Notice prior to contract expiration date.',
        category: 'renewal_notice',
        dueDate: contract3.renewalNoticeDueDate,
        assignedTo: lawyerUser._id,
        assignedName: lawyerUser.name,
        priority: 'critical',
        status: 'pending',
      },
      {
        contractId: contract1._id,
        contractTitle: contract1.title,
        description: 'Remit quarterly enterprise cloud infrastructure payment of $62,500.',
        category: 'payment',
        dueDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
        assignedTo: businessUser._id,
        assignedName: businessUser.name,
        priority: 'high',
        status: 'pending',
      },
      {
        contractId: contract1._id,
        contractTitle: contract1.title,
        description: 'Deliver annual SOC2 Type II audit report to Apex Information Security Officer.',
        category: 'reporting',
        dueDate: new Date(Date.now() - 5 * 24 * 3600 * 1000), // Overdue for demo
        assignedTo: lawyerUser._id,
        assignedName: lawyerUser.name,
        priority: 'high',
        status: 'overdue',
      },
      {
        contractId: contract5._id,
        contractTitle: contract5.title,
        description: 'Deliver Phase 1 Strategic Market Assessment Findings Deck.',
        category: 'service_delivery',
        dueDate: new Date(Date.now() + 45 * 24 * 3600 * 1000),
        assignedTo: businessUser._id,
        assignedName: businessUser.name,
        priority: 'medium',
        status: 'in_progress',
      },
    ]);

    // 8. Log initial Audit Trail
    await AuditLog.create([
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        organizationId: organization._id,
        action: 'ORGANIZATION_INITIALIZED',
        resourceType: 'system',
        resourceTitle: 'Apex Global Technologies Setup',
        details: { setup: 'Completed initial demonstration seed' },
        timestamp: new Date(Date.now() - 65 * 24 * 3600 * 1000),
      },
      {
        userId: lawyerUser._id,
        userName: lawyerUser.name,
        userEmail: lawyerUser.email,
        organizationId: organization._id,
        action: 'PRECEDENT_MEMORY_COMMITTED',
        resourceType: 'precedent',
        resourceId: precedent1._id,
        resourceTitle: 'Liability - APPROVED',
        details: { decision: 'approved', reason: precedent1.reason },
        timestamp: new Date(Date.now() - 45 * 24 * 3600 * 1000),
      },
      {
        userId: businessUser._id,
        userName: businessUser.name,
        userEmail: businessUser.email,
        organizationId: organization._id,
        action: 'CONTRACT_UPLOADED_AND_ANALYZED',
        resourceType: 'contract',
        resourceId: contract3._id,
        resourceTitle: contract3.title,
        details: { riskScore: 82, flaggedClauses: 1 },
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
    ]);

    console.log('[Seed] Demonstration legal dataset initialized successfully!');
  } catch (error) {
    console.error('[Seed] Error during demo seeding:', error.message);
  }
};

module.exports = { seedInitialData };

if (require.main === module) {
  const { connectDB } = require('../config/database');
  connectDB().then(() => {
    seedInitialData().then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    });
  });
}
