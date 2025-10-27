"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Trophy, Home as HomeIcon, LogOut } from "lucide-react";

import { AddSportsPage } from "../../components/AddSportsPage";
import { AdminDashboard } from "../../components/AdminDashboard";
import { ManageSportsTypes, SportType } from "../../components/ManageSportsTypes";
import { ManageFaculties, Faculty } from "../../components/ManageFaculties";
import { ManageLineup } from "../../components/ManageLineup";
import { SportManagement } from "../../components/SportManagement";
import { ManagePointsSystem } from "../../components/ManagePointsSystem";
import { MediaManagement } from "../../components/MediaManagement";

// Admin route renders the exact admin sections previously under the Admin tab
// on the home page, but now as a dedicated page at /admin.

type AdminView =
  | "dashboard"
  | "manage-types"
  | "manage-faculties"
  | "manage-lineup"
  | "manage-sport"
  | "add-match"
  | "manage-points"
  | "media-management";

export default function AdminPage() {
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Configure passcode from env or fallback
  const requiredPasscode = useMemo(() => {
    return process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "admin";
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("adminAuthed");
      if (saved === "true") setAuthed(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.trim() === requiredPasscode) {
      setAuthed(true);
      setAdminView("dashboard");
      setLoginError(null);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("adminAuthed", "true");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      toast.success("Welcome to Admin");
    } else {
      setLoginError("Invalid passcode");
      toast.error("Invalid passcode");
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("adminAuthed");
    }
    toast("Logged out");
  };

  const [sports, setSports] = useState<SportType[]>([
    {
      id: 1,
      name: "Cricket",
      category: "men",
      maxTeams: 8,
      scoringType: "points",
      venue: "Main Cricket Ground",
    },
    {
      id: 2,
      name: "Cricket",
      category: "women",
      maxTeams: 8,
      scoringType: "points",
      venue: "Main Cricket Ground",
    },
    {
      id: 3,
      name: "Basketball",
      category: "men",
      maxTeams: 6,
      scoringType: "points",
      venue: "Indoor Stadium Court 1",
    },
    {
      id: 4,
      name: "Basketball",
      category: "women",
      maxTeams: 6,
      scoringType: "points",
      venue: "Indoor Stadium Court 2",
    },
    {
      id: 5,
      name: "Football",
      category: "men",
      maxTeams: 8,
      scoringType: "points",
      venue: "Main Football Field",
    },
    {
      id: 6,
      name: "Volleyball",
      category: "women",
      maxTeams: 6,
      scoringType: "sets",
      venue: "Volleyball Court A",
    },
  ]);

  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: 1,
      name: "Faculty of Engineering",
      shortName: "Engineering",
      color: "#3b82f6",
    },
    {
      id: 2,
      name: "Faculty of Science",
      shortName: "Science",
      color: "#10b981",
    },
    {
      id: 3,
      name: "Faculty of Medicine",
      shortName: "Medicine",
      color: "#f59e0b",
    },
    {
      id: 4,
      name: "Faculty of Arts",
      shortName: "Arts",
      color: "#8b5cf6",
    },
    {
      id: 5,
      name: "Faculty of Management",
      shortName: "Management",
      color: "#ec4899",
    },
  ]);

  const handleManageSport = (sportName: string) => {
    setSelectedSport(sportName);
    setAdminView("manage-sport");
  };

  const handleBackToDashboard = () => {
    setAdminView("dashboard");
    setSelectedSport("");
  };

  const renderAdminContent = () => {
    switch (adminView) {
      case "manage-types":
        return (
          <ManageSportsTypes sports={sports} onSportsChange={setSports} />
        );
      case "manage-faculties":
        return (
          <ManageFaculties faculties={faculties} onFacultiesChange={setFaculties} />
        );
      case "manage-lineup":
        return <ManageLineup sports={sports} faculties={faculties} />;
      case "manage-sport":
        return (
          <SportManagement
            sportName={selectedSport}
            onBack={handleBackToDashboard}
            faculties={faculties}
          />
        );
      case "add-match":
        return <AddSportsPage />;
      case "manage-points":
        return <ManagePointsSystem onBack={handleBackToDashboard} />;
      case "media-management":
        return <MediaManagement onBack={handleBackToDashboard} />;
      default:
        return (
          <AdminDashboard
            sports={sports}
            faculties={faculties}
            onManageSport={handleManageSport}
            onManageSportsTypes={() => setAdminView("manage-types")}
            onManageFaculties={() => setAdminView("manage-faculties")}
            onManageLineup={() => setAdminView("manage-lineup")}
            onManagePoints={() => setAdminView("manage-points")}
            onManageMedia={() => setAdminView("media-management")}
          />
        );
    }
  };

  // Asset paths from public/assets
  const pahasaraLogo = "/assets/28d386181c4b31e6d1c58ccd6ca93c8d0c7f764d.png";
  const uocLogo = "/assets/3a31c04d73a287116eb8960b48059b15193e9a9b.png";
  const physicalEdLogo = "/assets/28025570a47baf1666e250b00f4dc89667b7df28.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl sticky top-0 z-50 border-b border-blue-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logos */}
            <div className="flex items-center gap-4">
              <img src={pahasaraLogo} alt="Pahasara Logo" className="h-12 w-12 object-contain" />
              <img src={uocLogo} alt="University of Colombo Logo" className="h-14 w-14 object-contain" />
              <img src={physicalEdLogo} alt="Department of Physical Education Logo" className="h-14 object-contain" />
            </div>

            {/* Center spacer */}
            <div className="flex-1" />

            {/* Right: Title with pulsing logo */}
            <div className="flex items-center gap-3 animate-slide-in-right">
              <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400/30 ring-offset-2 ring-offset-blue-900">
                <Trophy className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
              </div>
              <div className="text-right">
                <h1 className="text-white mb-1 tracking-tight">Admin</h1>
                <p className="text-blue-200 text-sm">UOC Freshers' Sports Meet 2025</p>
              </div>
            </div>
          </div>

          {/* Secondary row: nav actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  <HomeIcon className="w-4 h-4 mr-2" />Back Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {authed && (
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {!authed ? (
          <div className="max-w-sm mx-auto bg-white/70 backdrop-blur rounded-xl shadow-xl border border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Admin login</h2>
            <p className="text-sm text-slate-600 mb-4">Enter the admin passcode to continue.</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passcode</label>
                <Input
                  type="password"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="••••••••"
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}
              <Button type="submit" className="w-full">Login</Button>
              <p className="text-xs text-slate-500">Tip: Configure NEXT_PUBLIC_ADMIN_PASSCODE in your env for production.</p>
            </form>
          </div>
        ) : (
          renderAdminContent()
        )}
      </main>
    </div>
  );
}
