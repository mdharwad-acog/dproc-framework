/**
 * Manage context for large documents
 * Implements Article 2: Context window management
 */
export class ContextManager {
  private maxTokens: number;
  private tokensPerChar: number = 0.25; // Rough estimate: 1 token ≈ 4 chars

  constructor(maxTokens: number = 8000) {
    this.maxTokens = maxTokens;
  }

  /**
   * Estimate token count from text
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length * this.tokensPerChar);
  }

  /**
   * Check if text fits in context window
   */
  fitsInContext(text: string, reserveForOutput: number = 1000): boolean {
    const tokens = this.estimateTokens(text);
    return tokens <= this.maxTokens - reserveForOutput;
  }

  /**
   * Truncate text to fit in context window
   */
  truncate(text: string, reserveForOutput: number = 1000): string {
    const maxChars = Math.floor(
      (this.maxTokens - reserveForOutput) / this.tokensPerChar
    );

    if (text.length <= maxChars) {
      return text;
    }

    return text.substring(0, maxChars) + "\n\n[... truncated ...]";
  }

  /**
   * Split text into chunks that fit in context window
   */
  chunkText(
    text: string,
    reserveForOutput: number = 1000,
    overlap: number = 200
  ): string[] {
    const maxChars = Math.floor(
      (this.maxTokens - reserveForOutput) / this.tokensPerChar
    );

    if (text.length <= maxChars) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxChars, text.length);
      const chunk = text.substring(start, end);
      chunks.push(chunk);

      // Move start forward, with overlap
      start = end - overlap;

      // Avoid infinite loop on last chunk
      if (start + overlap >= text.length) {
        break;
      }
    }

    return chunks;
  }

  /**
   * Smart chunking by paragraphs
   */
  chunkByParagraphs(text: string, reserveForOutput: number = 1000): string[] {
    const maxChars = Math.floor(
      (this.maxTokens - reserveForOutput) / this.tokensPerChar
    );
    const paragraphs = text.split(/\n\n+/);

    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
      // If adding this paragraph exceeds limit, save current chunk
      if (currentChunk.length + para.length + 2 > maxChars) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }

        // If single paragraph is too large, split it
        if (para.length > maxChars) {
          const subChunks = this.chunkText(para, reserveForOutput, 100);
          chunks.push(...subChunks);
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      }
    }

    // Add last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Summarize and compress context
   */
  summarizeForContext(text: string, targetLength: number): string {
    if (text.length <= targetLength) {
      return text;
    }

    // Extract first and last portions
    const headSize = Math.floor(targetLength * 0.4);
    const tailSize = Math.floor(targetLength * 0.4);

    const head = text.substring(0, headSize);
    const tail = text.substring(text.length - tailSize);

    return head + "\n\n[... content omitted ...]\n\n" + tail;
  }

  /**
   * Calculate context usage percentage
   */
  getContextUsage(text: string): number {
    const tokens = this.estimateTokens(text);
    return (tokens / this.maxTokens) * 100;
  }
}
