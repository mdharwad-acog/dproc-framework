import { marked } from "marked";
import createDebug from "debug";

const debug = createDebug("framework:html");

export class HtmlRenderer {
  async convert(markdown: string): Promise<string> {
    debug("Converting markdown to HTML");

    const html = await marked.parse(markdown);
    return this.wrapWithCSS(html);
  }

  private wrapWithCSS(body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #1e40af;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    h3 {
      color: #4b5563;
      margin-top: 30px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px 16px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #1f2937;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    tr:hover {
      background-color: #f3f4f6;
    }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 20px 0;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      padding-left: 20px;
      margin-left: 0;
      color: #4b5563;
      font-style: italic;
    }
    ul, ol {
      margin: 16px 0;
      padding-left: 30px;
    }
    li {
      margin: 8px 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 40px 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
      h1, h2 {
        page-break-after: avoid;
      }
      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
  }
}
