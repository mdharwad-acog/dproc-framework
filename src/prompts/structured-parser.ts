import { z } from "zod";

/**
 * Parse structured output from LLM responses
 * Implements Article 2: Structured output parsing
 */
export class StructuredParser {
  /**
   * Extract JSON from markdown code blocks
   */

  /**
   * Parse JSON with schema validation
   */
  static parseJSON<T>(text: string, schema: z.ZodSchema<T>): T {
    const json = this.extractJSON(text);
    return schema.parse(json);
  }

  /**
   * Extract a list from markdown
   */
  static extractList(text: string): string[] {
    const lines = text.split("\n");
    const items: string[] = [];

    for (const line of lines) {
      // Match bullet points: -, *, 1., etc.
      const match = line.match(/^\s*[-*•]|\d+\.\s+(.+)/);
      if (match) {
        items.push(match[1] || line.replace(/^\s*[-*•]|\d+\.\s+/, "").trim());
      }
    }

    return items.filter((item) => item.length > 0);
  }

  /**
   * Extract a table from markdown
   */
  static extractTable(text: string): Array<Record<string, string>> {
    const lines = text.split("\n").filter((line) => line.includes("|"));

    if (lines.length < 2) {
      return [];
    }

    // Parse header
    const headers = lines[0]
      .split("|")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    // Skip separator line
    const dataLines = lines.slice(2);

    // Parse rows
    return dataLines
      .map((line) => {
        const values = line
          .split("|")
          .map((v) => v.trim())
          .filter((_, idx) => idx > 0 && idx <= headers.length);

        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });

        return row;
      })
      .filter((row) => Object.values(row).some((v) => v.length > 0));
  }

  /**
   * Extract sections from markdown
   */
  static extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split("\n");

    let currentSection = "intro";
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check if line is a header
      const headerMatch = line.match(/^#+\s+(.+)/);

      if (headerMatch) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n").trim();
        }

        // Start new section
        currentSection = headerMatch[1].toLowerCase().replace(/\s+/g, "_");
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join("\n").trim();
    }

    return sections;
  }

  /**
   * Parse a numbered list with descriptions
   */
  static extractNumberedItems(
    text: string
  ): Array<{ number: number; title: string; description: string }> {
    const items: Array<{ number: number; title: string; description: string }> =
      [];
    const lines = text.split("\n");

    let currentItem: any = null;

    for (const line of lines) {
      // Match numbered items: "1. Title" or "1) Title"
      const match = line.match(/^(\d+)[.)]\s+(.+)/);

      if (match) {
        // Save previous item
        if (currentItem) {
          items.push(currentItem);
        }

        // Start new item
        currentItem = {
          number: parseInt(match[1]),
          title: match[2].trim(),
          description: "",
        };
      } else if (currentItem && line.trim().length > 0) {
        // Add to current item's description
        currentItem.description +=
          (currentItem.description ? " " : "") + line.trim();
      }
    }

    // Save last item
    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  }

  // Update the extractJSON method:
  // In src/prompts/structured-parser.ts, update extractJSON:

  /**
   * Extract JSON from text (handles code blocks and inline JSON)
   */
  static extractJSON(text: string): any {
    // --- Phase 1: Try to extract from Markdown Code Blocks ---

    // Use a single, comprehensive regex to capture content inside fences (```)
    // It looks for any content ([\s\S]*?) between three backticks, optionally preceded
    // by a language tag (like 'json'). It captures the content into group 1.
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;

    const match = text.match(codeBlockRegex);

    if (match && match[1]) {
      const jsonStr = match[1].trim();

      // Check if the extracted string looks like JSON (starts with { or [)
      if (jsonStr.startsWith("{") || jsonStr.startsWith("[")) {
        try {
          return JSON.parse(jsonStr);
        } catch (error: any) {
          // If parsing fails from the code block, fall through to Phase 2
          console.warn("Code block content found but failed to parse as JSON.");
        }
      }
    }

    // --- Phase 2: Fallback to find standalone JSON object or array ---

    // Use a global regex to find ALL occurrences of valid-looking top-level JSON structures.
    // It searches for either an object ({...}) OR an array ([...]).
    // Note: This pattern is non-greedy and includes newlines, making it much safer than the original.
    const jsonMatches = text.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])/g);

    if (jsonMatches) {
      for (const jsonStr of jsonMatches) {
        try {
          const parsed = JSON.parse(jsonStr.trim());

          // Ensure the parsed result is an object or array (and not null)
          if (typeof parsed === "object" && parsed !== null) {
            return parsed;
          }
        } catch (error: any) {
          // Parsing failed for this match, continue to the next one
          continue;
        }
      }
    }

    // If both phases failed
    throw new Error("No valid JSON found in text");
  }

  // Update extractKeyValue method:
  static extractKeyValue(text: string): Record<string, string> {
    const result: Record<string, string> = {};

    // Match patterns like "**Key:** Value" or "Key: Value"
    const patterns = [
      /\*\*([^*:]+):\*\*\s*(.+)/g, // **Key:** Value
      /\*\*([^*:]+):\s*\*\*(.+)/g, // **Key: **Value
      /([A-Za-z0-9_\s]+):\s*(.+)/g, // Key: Value
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const key = match[1].trim().replace(/\s+/g, "_");
        const value = match[2].trim();
        if (key && value && !result[key]) {
          result[key] = value;
        }
      }
    }

    return result;
  }
}
