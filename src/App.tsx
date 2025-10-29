import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AdminHeader from "@/components/AdminHeader";
import AdminSports from "@/pages/admin/AdminSports";
import { PahasaraOverlay } from "@/components/PahasaraOverlay";
import { Home } from "@/pages/Home";
import { Lineup } from "@/pages/Lineup";
import { Leaderboard } from "@/pages/Leaderboard";
import { Results } from "@/pages/Results";
import { Sports } from "@/pages/Sports";
import { SportDetail } from "@/pages/SportDetail";
import { Faculties } from "@/pages/Faculties";
import { FacultyDetail } from "@/pages/FacultyDetail";
import { ClosingCeremony } from "@/pages/ClosingCeremony";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminFaculty from "@/pages/admin/AdminFaculty";
import AdminLineup from "@/pages/admin/AdminLineup";
import AdminPoints from "@/pages/admin/AdminPoints";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminMediaLibrary from "@/pages/admin/AdminMediaLibrary";
import AdminSportEdit from "@/pages/admin/AdminSportEdit";
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
        {/* Show AdminHeader for admin routes, otherwise normal Header */}
        {window.location.pathname.startsWith('/admin') ? <AdminHeader /> : <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lineup" element={<Lineup />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/results" element={<Results />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/sport/:sportName" element={<SportDetail />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/faculty/:facultyId" element={<FacultyDetail />} />
            <Route path="/closing-ceremony" element={<ClosingCeremony />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sports" element={<AdminSports />} />
            <Route path="/admin/sports/:sportId" element={<AdminSportEdit />} />
            <Route path="/admin/faculties" element={<AdminFaculty />} />
            <Route path="/admin/lineup" element={<AdminLineup />} />
            <Route path="/admin/points" element={<AdminPoints />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/media-library" element={<AdminMediaLibrary />} />
          </Routes>
        </main>
        {/* Don't show normal footer on admin pages */}
        {!window.location.pathname.startsWith('/admin') && <Footer />}
        <PahasaraOverlay />
      </div>
    </Router>
  );
}

export default App;
