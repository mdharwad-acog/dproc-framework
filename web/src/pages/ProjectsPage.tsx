import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Project } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">
              {projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
          <Link to="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project using the CLI
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm inline-block">
                $ dproc-framework init my-project
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>
                      Updated{" "}
                      {new Date(project.lastModified).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {project.config.output?.formats?.map((format: string) => (
                        <span
                          key={format}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                        >
                          {format.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
