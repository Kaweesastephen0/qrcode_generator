const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export const validateEmail = (email) => emailRegex.test(email);
export const validatePassword = (password) => password && password.length >= 6;
export const validateFullName = (name) => name && name.length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
export const validatePhoneNumber = (phone) => phoneRegex.test(phone);

export const validateProfileData = (data) => {
  const errors = [];

  if (!data.companyName || data.companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }

  if (!data.projectsServices || data.projectsServices.trim().length === 0) {
    errors.push('Projects or services are required');
  }

  if (!data.phone || !validatePhoneNumber(data.phone)) {
    errors.push('Invalid phone number');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};