import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PahasaraOverlay } from "@/components/PahasaraOverlay";
import { Home } from "@/pages/Home";
import { Lineup } from "@/pages/Lineup";
import { Leaderboard } from "@/pages/Leaderboard";
import { Results } from "@/pages/Results";
import { LiveResults } from "@/pages/LiveResults";
import { Sports } from "@/pages/Sports";
import { SportDetail } from "@/pages/SportDetail";
import { Faculties } from "@/pages/Faculties";
import { FacultyDetail } from "@/pages/FacultyDetail";
import { ClosingCeremony } from "@/pages/ClosingCeremony";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ConfigLineup from "@/pages/admin/ConfigLineup";
import ManageSports from "@/pages/admin/ManageSports";
import RequireAdmin from "@/pages/admin/RequireAdmin";
import './App.css';


function App() {
  // Scroll to top on route change
  function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);
    return null;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black flex flex-col ">
        <ChromeHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lineup" element={<Lineup />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/results" element={<Results />} />
            <Route path="/live" element={<LiveResults />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/sport/:sportName" element={<SportDetail />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/faculty/:facultyId" element={<FacultyDetail />} />
            <Route path="/closing-ceremony" element={<ClosingCeremony />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/lineup" element={<RequireAdmin><ConfigLineup /></RequireAdmin>} />
            <Route path="/admin/sports" element={<RequireAdmin><ManageSports /></RequireAdmin>} />
          </Routes>
        </main>
        {/* Don't show normal footer on admin pages */}
        <ChromeFooter />
        <PahasaraOverlay />
      </div>
    </Router>
  );
}

function ChromeHeader() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return isAdminRoute ? null : <Header />;
}

function ChromeFooter() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return isAdminRoute ? null : <Footer />;
}

export default App;
