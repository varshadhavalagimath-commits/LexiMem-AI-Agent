const AuditLog = require('../models/AuditLog');

const logAudit = async (req, { action, resourceType, resourceId, resourceTitle, details = {} }) => {
  try {
    const user = req?.user;
    const organizationId = req?.organizationId || user?.organizationId;

    if (!organizationId) return;

    await AuditLog.create({
      userId: user?._id,
      userName: user?.name || 'System / Automated Agent',
      userEmail: user?.email,
      organizationId,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : undefined,
      resourceTitle,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers ? req.headers['user-agent'] : 'Internal System',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log:', error.message);
  }
};

module.exports = { logAudit };
