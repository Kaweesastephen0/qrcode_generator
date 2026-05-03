// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
  PROFILE_NOT_FOUND: 'Business profile not found',
  QRCODE_NOT_FOUND: 'QR Code not found',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  PROFILE_CREATED: 'Business profile created successfully',
  PROFILE_UPDATED: 'Business profile updated successfully',
  PROFILE_DELETED: 'Business profile deleted successfully',
  USER_SUSPENDED: 'User suspended successfully',
  USER_ACTIVATED: 'User activated successfully',
};
