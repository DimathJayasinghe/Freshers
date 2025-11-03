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
        <Header/>
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
          </Routes>
        </main>
        {/* Don't show normal footer on admin pages */}
        <Footer />
        <PahasaraOverlay />
      </div>
    </Router>
  );
}

export default App;
