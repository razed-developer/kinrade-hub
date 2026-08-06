import { SiteShell } from "./components/SiteShell";
import { GitHubProjectsPage } from "./features/github/GitHubProjectsPage";
import { MarinePage } from "./features/marine/MarinePage";
import { ToolsPage } from "./features/tools/ToolsPage";
import { HomePage } from "./pages/HomePage";

function currentPage() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path.endsWith("/marine")) return <MarinePage />;
  if (path.endsWith("/tools")) return <ToolsPage />;
  if (path.endsWith("/github")) return <GitHubProjectsPage />;
  return <HomePage />;
}

export function App() {
  return <SiteShell>{currentPage()}</SiteShell>;
}
