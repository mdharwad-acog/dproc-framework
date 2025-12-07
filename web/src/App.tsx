import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import GeneratePage from "./pages/GeneratePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects/:id/generate" element={<GeneratePage />} />
      <Route path="/projects/:id/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
