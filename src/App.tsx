import { HashRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./lib/store";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Interview from "./pages/Interview";
import Privacy from "./pages/Privacy";
import Learning from "./pages/Learning";
import Pricing from "./pages/Pricing";

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing standalone />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/matches" element={<Matches />} />
          <Route path="/app/matches/:id" element={<MatchDetail />} />
          <Route path="/app/interview" element={<Interview />} />
          <Route path="/app/privacy" element={<Privacy />} />
          <Route path="/app/learning" element={<Learning />} />
          <Route path="/app/premium" element={<Pricing />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
