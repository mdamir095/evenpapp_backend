import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'typeorm';

export class VenueFormValidator {
  /**
   * Validates ObjectId format
   */
  static validateObjectId(id: string, fieldName: string = 'id'): void {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`${fieldName} must be a valid MongoDB ObjectId`);
    }
  }

  /**
   * Validates venue form data structure and common fields
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

    // Validate capacity if provided
    if (formData.capacity !== undefined) {
      if (!Number.isInteger(formData.capacity) || formData.capacity <= 0) {
        validationErrors.push('Capacity must be a positive integer');
      }
    }

    // Validate pricing if provided
    if (formData.pricing !== undefined) {
      if (typeof formData.pricing !== 'number' || formData.pricing < 0) {
        validationErrors.push('Pricing must be a non-negative number');
      }
    }

    // Validate email if provided
    if (formData.contactEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        validationErrors.push('Contact email must be a valid email address');
      }
    }

    // Validate phone if provided
    if (formData.contactPhone !== undefined) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.contactPhone.replace(/[\s\-\(\)]/g, ''))) {
        validationErrors.push('Contact phone must be a valid phone number');
      }
    }

    // Validate coordinates if provided
    if (formData.latitude !== undefined) {
      if (typeof formData.latitude !== 'number' || formData.latitude < -90 || formData.latitude > 90) {
        validationErrors.push('Latitude must be a number between -90 and 90');
      }
    }

    if (formData.longitude !== undefined) {
      if (typeof formData.longitude !== 'number' || formData.longitude < -180 || formData.longitude > 180) {
        validationErrors.push('Longitude must be a number between -180 and 180');
      }
    }

    // Validate arrays if provided
    if (formData.amenities !== undefined) {
      if (!Array.isArray(formData.amenities)) {
        validationErrors.push('Amenities must be an array');
      }
    }

    if (formData.features !== undefined) {
      if (!Array.isArray(formData.features)) {
        validationErrors.push('Features must be an array');
      }
    }

    if (formData.images !== undefined) {
      if (!Array.isArray(formData.images)) {
        validationErrors.push('Images must be an array');
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
      'managerName',
      'address',
      'amenities',
      'features'
    ];

    const searchableContent: string[] = [];

    searchableFields.forEach(field => {
      if (formData[field]) {
        if (Array.isArray(formData[field])) {
          searchableContent.push(...formData[field].map(item => String(item)));
        } else if (typeof formData[field] === 'object') {
          // For nested objects like address
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