import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, Project } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .getProject(id)
        .then(setProject)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Project not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link
          to="/projects"
          className="text-blue-600 hover:underline mb-6 inline-block font-medium"
        >
          ← Back to Projects
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {project.name}
        </h1>
        <p className="text-gray-600 mb-8">Manage your data analysis workflow</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">▶️</div>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription className="mt-2">
                Create a new AI-powered report
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to={`/projects/${id}/generate`}>
                <Button className="w-full">Generate New Report</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">👁️</div>
              <CardTitle>View Reports</CardTitle>
              <CardDescription className="mt-2">
                Access generated reports
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to={`/projects/${id}/reports`}>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.config.dataSources?.map(
                (source: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm"
                  >
                    {source}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
