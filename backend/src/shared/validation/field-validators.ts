import { TRPCError } from '@trpc/server';

/**
 * Field Validators Utility
 * 
 * Centralized validation utilities to eliminate code duplication and provide
 * consistent validation logic across the application. These validators throw
 * appropriate TRPC errors with standardized messages.
 */

/* ========================================
 * Validation Patterns
 * ======================================== */

/**
 * RFC 5322 compliant email regex pattern
 * Validates basic email format without overly complex rules
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ========================================
 * Field Validators Class
 * ======================================== */

export class FieldValidators {
  
  /* ========================================
   * Email Validation
   * ======================================== */
  
  /**
   * Validates email format using RFC 5322 compliant regex
   * 
   * @param email - The email string to validate
   * @throws {TRPCError} When email format is invalid
   * 
   * @example
   * ```typescript
   * FieldValidators.validateEmail('user@example.com'); // Valid
   * FieldValidators.validateEmail('invalid-email');    // Throws TRPCError
   * ```
   */
  static validateEmail(email: string): void {
    if (!EMAIL_REGEX.test(email)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid email format',
      });
    }
  }

  /* ========================================
   * String Length Validation
   * ======================================== */

  /**
   * Validates string length with trimming and custom field name for errors
   * 
   * @param value - The string value to validate
   * @param fieldName - The field name for error messages (e.g., 'name', 'phone')
   * @param maxLength - Maximum allowed length after trimming
   * @throws {TRPCError} When value exceeds maximum length
   * 
   * @example
   * ```typescript
   * FieldValidators.validateLength('John Doe', 'name', 255);        // Valid
   * FieldValidators.validateLength('A'.repeat(300), 'name', 255);   // Throws TRPCError
   * ```
   */
  static validateLength(value: string, fieldName: string, maxLength: number): void {
    if (value.trim().length > maxLength) {
      const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `${capitalizedFieldName} must be ${maxLength} characters or less`,
      });
    }
  }

  /* ========================================
   * Required Field Validation
   * ======================================== */

  /**
   * Validates that a required string field is not empty after trimming
   * 
   * @param value - The string value to validate
   * @param fieldName - The field name for error messages
   * @throws {TRPCError} When value is empty after trimming
   * 
   * @example
   * ```typescript
   * FieldValidators.validateRequired('John Doe', 'name');  // Valid
   * FieldValidators.validateRequired('   ', 'name');       // Throws TRPCError
   * FieldValidators.validateRequired('', 'name');          // Throws TRPCError
   * ```
   */
  static validateRequired(value: string, fieldName: string): void {
    if (!value.trim()) {
      const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `${capitalizedFieldName} cannot be empty`,
      });
    }
  }

  /* ========================================
   * Combined Validation Methods
   * ======================================== */

  /**
   * Validates optional email - only validates format if email is provided
   * 
   * @param email - The optional email to validate
   * @throws {TRPCError} When email is provided but format is invalid
   * 
   * @example
   * ```typescript
   * FieldValidators.validateOptionalEmail('user@example.com'); // Valid
   * FieldValidators.validateOptionalEmail(null);               // Valid (optional)
   * FieldValidators.validateOptionalEmail('invalid');          // Throws TRPCError
   * ```
   */
  static validateOptionalEmail(email: string | null | undefined): void {
    if (email) {
      this.validateEmail(email);
    }
  }

  /**
   * Validates optional string length - only validates if value is provided
   * 
   * @param value - The optional string value to validate
   * @param fieldName - The field name for error messages
   * @param maxLength - Maximum allowed length after trimming
   * @throws {TRPCError} When value is provided but exceeds maximum length
   * 
   * @example
   * ```typescript
   * FieldValidators.validateOptionalLength('John', 'name', 255);  // Valid
   * FieldValidators.validateOptionalLength(null, 'name', 255);    // Valid (optional)
   * FieldValidators.validateOptionalLength('A'.repeat(300), 'name', 255); // Throws TRPCError
   * ```
   */
  static validateOptionalLength(
    value: string | null | undefined, 
    fieldName: string, 
    maxLength: number
  ): void {
    if (value) {
      this.validateLength(value, fieldName, maxLength);
    }
  }
}