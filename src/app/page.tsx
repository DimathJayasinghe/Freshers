"use client";
import { useState } from "react";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Trophy, Calendar, Target, Home, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "../components/ui/sheet";
import { SheetTitle } from "../components/ui/sheet";
import { HomePage } from "../components/HomePage";
import { AddSportsPage } from "../components/AddSportsPage";
import { SummaryPage } from "../components/SummaryPage";
import { LineupPage } from "../components/LineupPage";
import { LineupPageEnhanced } from "../components/LineupPageEnhanced";
import { DrawPage } from "../components/DrawPage";
import { SportResults } from "../components/SportResults";
// Swimming and Athletics moved under Results section
// Admin UI has been moved to /admin. No admin UI here anymore.

// Asset paths from public/assets
const pahasaraLogo = "/assets/28d386181c4b31e6d1c58ccd6ca93c8d0c7f764d.png";
const uocLogo = "/assets/3a31c04d73a287116eb8960b48059b15193e9a9b.png";
const physicalEdLogo = "/assets/28025570a47baf1666e250b00f4dc89667b7df28.png";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  // Admin content removed from home. Use /admin for admin functions.

  return (
  <div className="min-h-screen bg-[var(--brand-dark)] relative overflow-x-hidden flex flex-col">
      {/* Enhanced SVG Background Patterns */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dot pattern */}
            <pattern
              id="dots-bg"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill="#3b82f6"
                opacity="0.08"
              />
            </pattern>

            {/* Grid pattern */}
            <pattern
              id="grid-bg"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#1e40af"
                strokeWidth="0.5"
                opacity="0.06"
              />
            </pattern>

            {/* Diagonal stripes */}
            <pattern
              id="stripes-bg"
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect
                x="0"
                y="0"
                width="6"
                height="12"
                fill="#22c55e"
                opacity="0.03"
              />
            </pattern>

            {/* Hexagon pattern */}
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="56"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                opacity="0.04"
              />
              <path
                d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34"
                fill="none"
                stroke="#22c55e"
                strokeWidth="0.5"
                opacity="0.04"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#dots-bg)"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#grid-bg)"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#stripes-bg)"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#hexagons)"
          />
        </svg>

        {/* Gradient overlays */}
  <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(98, 21, 14, 0.08)' }}></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(9, 11, 12, 0.08)' }}></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(201, 153, 8, 0.05)' }}></div>
      </div>
      {/* Header */}
  <header className="bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand-primary)] to-[var(--brand-dark)] text-white shadow-2xl sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Mobile menu trigger + desktop nav */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-blue-100 hover:bg-blue-700/40 transition"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 sm:w-80" aria-label="Main menu">
                  <SheetTitle className="sr-only">Main menu</SheetTitle>
                  <nav className="p-3 pt-12 space-y-2">
                    <SheetClose asChild>
                      <button
                        onClick={() => setActiveTab("home")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                          activeTab === "home"
                            ? "bg-blue-900 text-white"
                            : "bg-white/70 hover:bg-white text-blue-900"
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => setActiveTab("lineup")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                          activeTab === "lineup"
                            ? "bg-blue-900 text-white"
                            : "bg-white/70 hover:bg-white text-blue-900"
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Lineup</span>
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => setActiveTab("summary")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                          activeTab === "summary"
                            ? "bg-blue-900 text-white"
                            : "bg-white/70 hover:bg-white text-blue-900"
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Leaderboard</span>
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => setActiveTab("results")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                          activeTab === "results"
                            ? "bg-blue-900 text-white"
                            : "bg-white/70 hover:bg-white text-blue-900"
                        }`}
                      >
                        <Target className="w-4 h-4" />
                        <span>Results</span>
                      </button>
                    </SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("home")}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/10 ${
                  activeTab === "home"
                      ? "bg-[var(--brand-primary)] text-white shadow"
                      : "text-white/80"
                }`}
                aria-pressed={activeTab === "home"}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                onClick={() => setActiveTab("lineup")}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/10 ${
                  activeTab === "lineup"
                      ? "bg-[var(--brand-primary)] text-white shadow"
                      : "text-white/80"
                }`}
                aria-pressed={activeTab === "lineup"}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Lineup</span>
              </button>

              <button
                onClick={() => setActiveTab("summary")}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/10 ${
                  activeTab === "summary"
                      ? "bg-[var(--brand-primary)] text-white shadow"
                      : "text-white/80"
                }`}
                aria-pressed={activeTab === "summary"}
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveTab("results")}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/10 ${
                  activeTab === "results"
                      ? "bg-[var(--brand-primary)] text-white shadow"
                      : "text-white/80"
                }`}
                aria-pressed={activeTab === "results"}
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Results</span>
              </button>
              </nav>
            </div>

            {/* Center spacer */}
            <div className="flex-1" />

            {/* Right: Title with pulsing logo */}
            <div className="flex items-center gap-3 animate-slide-in-right">
              <div className="relative w-12 h-12 bg-gradient-to-br from-[var(--brand-accent)] to-[#e0b20a] rounded-full flex items-center justify-center shadow-lg ring-2 ring-[var(--brand-accent)]/30 ring-offset-2 ring-offset-[var(--brand-dark)]">
                <Trophy className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-full bg-[var(--brand-accent)] animate-ping opacity-20"></div>
              </div>
              <div className="text-right">
                <h1 className="text-white mb-1 tracking-tight">Pulse</h1>
                <p className="text-yellow-200 text-sm">UOC Freshers' Sports Meet 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
  <main className="container mx-auto px-4 py-8 animate-fade-in flex-1 w-full">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value)}
          className="w-full"
        >
          {/* Slider removed; navigation now in header */}

          <TabsContent value="home" className="mt-0">
            <HomePage />
          </TabsContent>

          <TabsContent value="lineup" className="mt-0">
            <LineupPageEnhanced />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <SummaryPage />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <SportResults />
          </TabsContent>

          

          {/* Admin content removed from home */
          }
        </Tabs>
      </main>

      {/* Footer */}
  <footer className="bg-gradient-to-r from-[var(--brand-dark)] via-[var(--brand-primary)] to-[var(--brand-dark)] border-t border-white/10 mt-8">
        <div className="container mx-auto px-4 py-8">
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src={pahasaraLogo}
              alt="Pahasara Logo"
              className="h-10 w-10 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <img
              src={uocLogo}
              alt="University of Colombo Logo"
              className="h-12 w-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <img
              src={physicalEdLogo}
              alt="Department of Physical Education Logo"
              className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--brand-accent)]"></div>
            <Trophy className="w-5 h-5 text-[var(--brand-accent)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--brand-accent)]"></div>
          </div>

          {/* Credits */}
          <div className="text-center">
            <p className="text-white text-sm mb-2">
              powered by{" "}
              <span className="text-green-400 font-semibold">
                pahasara
              </span>{" "}
              |{" "}
              <span className="text-blue-200">
                ucsc media unit
              </span>
            </p>
            <p className="text-blue-300 text-xs">
              © 2025 University of Colombo - Department of Physical Education
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}