'use strict';

/**
 * Middleware factory that checks whether the authenticated user has one of the
 * allowed roles.
 *
 * Usage:
 *   router.get('/admin-only', auth, checkRole('admin'), handler)
 *   router.get('/multi',      auth, checkRole('admin', 'manager'), handler)
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const userRole = req.user.role.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
      });
    }

    next();
  };
};

module.exports = checkRole;
