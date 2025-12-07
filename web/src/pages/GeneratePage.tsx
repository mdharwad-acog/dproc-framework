import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function GeneratePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!id) return;
    setGenerating(true);
    setError("");
    try {
      await api.generateReport(id);
      setSuccess(true);
      setTimeout(() => navigate(`/projects/${id}/reports`), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Generate Report</CardTitle>
          <CardDescription>
            Create an AI-powered analysis of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!generating && !success && (
            <Button onClick={handleGenerate} className="w-full" size="lg">
              Start Generation
            </Button>
          )}

          {generating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-900 font-medium mb-2">
                AI is analyzing your data
              </p>
              <p className="text-sm text-gray-500">
                This may take 10-20 seconds
              </p>
            </div>
          )}

          {success && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Report Generated!
              </h3>
              <p className="text-gray-600">Redirecting to reports...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
