import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import * as runtime from "react/jsx-runtime";
import { compile, run } from "@mdx-js/mdx";

// Import MDX components - adjust path based on your build output
const components = {
  KPI: ({ label, value, title, ...props }: any) => {
    const displayTitle = title || label; // Support both title and label
    console.log("KPI props:", { label, value, title, ...props }); // Debug log
    return (
      <div className="kpi-card kpi-blue">
        <div className="kpi-content">
          {displayTitle && <div className="kpi-title">{displayTitle}</div>}
          <div className="kpi-value">{value || 0}</div>
        </div>
      </div>
    );
  },
  KPIGrid: ({ children }: any) => (
    <div className="kpi-grid kpi-grid-3">{children}</div>
  ),
  Callout: ({ type = "info", children }: any) => {
    const icons: Record<string, string> = {
      info: "ℹ️",
      warning: "⚠️",
      success: "✅",
      error: "❌",
    };
    return (
      <div className={`callout callout-${type}`}>
        <div className="callout-icon">{icons[type]}</div>
        <div className="callout-content">
          <div className="callout-body">{children}</div>
        </div>
      </div>
    );
  },
  DataTable: ({ data, caption }: any) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div>No data available</div>;
    }
    return (
      <div className="data-table-container">
        {caption && <div className="data-table-caption">{caption}</div>}
        <table className="data-table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i}>
                {Object.values(row).map((val: any, j: number) => (
                  <td key={j}>{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
  Metric: ({ label, value }: any) => (
    <div className="metric">
      <span className="metric-label">{label}:</span>{" "}
      <span className="metric-value">{value}</span>
    </div>
  ),
};

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<any[]>([]);
  const [Content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api
        .listReports(id)
        .then(async (data) => {
          setReports(data);

          // Load the HTML file instead (already has MDX compiled)
          const htmlFile = data.find((r: any) => r.format === "HTML");
          const mdFile = data.find((r: any) => r.format === "MD");

          if (htmlFile) {
            // If HTML exists, load and display it
            try {
              const response = await fetch(
                api.downloadReport(id, htmlFile.name)
              );
              const html = await response.text();

              // Create a component that renders the HTML
              setContent(() => () => (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ));
            } catch (err: any) {
              console.error("Failed to load HTML:", err);
              setError(err.message);
            }
          } else if (mdFile) {
            // Fallback to markdown
            try {
              const response = await fetch(api.downloadReport(id, mdFile.name));
              const mdContent = await response.text();

              // Check if it has MDX components
              if (/<[A-Z][a-zA-Z0-9]*[\s/>]/.test(mdContent)) {
                // Compile MDX
                const compiled = await compile(mdContent, {
                  outputFormat: "function-body",
                  development: false,
                });

                // Run the compiled code
                const { default: MDXContent } = await run(compiled, {
                  ...runtime,
                  baseUrl: import.meta.url,
                });

                // Wrap with component provider
                setContent(() => () => <MDXContent components={components} />);
              } else {
                // Plain markdown - render as HTML
                setContent(() => () => (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">
                      {mdContent}
                    </pre>
                  </div>
                ));
              }
            } catch (err: any) {
              console.error("Failed to compile MDX:", err);
              setError(err.message);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load reports:", err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Get PDF report
  const pdfReport = reports.find((r) => r.format === "PDF");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-shell">
        <div className="text-slate-400">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen page-shell">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="py-8">
              <div className="text-red-500">Error loading report: {error}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-shell">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link
          to={`/projects/${id}`}
          className="text-blue-400 hover:text-blue-300 mb-6 inline-block font-medium transition-colors"
        >
          ← Back to Project
        </Link>

        <h1 className="text-4xl font-bold text-black mb-2">
          Generated Reports
        </h1>
        <p className="text-slate-400 mb-8">
          View and download your analysis results
        </p>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                No reports yet
              </h3>
              <p className="text-slate-400 mb-6">
                Generate your first report to see results here
              </p>
              <Link to={`/projects/${id}/generate`}>
                <Button size="lg">Generate First Report</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Report Preview</CardTitle>
              {/* PDF Download Button */}
              {pdfReport && (
                <a
                  href={api.downloadReport(id!, pdfReport.name)}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </a>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {Content ? (
                <div className="report-preview">
                  <Content />
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No preview available
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
