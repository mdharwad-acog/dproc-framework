import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [keys, setKeys] = useState({ gemini: "", openai: "", deepseek: "" });
  const [models, setModels] = useState({
    gemini: "gemini-2.0-flash-exp",
    openai: "gpt-4o-mini",
    deepseek: "deepseek-chat",
  });
  const [activeProvider, setActiveProvider] = useState("gemini");

  useEffect(() => {
    api
      .getSettings()
      .then((data) => {
        setStatus(data);
        setActiveProvider(data.active);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.saveSettings({ keys, models, activeProvider });
      setMessage("Settings saved successfully!");
      api.getSettings().then(setStatus);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const providers = [
    { key: "gemini", name: "Gemini", icon: "🔷" },
    { key: "openai", name: "OpenAI", icon: "🤖" },
    { key: "deepseek", name: "DeepSeek", icon: "🔮" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          to="/projects"
          className="text-blue-600 hover:underline mb-6 inline-block font-medium"
        >
          ← Back to Projects
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">
          Configure your AI providers and preferences
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <span className="font-medium text-gray-900">
                        {provider.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        status?.[provider.key]
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {status?.[provider.key]
                        ? "✓ Configured"
                        : "○ Not configured"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Enter your API keys for each provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={keys.gemini}
                    onChange={(e) =>
                      setKeys({ ...keys, gemini: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Gemini API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={keys.openai}
                    onChange={(e) =>
                      setKeys({ ...keys, openai: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your OpenAI API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    DeepSeek API Key
                  </label>
                  <input
                    type="password"
                    value={keys.deepseek}
                    onChange={(e) =>
                      setKeys({ ...keys, deepseek: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your DeepSeek API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Active Provider
                  </label>
                  <select
                    value={activeProvider}
                    onChange={(e) => setActiveProvider(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.includes("Error")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
