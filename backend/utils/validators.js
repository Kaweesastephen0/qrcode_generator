// Email validation regex
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const validateEmail = (email) => {
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters
  return password && password.length >= 6;
};

export const validateFullName = (name) => {
  // Minimum 2 characters, no special characters
  return name && name.length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
};

export const validatePhoneNumber = (phone) => {
  // Allow various phone formats
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateProfileData = (data) => {
  const errors = [];

  if (!data.fullName || !validateFullName(data.fullName)) {
    errors.push('Invalid full name');
  }

  if (!data.position || data.position.trim().length === 0) {
    errors.push('Position is required');
  }

  if (!data.companyName || data.companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!data.phone || !validatePhoneNumber(data.phone)) {
    errors.push('Invalid phone number');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (data.website && !validateURL(data.website)) {
    errors.push('Invalid website URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
