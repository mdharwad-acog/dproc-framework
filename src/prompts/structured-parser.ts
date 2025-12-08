import { z } from "zod";

/**
 * Parse structured output from LLM responses
 * Implements Article 2: Structured output parsing
 */
export class StructuredParser {
  /**
   * Extract JSON from markdown code blocks
   */
  static extractJSON(text: string): any {
    // Try to find JSON in code blocks first
    const jsonBlockMatch = text.match(/``````/);

    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1]);
      } catch (error) {
        throw new Error("Invalid JSON in code block");
      }
    }

    // Try to find raw JSON
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        throw new Error("Invalid JSON in response");
      }
    }

    throw new Error("No JSON found in response");
  }

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
   * Extract key-value pairs
   */
  static extractKeyValue(text: string): Record<string, string> {
    const pairs: Record<string, string> = {};
    const lines = text.split("\n");

    for (const line of lines) {
      // Match patterns like "Key: Value" or "**Key:** Value"
      const match = line.match(/^\*?\*?([^:*]+)\*?\*?:\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        pairs[key] = value;
      }
    }

    return pairs;
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
}
