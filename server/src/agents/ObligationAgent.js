const groqClient = require('../integrations/groqClient');

class ObligationAgent {
  async extractObligations(contractText, contractMeta = {}) {
    const prompt = `
You are the Contract Obligation & Deadline Extraction Agent for LexiMem.
Analyze this legal contract and extract all specific operational, financial, and compliance obligations.

IMPORTANT RULE:
Do NOT assume a contract's renewal notice deadline is the same as its expiration date.
Calculate the notice deadline based on the notice period requirement (e.g. 30 or 60 days BEFORE expiry).

Return a JSON array of objects:
[
  {
    "description": "Clear description of the contractual obligation",
    "category": "payment | service_delivery | renewal_notice | confidentiality | reporting | maintenance | termination_notice | compliance | other",
    "priority": "critical | high | medium | low",
    "relativeDueDateDays": number (days from effective date, e.g. 30, 90, 335),
    "suggestedResponsibleRole": "Finance | Legal Counsel | Engineering Lead | Operations Manager",
    "noticePeriodDays": number or null
  }
]

CONTRACT TEXT:
${contractText.slice(0, 14000)}
`;

    const aiResult = await groqClient.generateJson({
      systemPrompt: 'You are a legal operations analyst extracting compliance obligations. Return JSON array under "obligations" key.',
      userPrompt: prompt,
    });

    if (aiResult && Array.isArray(aiResult.obligations) && aiResult.obligations.length > 0) {
      return this.formatObligations(aiResult.obligations, contractMeta);
    }

    return this.fallbackObligations(contractText, contractMeta);
  }

  formatObligations(rawList, contractMeta) {
    const effective = contractMeta.effectiveDate ? new Date(contractMeta.effectiveDate) : new Date();
    const expiry = contractMeta.expirationDate ? new Date(contractMeta.expirationDate) : new Date(effective.getTime() + 365 * 24 * 3600 * 1000);

    return rawList.map(item => {
      let dueDate;
      if (item.category === 'renewal_notice') {
        const noticeDays = item.noticePeriodDays || contractMeta.renewalNoticePeriodDays || 30;
        dueDate = new Date(expiry.getTime() - (noticeDays * 24 * 3600 * 1000));
      } else {
        const days = item.relativeDueDateDays || 30;
        dueDate = new Date(effective.getTime() + (days * 24 * 3600 * 1000));
      }

      return {
        description: item.description,
        category: item.category,
        dueDate,
        priority: item.priority || 'medium',
        status: dueDate < new Date() ? 'overdue' : 'pending',
        assignedName: item.suggestedResponsibleRole || 'Legal & Compliance Team',
      };
    });
  }

  fallbackObligations(text, contractMeta) {
    const effective = contractMeta.effectiveDate ? new Date(contractMeta.effectiveDate) : new Date();
    const expiry = contractMeta.expirationDate ? new Date(contractMeta.expirationDate) : new Date(effective.getTime() + 365 * 24 * 3600 * 1000);
    const noticeDays = contractMeta.renewalNoticePeriodDays || 30;
    const renewalNoticeDate = new Date(expiry.getTime() - (noticeDays * 24 * 3600 * 1000));

    return [
      {
        description: `Deliver written Renewal or Non-Renewal Notice ${noticeDays} days prior to contract expiration date.`,
        category: 'renewal_notice',
        dueDate: renewalNoticeDate,
        priority: 'critical',
        status: renewalNoticeDate < new Date() ? 'overdue' : 'pending',
        assignedName: 'Legal Operations',
      },
      {
        description: 'Remit initial software implementation and licensing fees within Net 30 days of billing.',
        category: 'payment',
        dueDate: new Date(effective.getTime() + 30 * 24 * 3600 * 1000),
        priority: 'high',
        status: 'pending',
        assignedName: 'Finance Department',
      },
      {
        description: 'Complete quarterly SOC2 Type II compliance audit report delivery to counterparty.',
        category: 'reporting',
        dueDate: new Date(effective.getTime() + 90 * 24 * 3600 * 1000),
        priority: 'medium',
        status: 'pending',
        assignedName: 'Compliance Officer',
      },
      {
        description: 'Conduct annual service-level security review and access credential rotation.',
        category: 'maintenance',
        dueDate: new Date(effective.getTime() + 180 * 24 * 3600 * 1000),
        priority: 'low',
        status: 'pending',
        assignedName: 'IT Operations',
      },
    ];
  }
}

module.exports = new ObligationAgent();
