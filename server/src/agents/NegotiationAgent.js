const groqClient = require('../integrations/groqClient');
const precedentRetrievalAgent = require('./PrecedentRetrievalAgent');

class NegotiationAgent {
  async generateAlternatives({
    clauseCategory,
    originalClause,
    contractType = 'Service Agreement',
    organizationId,
    jurisdiction = 'Delaware, USA',
  }) {
    // 1. Recall any matching precedents first
    const precedentResult = await precedentRetrievalAgent.retrievePrecedents({
      clauseText: originalClause,
      category: clauseCategory,
      contractType,
      jurisdiction,
      organizationId,
    });

    const approvedPrecedent = precedentResult.hasPrecedent ? precedentResult.bestMatch : null;

    const prompt = `
You are the Negotiation Assistant AI Agent for LexiMem Enterprise LegalTech platform.
A lawyer is negotiating a problematic "${clauseCategory}" clause in a ${contractType}.

ORIGINAL CLAUSE:
"${originalClause}"

APPROVED ORGANIZATIONAL PRECEDENT (if available):
${approvedPrecedent ? approvedPrecedent.finalApprovedClause : "None currently on file in precedent memory."}

TASK:
1. Provide a well-drafted, balanced counterproposal wording that protects our organization.
2. Outline key pros (advantages) and cons (disadvantages or trade-offs) of the proposed alternative.
3. Provide an executive rationale explaining why counterparty should accept this compromise.

Return a JSON object:
{
  "aiSuggestion": "Refined counterproposal clause text",
  "pros": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "cons": ["Potential concession or counterparty pushback point 1", "Point 2"],
  "rationale": "Clear negotiation talking points for legal counsel",
  "compromiseOption": "A secondary fallback clause if counterparty rejects primary suggestion"
}
`;

    const aiResult = await groqClient.generateJson({
      systemPrompt: 'You are an elite corporate transactional attorney assisting in contract negotiation. Output pure JSON.',
      userPrompt: prompt,
    });

    if (aiResult && aiResult.aiSuggestion) {
      return {
        ...aiResult,
        approvedPrecedentText: approvedPrecedent?.finalApprovedClause || null,
        precedentMatch: approvedPrecedent || null,
      };
    }

    return this.fallbackNegotiation(clauseCategory, originalClause, approvedPrecedent);
  }

  fallbackNegotiation(category, originalClause, approvedPrecedent) {
    let aiSuggestion = '';
    let pros = [];
    let cons = [];
    let rationale = '';
    let compromiseOption = '';

    if (category === 'Liability') {
      aiSuggestion = 'Except for breaches of Section 4 (Confidentiality) and indemnification obligations under Section 9, each party\'s total aggregate liability arising out of or related to this Agreement shall be capped at the total amount of fees paid or payable by Customer under this Agreement in the twelve (12) months preceding the event giving rise to liability.';
      pros = [
        'Limits catastrophic balance-sheet exposure to a predictable 12-month trailing fee ceiling.',
        'Preserves mutual protection for confidentiality and intentional misconduct.',
        'Standard market convention recognized by commercial courts.'
      ];
      cons = [
        'Counterparty may seek a fixed dollar super-cap (e.g., $1,000,000) for data security incidents.'
      ];
      rationale = 'Uncapped liability is commercially unacceptable and violates company governance policy. A 12-month fee cap reflects standard commercial risk-sharing.';
      compromiseOption = 'Agree to a 2x multiple of annual contract fees specifically for documented gross negligence.';
    } else if (category === 'Indemnification') {
      aiSuggestion = 'Each party agrees to defend, indemnify, and hold harmless the other party and its officers from third-party claims arising solely from gross negligence, willful misconduct, or unauthorized intellectual property infringement.';
      pros = [
        'Establishes reciprocal bilateral indemnity rather than one-sided customer exposure.',
        'Restricts indemnification to culpable conduct rather than ordinary breach of warranty.'
      ];
      cons = [
        'Requires counterparty to assume cross-indemnity defense expenses.'
      ];
      rationale = 'Bilateral indemnification aligns with standard corporate risk parity.';
      compromiseOption = 'Customer agrees to indemnify for its customer data, provided Vendor indemnifies for SaaS platform availability.';
    } else {
      aiSuggestion = `Both parties agree to standard mutual commercial terms regarding ${category}, requiring 30 days prior written notice for material modifications.`;
      pros = ['Brings clause into alignment with corporate precedent standards.', 'Provides clear notice procedures.'];
      cons = ['Minor delay in unilateral operational adjustments.'];
      rationale = 'Standardizes contract governance with organizational precedent memory.';
      compromiseOption = 'Allow 15-day expedited cure window upon notice.';
    }

    return {
      aiSuggestion,
      pros,
      cons,
      rationale,
      compromiseOption,
      approvedPrecedentText: approvedPrecedent?.finalApprovedClause || null,
      precedentMatch: approvedPrecedent || null,
    };
  }
}

module.exports = new NegotiationAgent();
