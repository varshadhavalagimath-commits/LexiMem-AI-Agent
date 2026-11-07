const contractIntakeAgent = require('./ContractIntakeAgent');
const clauseAnalysisAgent = require('./ClauseAnalysisAgent');
const precedentRetrievalAgent = require('./PrecedentRetrievalAgent');
const obligationAgent = require('./ObligationAgent');
const workflowAgent = require('./WorkflowAgent');
const memoryLearningAgent = require('./MemoryLearningAgent');
const negotiationAgent = require('./NegotiationAgent');
const contractComparisonAgent = require('./ContractComparisonAgent');

class AgentOrchestrator {
  /**
   * Complete pipeline from raw extracted text to full contract intelligence.
   */
  async processContractReview({ fullText, filename, organizationId, user }) {
    console.log(`[AgentOrchestrator] Running Agent 1 (Contract Intake Agent)...`);
    const intakeResult = await contractIntakeAgent.process(fullText, filename);

    console.log(`[AgentOrchestrator] Running Agent 2 (Clause Analysis Agent)...`);
    const analysisResult = await clauseAnalysisAgent.analyze(fullText, intakeResult.contractType);

    console.log(`[AgentOrchestrator] Running Agent 3 (Precedent Retrieval Agent) across ${analysisResult.clauses.length} clauses...`);
    const enrichedClauses = [];
    const enrichedRisks = [];

    // For each clause, recall precedents from Hindsight memory bank
    for (const cl of analysisResult.clauses) {
      const precedentMatch = await precedentRetrievalAgent.retrievePrecedents({
        clauseText: cl.text,
        category: cl.category,
        contractType: intakeResult.contractType,
        jurisdiction: intakeResult.jurisdiction,
        organizationId,
      });

      enrichedClauses.push({
        ...cl,
        precedentMatch: precedentMatch.hasPrecedent ? precedentMatch.bestMatch : null,
      });
    }

    // Attach precedent recommendations to risk findings
    for (const risk of analysisResult.riskFindings) {
      const precedentMatch = await precedentRetrievalAgent.retrievePrecedents({
        clauseText: risk.clauseText,
        category: risk.clauseCategory,
        contractType: intakeResult.contractType,
        jurisdiction: intakeResult.jurisdiction,
        organizationId,
      });

      let relevantPrecedent = null;
      if (precedentMatch.hasPrecedent) {
        const best = precedentMatch.bestMatch;
        relevantPrecedent = {
          precedentId: best.precedentId,
          summary: `Approved precedent from ${best.contractTitle}: ${best.decision.toUpperCase()}`,
          approvedWording: best.finalApprovedClause,
          similarityScore: best.similarityScore,
        };
      }

      enrichedRisks.push({
        ...risk,
        relevantPrecedent,
      });
    }

    console.log(`[AgentOrchestrator] Running Agent 6 (Obligation Agent)...`);
    const obligations = await obligationAgent.extractObligations(fullText, {
      effectiveDate: intakeResult.effectiveDate,
      expirationDate: intakeResult.expiryDate,
      renewalNoticePeriodDays: intakeResult.renewalNoticePeriodDays,
    });

    console.log(`[AgentOrchestrator] Running Agent 7 (Workflow Agent)...`);
    const workflowRouting = await workflowAgent.routeContract({
      riskScore: analysisResult.riskScore,
      contractType: intakeResult.contractType,
      contractValue: intakeResult.estimatedValue?.amount || 0,
      organizationId,
    });

    return {
      intake: intakeResult,
      analysis: {
        ...analysisResult,
        clauses: enrichedClauses,
        riskFindings: enrichedRisks,
      },
      obligations,
      workflow: workflowRouting,
    };
  }

  // Export references to individual agents
  get intakeAgent() { return contractIntakeAgent; }
  get analysisAgent() { return clauseAnalysisAgent; }
  get precedentAgent() { return precedentRetrievalAgent; }
  get comparisonAgent() { return contractComparisonAgent; }
  get negotiationAgent() { return negotiationAgent; }
  get obligationAgent() { return obligationAgent; }
  get workflowAgent() { return workflowAgent; }
  get memoryLearningAgent() { return memoryLearningAgent; }
}

module.exports = new AgentOrchestrator();
