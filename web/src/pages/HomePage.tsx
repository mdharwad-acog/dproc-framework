import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            LLM Data Framework
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform any dataset into AI-powered, structured reports
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/projects">
              <Button size="lg">View Projects</Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="lg">
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-3">🤖</div>
              <CardTitle className="text-lg">Multi-LLM Support</CardTitle>
              <CardDescription>Gemini, OpenAI, DeepSeek</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-3">📊</div>
              <CardTitle className="text-lg">Universal Data</CardTitle>
              <CardDescription>CSV, JSON support</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-3">📄</div>
              <CardTitle className="text-lg">Multi-Format Export</CardTitle>
              <CardDescription>MD, HTML, PDF</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription className="mt-2">
              Projects created via CLI will appear here automatically
            </CardDescription>
            <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              $ dproc-framework init my-project
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
