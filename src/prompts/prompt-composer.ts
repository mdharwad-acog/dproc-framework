import { PromptLibrary } from "./prompt-library.js";

/**
 * Compose complex prompts by chaining multiple templates
 * Implements Article 2: Multi-step reasoning
 */
export class PromptComposer {
  private steps: Array<{
    name: string;
    template: string;
    variables: Record<string, any>;
  }> = [];

  /**
   * Add a step to the composition
   */
  addStep(
    name: string,
    template: string,
    variables: Record<string, any> = {}
  ): this {
    this.steps.push({ name, template, variables });
    return this;
  }

  /**
   * Add a step from the prompt library
   */
  addLibraryStep(
    category: string,
    promptName: string,
    variables: Record<string, any> = {}
  ): this {
    const template = PromptLibrary.load(category, promptName);
    return this.addStep(`${category}/${promptName}`, template, variables);
  }

  /**
   * Build the final composed prompt
   */
  compose(): string {
    if (this.steps.length === 0) {
      throw new Error("No steps added to prompt composer");
    }

    if (this.steps.length === 1) {
      return this.steps[0].template;
    }

    // Multi-step prompt
    let composed = "# Multi-Step Analysis\n\n";
    composed += "Complete the following analysis steps in order:\n\n";

    this.steps.forEach((step, idx) => {
      composed += `## Step ${idx + 1}: ${step.name}\n\n`;
      composed += `${step.template}\n\n`;

      if (idx < this.steps.length - 1) {
        composed += `---\n\n`;
      }
    });

    return composed;
  }

  /**
   * Get individual steps (for separate LLM calls)
   */
  getSteps(): Array<{
    name: string;
    template: string;
    variables: Record<string, any>;
  }> {
    return this.steps;
  }

  /**
   * Clear all steps
   */
  clear(): void {
    this.steps = [];
  }
}
