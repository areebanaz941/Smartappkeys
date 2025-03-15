// middleware/authorization.js - Role-based authorization middleware

const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors');
const logger = require('../utils/logger');

/**
 * Middleware to authorize users based on their roles
 * 
 * @param {...string} roles - Allowed roles for the route
 * @returns {function} Express middleware function
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists (should be set by authentication middleware)
    if (!req.user) {
      logger.error('User object not found in request. Authentication middleware might not be applied.', {
        path: req.path,
        method: req.method
      });
      throw new UnauthenticatedError('Authentication required');
    }

    // Check if user has the required role
    if (!roles.includes(req.user.userType)) {
      logger.warn(`User ${req.user.userId} with role ${req.user.userType} attempted to access a resource restricted to roles: ${roles.join(', ')}`, {
        path: req.path,
        method: req.method
      });
      
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to authorize access to a resource based on resource ownership
 * 
 * @param {function} getResourceOwnerId - Function to extract owner ID from the resource
 * @returns {function} Express middleware function
 */
const authorizeResourceAccess = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Check if user object exists
      if (!req.user) {
        throw new UnauthenticatedError('Authentication required');
      }

      // Get the owner ID of the resource
      const resourceOwnerId = await getResourceOwnerId(req);
      
      // Check if the user is the owner or an admin
      if (req.user.userId !== resourceOwnerId && req.user.userType !== 'admin') {
        logger.warn(`User ${req.user.userId} attempted to access a resource owned by ${resourceOwnerId}`, {
          path: req.path,
          method: req.method
        });
        
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeRoles,
  authorizeResourceAccess
};