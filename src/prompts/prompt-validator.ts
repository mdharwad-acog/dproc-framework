import { z } from "zod";

/**
 * Validate prompt inputs before rendering
 * Implements Article 2: Input validation standards
 */
export class PromptValidator {
  /**
   * Validate that all required variables are present
   */
  static validateVariables(
    required: string[],
    provided: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const missing = required.filter((key) => !(key in provided));

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Validate variable types using Zod schema
   */
  static validateTypes(
    schema: z.ZodObject<any>,
    data: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    try {
      schema.parse(data);
      return { valid: true, errors: [] };
    } catch (error: any) {
      const errors = error.errors?.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`
      ) || [error.message];

      return { valid: false, errors };
    }
  }

  /**
   * Validate that text fields are not empty or too long
   */
  static validateTextFields(
    data: Record<string, any>,
    config: { maxLength?: number; minLength?: number } = {}
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxLength = config.maxLength || 10000;
    const minLength = config.minLength || 1;

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "string") {
        if (value.length < minLength) {
          errors.push(`${key}: text too short (min ${minLength} chars)`);
        }
        if (value.length > maxLength) {
          errors.push(`${key}: text too long (max ${maxLength} chars)`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that arrays have required size
   */
  static validateArrays(
    data: Record<string, any>,
    config: { [key: string]: { min?: number; max?: number } }
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    Object.entries(config).forEach(([key, constraints]) => {
      const value = data[key];

      if (!Array.isArray(value)) {
        errors.push(`${key}: expected array, got ${typeof value}`);
        return;
      }

      if (constraints.min !== undefined && value.length < constraints.min) {
        errors.push(`${key}: array too short (min ${constraints.min} items)`);
      }

      if (constraints.max !== undefined && value.length > constraints.max) {
        errors.push(`${key}: array too long (max ${constraints.max} items)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Comprehensive validation
   */
  static validate(
    config: {
      required?: string[];
      schema?: z.ZodObject<any>;
      textFields?: { maxLength?: number; minLength?: number };
      arrays?: { [key: string]: { min?: number; max?: number } };
    },
    data: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    // Check required fields
    if (config.required) {
      const { valid, missing } = this.validateVariables(config.required, data);
      if (!valid) {
        allErrors.push(...missing.map((m) => `Missing required field: ${m}`));
      }
    }

    // Check types
    if (config.schema) {
      const { valid, errors } = this.validateTypes(config.schema, data);
      if (!valid) {
        allErrors.push(...errors);
      }
    }

    // Check text fields
    if (config.textFields) {
      const { valid, errors } = this.validateTextFields(
        data,
        config.textFields
      );
      if (!valid) {
        allErrors.push(...errors);
      }
    }

    // Check arrays
    if (config.arrays) {
      const { valid, errors } = this.validateArrays(data, config.arrays);
      if (!valid) {
        allErrors.push(...errors);
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}
