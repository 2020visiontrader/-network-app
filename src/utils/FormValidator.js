// Form Validation Utility
// Real production utility for validating user input
export class FormValidator {
  static validateOnboardingForm(formData) {
    const errors = {};
    const requiredFields = [
      'linkedin_url', 'location_city', 'industry',
      'company_name', 'role', 'tags_or_interests'
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      } else if (typeof formData[field] === 'string' && formData[field].trim() === '') {
        errors[field] = `${field.replace('_', ' ')} cannot be empty`;
      }
    });

    // Special validation for tags
    if (formData.tags_or_interests) {
      if (Array.isArray(formData.tags_or_interests)) {
        if (formData.tags_or_interests.length === 0) {
          errors.tags_or_interests = 'At least one tag/interest is required';
        }
      } else if (typeof formData.tags_or_interests === 'string') {
        if (formData.tags_or_interests.trim() === '') {
          errors.tags_or_interests = 'At least one tag/interest is required';
        }
      }
    }

    // LinkedIn URL validation
    if (formData.linkedin_url && !this.validateLinkedInUrl(formData.linkedin_url)) {
      errors.linkedin_url = 'Please enter a valid LinkedIn profile URL';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateLinkedInUrl(url) {
    if (!url) return false;
    
    // Simple safety check
    if (typeof url !== 'string' || url.length > 2048) return false;
    
    // Simple, performant LinkedIn URL validation
    const pattern = /^https:\/\/(www\.)?linkedin\.com\/.+$/i;
    
    return pattern.test(url.trim());
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    const validation = {
      isValid: true,
      errors: []
    };

    if (password.length < 6) {
      validation.isValid = false;
      validation.errors.push('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one number');
    }

    return validation;
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove leading/trailing whitespace
    return input.trim()
      // Remove potentially dangerous characters
      .replace(/[<>\"']/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ');
  }

  static formatTags(tagsInput) {
    if (Array.isArray(tagsInput)) {
      return tagsInput
        .map(tag => this.sanitizeInput(tag))
        .filter(tag => tag.length > 0);
    }
    
    if (typeof tagsInput === 'string') {
      return tagsInput
        .split(',')
        .map(tag => this.sanitizeInput(tag))
        .filter(tag => tag.length > 0);
    }
    
    return [];
  }

  static validateProfileData(profileData) {
    const errors = {};

    // Validate individual fields
    if (profileData.full_name && profileData.full_name.length > 100) {
      errors.full_name = 'Full name is too long (max 100 characters)';
    }

    if (profileData.bio && profileData.bio.length > 500) {
      errors.bio = 'Bio is too long (max 500 characters)';
    }

    if (profileData.company_name && profileData.company_name.length > 100) {
      errors.company_name = 'Company name is too long (max 100 characters)';
    }

    if (profileData.location_city && profileData.location_city.length > 100) {
      errors.location_city = 'Location is too long (max 100 characters)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
