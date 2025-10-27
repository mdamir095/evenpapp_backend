import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export class VendorFormValidator {
  /**
   * Validates ObjectId format
   */
  static validateObjectId(id: string, fieldName: string = 'id'): void {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} must be a valid MongoDB ObjectId`);
    }
  }

  /**
   * Validates vendor form data structure and common fields
   */
  static validateFormData(formData: Record<string, any>): void {
    if (!formData || typeof formData !== 'object') {
      throw new BadRequestException('formData must be a valid object');
    }

    // Optional: Validate common fields if they exist
    this.validateCommonFields(formData);
  }

  /**
   * Validates common form fields with proper types
   */
  private static validateCommonFields(formData: Record<string, any>): void {
    const validationErrors: string[] = [];

    // Validate experience if provided
    if (formData.experience !== undefined) {
      if (!Number.isInteger(formData.experience) || formData.experience < 0) {
        validationErrors.push('Experience must be a non-negative integer');
      }
    }

    // Validate pricing if provided
    if (formData.pricing !== undefined) {
      if (typeof formData.pricing === 'object') {
        if (formData.pricing.starting && (typeof formData.pricing.starting !== 'number' || formData.pricing.starting < 0)) {
          validationErrors.push('Starting pricing must be a non-negative number');
        }
        if (formData.pricing.premium && (typeof formData.pricing.premium !== 'number' || formData.pricing.premium < 0)) {
          validationErrors.push('Premium pricing must be a non-negative number');
        }
      } else if (typeof formData.pricing !== 'number' || formData.pricing < 0) {
        validationErrors.push('Pricing must be a non-negative number');
      }
    }

    // Validate contact details if provided
    if (formData.contactDetails !== undefined) {
      if (typeof formData.contactDetails !== 'object') {
        validationErrors.push('Contact details must be an object');
      } else {
        if (formData.contactDetails.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.contactDetails.email)) {
            validationErrors.push('Contact email must be a valid email address');
          }
        }
        
        if (formData.contactDetails.phone) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(formData.contactDetails.phone.replace(/[\s\-\(\)]/g, ''))) {
            validationErrors.push('Contact phone must be a valid phone number');
          }
        }
      }
    }

    // Validate arrays if provided
    if (formData.services !== undefined && !Array.isArray(formData.services)) {
      validationErrors.push('Services must be an array');
    }

    if (formData.equipment !== undefined && !Array.isArray(formData.equipment)) {
      validationErrors.push('Equipment must be an array');
    }

    if (formData.portfolio !== undefined && !Array.isArray(formData.portfolio)) {
      validationErrors.push('Portfolio must be an array');
    }

    if (formData.packages !== undefined) {
      if (!Array.isArray(formData.packages)) {
        validationErrors.push('Packages must be an array');
      } else {
        formData.packages.forEach((pkg: any, index: number) => {
          if (typeof pkg !== 'object') {
            validationErrors.push(`Package at index ${index} must be an object`);
          } else {
            if (!pkg.name) {
              validationErrors.push(`Package at index ${index} must have a name`);
            }
            if (pkg.price !== undefined && (typeof pkg.price !== 'number' || pkg.price < 0)) {
              validationErrors.push(`Package at index ${index} price must be a non-negative number`);
            }
          }
        });
      }
    }

    // Validate team size if provided
    if (formData.team_size !== undefined) {
      if (!Number.isInteger(formData.team_size) || formData.team_size <= 0) {
        validationErrors.push('Team size must be a positive integer');
      }
    }

    // Validate years in business if provided
    if (formData.years_in_business !== undefined) {
      if (!Number.isInteger(formData.years_in_business) || formData.years_in_business < 0) {
        validationErrors.push('Years in business must be a non-negative integer');
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(`Form data validation failed: ${validationErrors.join(', ')}`);
    }
  }

  /**
   * Sanitizes form data by removing potentially harmful content
   */
  static sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized = { ...formData };

    // Remove any fields that might contain scripts or HTML
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        // Basic XSS prevention - remove script tags and javascript: protocols
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });

    return sanitized;
  }

  /**
   * Extracts searchable text from form data for indexing
   */
  static extractSearchableContent(formData: Record<string, any>): string[] {
    const searchableFields = [
      'location',
      'description', 
      'services',
      'equipment',
      'certifications',
      'languages',
      'coverage_areas'
    ];

    const searchableContent: string[] = [];

    searchableFields.forEach(field => {
      if (formData[field]) {
        if (Array.isArray(formData[field])) {
          searchableContent.push(...formData[field].map(item => String(item)));
        } else if (typeof formData[field] === 'object') {
          // For nested objects
          Object.values(formData[field]).forEach(value => {
            if (typeof value === 'string') {
              searchableContent.push(value);
            }
          });
        } else {
          searchableContent.push(String(formData[field]));
        }
      }
    });

    return searchableContent.filter(content => content && content.trim().length > 0);
  }
}