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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<any[]>([]);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .listReports(id)
        .then(async (data) => {
          setReports(data);
          const mdFile = data.find((r: any) => r.format === "MD");
          if (mdFile) {
            const response = await fetch(api.downloadReport(id, mdFile.name));
            setMarkdown(await response.text());
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      // Apply dark theme classes to loading state
      <div className="min-h-screen flex items-center justify-center page-shell">
        <div className="text-slate-400">Loading reports...</div>
      </div>
    );
  }

  return (
    // Apply dark theme page shell
    <div className="min-h-screen page-shell">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link
          to={`/projects/${id}`}
          // Updated link style for dark theme
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Download</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <a
                        key={report.name}
                        href={api.downloadReport(id!, report.name)}
                        download
                        // Updated download pill style for dark theme
                        className="flex items-center justify-between p-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <span className="font-medium text-black">
                          {report.format}
                        </span>
                        <span className="text-black">↓</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {markdown ? (
                    // Markdown content will now be visible due to correct dark theme prose styles from index.css
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    // Updated no-preview text color
                    <p className="text-slate-400 text-center py-8">
                      No preview available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
