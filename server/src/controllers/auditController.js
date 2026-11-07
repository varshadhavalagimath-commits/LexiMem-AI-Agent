const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, limit = 50, page = 1 } = req.query;
    const filter = { organizationId: req.organizationId };

    if (action && action !== 'All') {
      filter.action = action;
    }
    if (resourceType && resourceType !== 'All') {
      filter.resourceType = resourceType;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
};
