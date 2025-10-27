"use client";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Trophy, Calendar, Target, Home, Waves, Zap } from "lucide-react";
import { HomePage } from "../components/HomePage";
import { AddSportsPage } from "../components/AddSportsPage";
import { SummaryPage } from "../components/SummaryPage";
import { LineupPage } from "../components/LineupPage";
import { LineupPageEnhanced } from "../components/LineupPageEnhanced";
import { DrawPage } from "../components/DrawPage";
import { SportResults } from "../components/SportResults";
import { SwimmingMeet } from "../components/SwimmingMeet";
import { AthleticsMeet } from "../components/AthleticsMeet";
// Admin UI has been moved to /admin. No admin UI here anymore.

// Asset paths from public/assets
const pahasaraLogo = "/assets/28d386181c4b31e6d1c58ccd6ca93c8d0c7f764d.png";
const uocLogo = "/assets/3a31c04d73a287116eb8960b48059b15193e9a9b.png";
const physicalEdLogo = "/assets/28025570a47baf1666e250b00f4dc89667b7df28.png";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  // Admin content removed from home. Use /admin for admin functions.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 relative overflow-x-hidden">
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl sticky top-0 z-50 border-b border-blue-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logos */}
            <div className="flex items-center gap-4">
              <img
                src={pahasaraLogo}
                alt="Pahasara Logo"
                className="h-12 w-12 object-contain"
              />
              <img
                src={uocLogo}
                alt="University of Colombo Logo"
                className="h-14 w-14 object-contain"
              />
              <img
                src={physicalEdLogo}
                alt="Department of Physical Education Logo"
                className="h-14 object-contain"
              />
            </div>

            {/* Center spacer */}
            <div className="flex-1" />

            {/* Right: Title with pulsing logo moved here */}
            <div className="flex items-center gap-3 animate-slide-in-right">
              <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400/30 ring-offset-2 ring-offset-blue-900">
                <Trophy className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
              </div>
              <div className="text-right">
                <h1 className="text-white mb-1 tracking-tight">Pulse</h1>
                <p className="text-blue-200 text-sm">UOC Freshers' Sports Meet 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value)}
          className="w-full"
        >
          <TabsList
            className={`grid w-full max-w-7xl mx-auto grid-cols-5 mb-8 h-auto p-2 glass-effect shadow-xl rounded-2xl border border-white/30`}
          >
            <TabsTrigger
              value="home"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              <span className="hidden lg:inline">Home</span>
            </TabsTrigger>

            <TabsTrigger
              value="lineup"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Lineup</span>
            </TabsTrigger>

            <TabsTrigger
              value="summary"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden lg:inline">
                Leaderboard
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="results"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Results</span>
            </TabsTrigger>

            <TabsTrigger
              value="swimming"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Waves className="w-4 h-4" />
              <span className="hidden lg:inline">Swimming</span>
            </TabsTrigger>

            <TabsTrigger
              value="athletics"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden lg:inline">
                Athletics
              </span>
            </TabsTrigger>

            {/* Admin tab removed; access admin at /admin */}
          </TabsList>

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

          <TabsContent value="swimming" className="mt-0">
            <SwimmingMeet />
          </TabsContent>

          <TabsContent value="athletics" className="mt-0">
            <AthleticsMeet />
          </TabsContent>

          {/* Admin content removed from home */}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-t border-blue-700/50 mt-16">
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
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400"></div>
            <Trophy className="w-5 h-5 text-green-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400"></div>
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