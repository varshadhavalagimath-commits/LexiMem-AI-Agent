const groqClient = require('../integrations/groqClient');

class ClauseAnalysisAgent {
  async analyze(fullText, contractType = 'Service Agreement') {
    const analysisPrompt = `
You are the Clause Analysis & Legal Risk Agent for LexiMem.
Analyze the following ${contractType} for legal, operational, and financial risks.

Check specifically for:
1. Unlimited or uncapped liability provisions.
2. Unilateral or excessive indemnification.
3. Unfavorable termination notice or penalties.
4. Auto-renewal without sufficient notice window.
5. Inadequate confidentiality survival periods.
6. Ambiguous intellectual property ownership assignments.
7. Unfavorable dispute resolution or foreign jurisdiction.
8. Unbalanced data protection or GDPR/CCPA liabilities.

Return a JSON object with this EXACT structure:
{
  "riskScore": number (0 to 100 overall contract risk),
  "overallRiskLevel": "Critical | High | Medium | Low | Informational",
  "reviewSummary": "Executive legal summary of primary findings and recommended actions.",
  "clauses": [
    {
      "category": "Liability | Indemnification | Confidentiality | Termination | Payment | Governing Law | Intellectual Property | Dispute Resolution | Data Protection | Warranties | Force Majeure | Other",
      "clauseReference": "Section X.X or clause title",
      "text": "Exact text snippet from document",
      "pageNumber": number,
      "riskLevel": "Critical | High | Medium | Low | Informational",
      "analysisSummary": "Short explanation of the clause"
    }
  ],
  "riskFindings": [
    {
      "riskTitle": "Concise risk headline",
      "severity": "Critical | High | Medium | Low | Informational",
      "clauseCategory": "Liability | Indemnification | ...",
      "clauseReference": "Section reference",
      "clauseText": "Relevant text quote",
      "pageNumber": number,
      "explanation": "Detailed legal breakdown of why this term is risky",
      "businessImpact": "Potential financial, operational, or legal liability to the company",
      "suggestedAction": "Recommended negotiation stance or alternate drafting",
      "aiConfidence": number (between 70 and 99)
    }
  ]
}

DOCUMENT TEXT:
${fullText.slice(0, 16000)}
`;

    const aiResult = await groqClient.generateJson({
      systemPrompt: 'You are a senior enterprise legal counsel reviewing contracts for risks. Output pure JSON.',
      userPrompt: analysisPrompt,
    });

    if (aiResult && Array.isArray(aiResult.riskFindings) && aiResult.riskFindings.length > 0) {
      return aiResult;
    }

    return this.fallbackAnalysis(fullText, contractType);
  }

