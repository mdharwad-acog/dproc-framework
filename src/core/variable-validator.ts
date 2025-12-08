import { z } from "zod";
import { PromptValidator } from "../prompts/prompt-validator.js";

/**
 * Validate variables before prompt rendering
 * Implements Article 2: Variable validation standards
 */
export class VariableValidator {
  /**
   * Define validation schema for a variable
   */
  static createSchema(
    type: "string" | "number" | "boolean" | "array" | "object"
  ): z.ZodTypeAny {
    switch (type) {
      case "string":
        return z.string();
      case "number":
        return z.number();
      case "boolean":
        return z.boolean();
      case "array":
        return z.array(z.any());
      case "object":
        return z.record(z.string(), z.any());
      default:
        return z.any();
    }
  }

  /**
   * Validate a single variable
   */
  static validateVariable(
    name: string,
    value: any,
    config: {
      type: "string" | "number" | "boolean" | "array" | "object";
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    }
  ): { valid: boolean; error?: string } {
    // Check if required
    if (config.required && (value === null || value === undefined)) {
      return { valid: false, error: `${name} is required` };
    }

    // If not required and empty, skip validation
    if (!config.required && (value === null || value === undefined)) {
      return { valid: true };
    }

    // Type validation
    const schema = this.createSchema(config.type);
    try {
      schema.parse(value);
    } catch (error: any) {
      return { valid: false, error: `${name}: ${error.message}` };
    }

    // String-specific validation
    if (config.type === "string" && typeof value === "string") {
      if (config.minLength && value.length < config.minLength) {
        return {
          valid: false,
          error: `${name}: too short (min ${config.minLength} chars)`,
        };
      }
      if (config.maxLength && value.length > config.maxLength) {
        return {
          valid: false,
          error: `${name}: too long (max ${config.maxLength} chars)`,
        };
      }
    }

    // Number-specific validation
    if (config.type === "number" && typeof value === "number") {
      if (config.min !== undefined && value < config.min) {
        return {
          valid: false,
          error: `${name}: too small (min ${config.min})`,
        };
      }
      if (config.max !== undefined && value > config.max) {
        return {
          valid: false,
          error: `${name}: too large (max ${config.max})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate all variables for a prompt
   */
  static validateAll(
    variables: Record<string, any>,
    schema: Record<
      string,
      {
        type: "string" | "number" | "boolean" | "array" | "object";
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
      }
    >
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate each variable
    Object.entries(schema).forEach(([name, config]) => {
      const value = variables[name];
      const result = this.validateVariable(name, value, config);

      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