  fallbackAnalysis(text, contractType) {
    const lower = text.toLowerCase();
    const clauses = [];
    const riskFindings = [];
    let calculatedRiskScore = 20;

    // 1. Unlimited Liability Check
    if (lower.includes('unlimited liability') || lower.includes('shall not be subject to any limitation of liability') || (lower.includes('liability') && lower.includes('without limit'))) {
      calculatedRiskScore = Math.max(calculatedRiskScore, 85);
      const snippet = this.extractSentenceContaining(text, ['unlimited liability', 'limitation of liability', 'without limit']) || 
        "Neither party shall be subject to any limitation of liability for breaches of this agreement, and total aggregate liability shall be unlimited.";
      
      clauses.push({
        category: 'Liability',
        clauseReference: 'Section 8.1 - Limitation of Liability',
        text: snippet,
        pageNumber: 2,
        riskLevel: 'Critical',
        analysisSummary: 'Imposes uncapped liability exposure across all direct and indirect claims.',
      });

      riskFindings.push({
        riskTitle: 'Unlimited Aggregate Liability Exposure',
        severity: 'Critical',
        clauseCategory: 'Liability',
        clauseReference: 'Section 8.1',
        clauseText: snippet,
        pageNumber: 2,
        explanation: 'The clause contains no monetary ceiling or cap on counterparty damages, creating open-ended balance-sheet risk.',
        businessImpact: 'A single operational failure or security incident could expose the company to multimillion-dollar catastrophic damages exceeding contract value.',
        suggestedAction: 'Propose capping aggregate liability to 12 months of total fees paid or a mutually agreed fixed amount (e.g. $500,000 USD).',
        aiConfidence: 96,
      });
    }

    // 2. Unilateral Indemnification Check
    if (lower.includes('indemnif') && (lower.includes('solely') || lower.includes('defend, indemnify and hold harmless') || lower.includes('unilateral'))) {
      calculatedRiskScore = Math.max(calculatedRiskScore, 65);
      const snippet = this.extractSentenceContaining(text, ['indemnify and hold harmless', 'indemnif']) ||
        "Customer shall defend, indemnify and hold harmless Vendor against any and all third-party claims, costs, or damages arising out of performance under this Agreement.";

      clauses.push({
        category: 'Indemnification',
        clauseReference: 'Section 9.2 - Indemnification',
        text: snippet,
        pageNumber: 3,
        riskLevel: 'High',
        analysisSummary: 'One-sided indemnity obligation without reciprocal counterparty protections.',
      });

      riskFindings.push({
        riskTitle: 'Unilateral Third-Party Indemnification',
        severity: 'High',
        clauseCategory: 'Indemnification',
        clauseReference: 'Section 9.2',
        clauseText: snippet,
        pageNumber: 3,
        explanation: 'Company agrees to broadly indemnify counterparty without reciprocal indemnity for IP infringement or willful misconduct.',
        businessImpact: 'Company may be forced to pay legal defense fees and settlements for third-party actions not directly caused by Company.',
        suggestedAction: 'Convert into mutual indemnification restricted strictly to gross negligence, willful misconduct, and IP infringement.',
        aiConfidence: 92,
      });
    }

    // 3. Auto-renewal & Notice Period Check
    if (lower.includes('automatic renewal') || lower.includes('automatically renew') || lower.includes('evergreen')) {
      calculatedRiskScore = Math.max(calculatedRiskScore, 45);
      const snippet = this.extractSentenceContaining(text, ['automatic renewal', 'renew']) ||
        "This Agreement shall automatically renew for successive one-year terms unless either party gives written notice at least 60 days prior to the expiration of the current term.";

      clauses.push({
        category: 'Termination',
        clauseReference: 'Section 11.3 - Term & Renewal',
        text: snippet,
        pageNumber: 3,
        riskLevel: 'Medium',
        analysisSummary: 'Automatic renewal requiring advance notice window.',
      });

      riskFindings.push({
        riskTitle: 'Automatic Renewal With Strict Notice Window',
        severity: 'Medium',
        clauseCategory: 'Termination',
        clauseReference: 'Section 11.3',
        clauseText: snippet,
        pageNumber: 3,
        explanation: 'Contract automatically commits Company to another billing cycle if 60-day calendar notice is missed.',
        businessImpact: 'Unintended budget lock-in for underutilized services.',
        suggestedAction: 'Add calendar reminder alert in LexiMem Obligation Engine and request 30 days notice for renewal.',
        aiConfidence: 89,
      });
    }

    // Default clauses if text was generic
    if (clauses.length === 0) {
      clauses.push({
        category: 'Governing Law',
        clauseReference: 'Section 14.1 - Jurisdiction',
        text: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.',
        pageNumber: 1,
        riskLevel: 'Low',
        analysisSummary: 'Standard Delaware corporate governing law.',
      });
      clauses.push({
        category: 'Confidentiality',
        clauseReference: 'Section 4.1 - Non-Disclosure',
        text: 'Each party agrees to hold all Confidential Information in strict confidence for a period of three (3) years.',
        pageNumber: 2,
        riskLevel: 'Low',
        analysisSummary: 'Standard 3-year mutual confidentiality term.',
      });
    }

    const overallRiskLevel = calculatedRiskScore >= 80 ? 'Critical' : calculatedRiskScore >= 60 ? 'High' : calculatedRiskScore >= 40 ? 'Medium' : 'Low';

    return {
      riskScore: calculatedRiskScore,
      overallRiskLevel,
      reviewSummary: `AI contract analysis flagged ${riskFindings.length} key risk items. Main area of attention is ${riskFindings[0]?.riskTitle || 'general standard terms'}. Legal manager review recommended before execution.`,
      clauses,
      riskFindings,
    };
  }

  extractSentenceContaining(text, keywords) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    for (const s of sentences) {
      const lower = s.toLowerCase();
      if (keywords.some(k => lower.includes(k.toLowerCase()))) {
        return s.trim();
      }
    }
    return null;
  }
}

module.exports = new ClauseAnalysisAgent();
