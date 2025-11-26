import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trophy, Users, Flame, ChevronRight, MapPin, Clock } from "lucide-react";
import type { ScheduleMatch } from "../data/homeData";
import type { TeamData } from "../data/leaderboardData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchLiveSportsNow, fetchTodaySchedule, fetchLeaderboard, fetchActiveSeriesBySport } from "../lib/api";

export function Home() {
  const navigate = useNavigate();
  const [liveSports, setLiveSports] = useState<{ id: string; name: string }[]>([]);
  const [today, setToday] = useState<ScheduleMatch[]>([]);
  const [top, setTop] = useState<TeamData[]>([]);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [todayLoaded, setTodayLoaded] = useState(false);
  const [topLoaded, setTopLoaded] = useState(false);
  const isLoading = !(liveLoaded && todayLoaded && topLoaded);
  type RankedTeam = TeamData & { computedRank: number };
  const [liveGenders, setLiveGenders] = useState<Record<string, 'male' | 'female' | 'mixed' | null>>({});

  useEffect(() => {
    let mounted = true;
    fetchLiveSportsNow()
      .then((data) => {
        if (mounted && data) setLiveSports(data);
      })
      .catch((err) => {
        console.error('[Home] liveSports fetch error', err);
      })
      .finally(() => { if (mounted) setLiveLoaded(true); });
    fetchTodaySchedule()
      .then((data) => {
        if (mounted && data) setToday(data);
      })
      .catch((err) => {
        console.error('[Home] todaySchedule fetch error', err);
      })
      .finally(() => { if (mounted) setTodayLoaded(true); });
    fetchLeaderboard()
      .then((data) => {
        if (mounted && data && data.length > 0) setTop(data);
      })
      .catch((err) => {
        console.error('[Home] leaderboard fetch error', err);
      })
      .finally(() => { if (mounted) setTopLoaded(true); });
    return () => {
      mounted = false;
    };
  }, []);

  // When live sports list is available, fetch active series gender for each sport
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!liveSports || liveSports.length === 0) { if (alive) setLiveGenders({}); return; }
      try {
        const results = await Promise.all(
          liveSports.map(async (s) => {
            try {
              const series = await fetchActiveSeriesBySport(s.id);
              return [s.id, series?.gender ?? null] as const;
            } catch {
              return [s.id, null] as const;
            }
          })
        );
        if (!alive) return;
        const map: Record<string, 'male' | 'female' | 'mixed' | null> = {};
        results.forEach(([id, g]) => { map[id] = g ?? null; });
        setLiveGenders(map);
      } catch {
        if (alive) setLiveGenders({});
      }
    };
    load();
    return () => { alive = false; };
  }, [liveSports]);

  // Highlights ribbon is now part of the hero (non-sticky) to avoid covering CTAs

  // Rank the leaderboard using competition ranking (1,1,3) for consistent podium rendering
  const rankedTop = useMemo<RankedTeam[]>(() => {
    if (!top || top.length === 0) return [] as RankedTeam[];
    const sorted = [...top].sort((a, b) => {
      const at = Number(a.totalPoints);
      const bt = Number(b.totalPoints);
      if (bt !== at) return bt - at;
      return (a.name || "").localeCompare(b.name || "");
    });
    let prevPts: number | null = null;
    let prevRank = 0;
    return sorted.map<RankedTeam>((t, i) => {
      const pts = Number(t.totalPoints);
      const r = prevPts !== null && pts === prevPts ? prevRank : i + 1;
      prevPts = pts;
      prevRank = r;
      return { ...t, computedRank: r };
    });
  }, [top]);

  // Simple theme mapping so tied ranks share the same color scheme
  const themeForRank = (rank: number) => {
    if (rank === 1) {
      return {
        card: "bg-gradient-to-br from-yellow-400/20 via-amber-500/10 to-black border-yellow-500/50 hover:border-yellow-400/70 hover:shadow-2xl hover:shadow-yellow-500/30",
        badge: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black",
        trophy: "text-yellow-500",
        codeChip: "bg-yellow-500/20 border-yellow-400/50 text-yellow-400",
        totalBorder: "border-yellow-700",
        pointsGradient: "bg-gradient-to-r from-yellow-400 to-amber-500",
      } as const;
    }
    if (rank === 2) {
      return {
        card: "bg-gradient-to-br from-gray-300/10 via-gray-500/5 to-black border-gray-400/30 hover:border-gray-300/50 hover:shadow-2xl hover:shadow-gray-500/20",
        badge: "bg-gradient-to-br from-gray-300 to-gray-500 text-black",
        trophy: "text-gray-400",
        codeChip: "bg-gray-500/20 border-gray-400/30 text-gray-300",
        totalBorder: "border-gray-700",
        pointsGradient: "bg-gradient-to-r from-gray-300 to-gray-500",
      } as const;
    }
    return {
      card: "bg-gradient-to-br from-amber-700/10 via-amber-800/5 to-black border-amber-600/30 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20",
      badge: "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
      trophy: "text-amber-600",
      codeChip: "bg-amber-600/20 border-amber-500/30 text-amber-400",
      totalBorder: "border-amber-800",
      pointsGradient: "bg-gradient-to-r from-amber-500 to-amber-700",
    } as const;
  };

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section - Full viewport height on mobile (accounting for a 64px header), auto on desktop */}
      {/*
        Behavior:
        - Mobile (base): hero uses min-height: calc(100vh - 64px) so it fills the viewport without overlapping the header.
        - Desktop (md+): hero height becomes auto so it won't force large whitespace.
        - Add bottom padding on mobile to reserve space for the absolutely-positioned Stats bar so it doesn't overlap the main content below.
      */}
      <section className="relative overflow-hidden">
        <div className="relative bg-gradient-to-br from-red-950 via-black to-red-950 md:min-h-screen">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 pb-8 md:pb-16">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              {/* UOC Logo */}
              <div className="flex justify-center mb-4 animate-fade-in">
                <img 
                  src="/logos/uoc-logo.png" 
                  alt="University of Colombo" 
                  className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 object-contain drop-shadow-2xl"
                />
              </div>
              
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm animate-fade-in-up">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
                <span className="text-red-400 text-xs sm:text-sm font-semibold">University of Colombo</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-bold text-white leading-[1.15] px-2 animate-fade-in-up delay-200">
                <span className="block text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2 text-gray-300">
                  Welcome to
                </span>
                <span className="block bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
                  UOC Freshers' Meet 2025
                </span>
              </h1>
              
              <p className="text-gray-300 text-sm sm:text-base md:text-base lg:text-lg max-w-2xl mx-auto px-4 animate-fade-in-up delay-300">
                Experience the spirit of competition and camaraderie. Follow live matches, 
                check schedules, view leaderboards, and celebrate victories together.
              </p>

              {/* Quick Nav Buttons */}
              <div className="flex justify-center gap-3 sm:gap-4 pt-2 animate-fade-in-up delay-325">
                <Button
                  onClick={() => navigate('/leaderboard')}
                  className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                >
                  View Leaderboard
                </Button>
                <Button
                  onClick={() => navigate('/results')}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  View Results
                </Button>
              </div>

              {/* In-hero Highlights Ribbon (non-sticky) with glow */}
              <div className="max-w-3xl mx-auto px-3 sm:px-4 animate-fade-in-up delay-350">
                <div className="mt-2 sm:mt-3 relative">
                  <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-gradient-to-r from-red-600/30 via-yellow-400/20 to-red-600/30 blur-2xl opacity-50"></div>
                  <div className="relative rounded-xl border border-white/10 bg-black/30 backdrop-blur-md px-3 py-3 sm:px-4 sm:py-4 shadow-xl shadow-red-500/10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div onClick={() => navigate('/sports')} className="text-center cursor-pointer hover:scale-105 transition-transform group">
                        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                          <div className="text-lg sm:text-xl font-bold text-white">12+</div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 group-hover:text-yellow-400 transition-colors">Sports</div>
                      </div>
                      <div onClick={() => navigate('/leaderboard')} className="text-center cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          <div className="text-lg sm:text-xl font-bold text-white">11</div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400">Faculties</div>
                      </div>
                      <div onClick={() => navigate('/live')} className="text-center cursor-pointer hover:scale-105 transition-transform group">
                        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
                          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform" />
                          <div className="text-lg sm:text-xl font-bold text-white">{liveSports.length}</div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 group-hover:text-red-400 transition-colors">Live Now</div>
                      </div>
                      <div onClick={() => navigate('/lineup')} className="text-center cursor-pointer hover:scale-105 transition-transform group">
                        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:scale-110 transition-transform" />
                          <div className="text-lg sm:text-xl font-bold text-white">{today.length}</div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 group-hover:text-green-400 transition-colors">Today's Matches</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile scroll button removed */}
            </div>
          </div>
        </div>
      </section>


      {/* Main Content */}
  <div id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 py-8 md:py-12">
        {/* Live Results Section */}
        <section className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 md:mb-8">
            <div className="flex items-center gap-2  px-4 py-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Live Results</h2>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent hidden sm:block"></div>
            <Button
              onClick={() => navigate('/live')}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 group"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={`live-skel-${idx}`} className="bg-gradient-to-br from-red-950/30 via-gray-900 to-black border-white/10 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 w-44 bg-white/10 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {!isLoading && liveSports.map((s, index) => (
                <Card
                  key={`${s.id}-${index}`}
                  onClick={() => navigate(`/live?sport=${encodeURIComponent(s.id)}`)}
                  className="group relative overflow-hidden bg-gradient-to-br from-red-950/50 via-gray-900 to-black border-red-800/50 hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="py-3 md:py-5 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-white text-sm md:text-lg group-hover:text-red-400 transition-colors truncate flex items-center gap-1.5 md:gap-2">
                        <div className="w-1 h-5 md:h-6 bg-red-500 rounded-full"></div>
                        <span className="truncate">{s.name}</span>
                        {(() => {
                          const g = liveGenders[s.id];
                          if (!g) return null;
                          const label = g === 'male' ? 'Men' : g === 'female' ? 'Women' : 'Mixed';
                          const cls = g === 'male'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                            : g === 'female'
                            ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                            : 'bg-violet-500/15 text-violet-300 border-violet-500/30';
                          return <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>{label}</span>;
                        })()}
                      </CardTitle>
                      <span className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center gap-1.5 md:gap-2 animate-pulse flex-shrink-0 shadow-lg shadow-red-500/50">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping"></span>
                        LIVE
                      </span>
                    </div>
                  </CardHeader>
                </Card>
            ))}
          </div>

          {liveSports.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <div className="relative inline-block">
                  <Flame className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl"></div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">No Live Matches</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Check back later for live updates during match times
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Today's Schedule Section */}
        <section className="animate-fade-in-up delay-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 md:mb-8">
            <div className="flex items-center gap-2 sm:gap-3  px-4 py-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Today's Schedule</h2>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent hidden sm:block"></div>
            <Button
              onClick={() => navigate('/lineup')}
              variant="ghost"
              size="sm"
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 group"
            >
              Full Schedule
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={`today-skel-${idx}`} className="bg-gradient-to-r from-yellow-950/10 via-black to-gray-900 border-white/10 animate-pulse">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-24 bg-white/10 rounded" />
                        <div className="flex-1 h-5 bg-white/10 rounded" />
                        <div className="h-8 w-32 bg-white/10 rounded hidden sm:block" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
            {!isLoading && today.map((event, index) => (
              <Card
                key={event.id}
                onClick={() => navigate('/lineup')}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-950/20 via-black to-gray-900 border-yellow-800/30 hover:border-yellow-600/50 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-3 sm:p-5 relative z-10">
                  {/* Mobile compact row layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between gap-3">
                      {/* Time Badge */}
                      <div className="flex items-center gap-1.5 bg-gradient-to-br from-yellow-500 to-amber-600 text-black rounded-md px-2 py-1.5 flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">{event.time}</span>
                      </div>

                      {/* Sport Name */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <div className="w-1 h-6 bg-yellow-500"></div>
                        <div className="text-white font-semibold text-sm truncate">{event.sport}</div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] bg-black/30 px-2 py-1.5 rounded-md flex-shrink-0 group-hover:text-yellow-400 transition-colors max-w-[45%]">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500" />
                        <span className="font-medium truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop original layout */}
                  <div className="hidden md:block">
                    <div className="flex flex-row items-center gap-6">
                      {/* Time Badge */}
                      <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500 to-amber-600 text-black rounded-lg px-3 py-2 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold text-sm">{event.time}</span>
                      </div>

                      {/* Sport Name */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="w-1 h-8 bg-yellow-500"></div>
                        <div className="text-white font-bold text-xl">{event.sport}</div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-400 text-sm bg-black/30 px-3 py-2 rounded-lg flex-shrink-0 group-hover:text-yellow-400 transition-colors">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                        <span className="font-medium">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoading && today.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <div className="relative inline-block">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                  <div className="absolute inset-0 bg-yellow-500/20 blur-2xl"></div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">No Matches Today</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4">
                  Check the full schedule for upcoming events
                </p>
                <Button 
                  onClick={() => navigate('/lineup')}
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                >
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Section */}
          <section className="mt-12 animate-fade-in-up delay-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 md:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Top Rankings</h2>
              </div>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent hidden sm:block"></div>
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="ghost"
                size="sm"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 group"
              >
                Full Leaderboard
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Podium Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* 2nd Place */}
              <Card 
                onClick={() => navigate('/leaderboard')}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer order-2 md:order-1 md:mt-8 ${themeForRank(rankedTop[1]?.computedRank ?? 2).card}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/0 via-gray-400/10 to-gray-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-3 md:p-6 relative z-10">
                  {/* Mobile compact row layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeForRank(rankedTop[1]?.computedRank ?? 2).badge}`}>
                        <span className="text-lg font-bold">{rankedTop[1]?.computedRank ?? 2}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-white font-semibold text-sm">{rankedTop[1]?.name ?? '—'}</div>
                        <div className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${themeForRank(rankedTop[1]?.computedRank ?? 2).codeChip}`}>
                          {rankedTop[1]?.code ?? '—'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                          <span>Men's: <span className="text-blue-400 font-bold">{rankedTop[1]?.mensPoints ?? 0}</span></span>
                          <span>Women's: <span className="text-pink-400 font-bold">{rankedTop[1]?.womensPoints ?? 0}</span></span>
                        </div>
                      </div>
                      <div className="text-right px-2">
                        <div className={`text-2xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[1]?.computedRank ?? 2).pointsGradient}`}>
                          {rankedTop[1]?.totalPoints ?? 0}
                        </div>
                        <div className="text-[10px] text-gray-400 -mt-0.5">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop original content */}
                  <div className="hidden md:block text-center">
                    {/* Rank Badge */}
                    <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${themeForRank(rankedTop[1]?.computedRank ?? 2).badge}`}>
                      <span className="text-2xl font-bold">{rankedTop[1]?.computedRank ?? 2}</span>
                    </div>

                    {/* Medal Icon */}
                    <div className="mb-3">
                      <Trophy className={`w-12 h-12 mx-auto group-hover:scale-110 transition-transform ${themeForRank(rankedTop[1]?.computedRank ?? 2).trophy}`} />
                    </div>

                    {/* Faculty Info */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-lg mb-1 transition-colors">
                        {rankedTop[1]?.name ?? '—'}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${themeForRank(rankedTop[1]?.computedRank ?? 2).codeChip}`}>
                        {rankedTop[1]?.code ?? '—'}
                      </span>
                    </div>

                    {/* Points Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Men's:</span>
                        <span className="text-blue-400 font-bold">{rankedTop[1]?.mensPoints ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Women's:</span>
                        <span className="text-pink-400 font-bold">{rankedTop[1]?.womensPoints ?? 0}</span>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className={`pt-4 px-3 border-t ${themeForRank(rankedTop[1]?.computedRank ?? 2).totalBorder}`}>
                      <div className={`text-4xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[1]?.computedRank ?? 2).pointsGradient}`}>
                        {rankedTop[1]?.totalPoints ?? 0}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place - Elevated */}
              <Card 
                onClick={() => navigate('/leaderboard')}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer order-1 md:order-2 md:scale-105 md:-mt-4 ${themeForRank(rankedTop[0]?.computedRank ?? 1).card}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-3 md:p-6 md:pt-8 relative z-10">
                  {/* Mobile compact row layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeForRank(rankedTop[0]?.computedRank ?? 1).badge}`}>
                        <span className="text-lg font-bold">{rankedTop[0]?.computedRank ?? 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-white font-semibold text-sm">{rankedTop[0]?.name ?? '—'}</div>
                        <div className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${themeForRank(rankedTop[0]?.computedRank ?? 1).codeChip}`}>
                          {rankedTop[0]?.code ?? '—'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                          <span>Men's: <span className="text-blue-400 font-bold">{rankedTop[0]?.mensPoints ?? 0}</span></span>
                          <span>Women's: <span className="text-pink-400 font-bold">{rankedTop[0]?.womensPoints ?? 0}</span></span>
                        </div>
                      </div>
                      <div className="text-right px-2">
                        <div className={`text-2xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[0]?.computedRank ?? 1).pointsGradient}`}>
                          {rankedTop[0]?.totalPoints ?? 0}
                        </div>
                        <div className="text-[10px] text-gray-400 -mt-0.5">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop original content */}
                  <div className="hidden md:block text-center">
                    {/* Rank Badge */}
                    <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${themeForRank(rankedTop[0]?.computedRank ?? 1).badge}`}>
                      <span className="text-3xl font-bold">{rankedTop[0]?.computedRank ?? 1}</span>
                    </div>

                    {/* Medal Icon */}
                    <div className="mb-3">
                      <Trophy className={`w-16 h-16 mx-auto group-hover:scale-110 transition-transform ${themeForRank(rankedTop[0]?.computedRank ?? 1).trophy}`} />
                    </div>

                    {/* Faculty Info */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-xl mb-2 transition-colors">
                        {rankedTop[0]?.name ?? '—'}
                      </h3>
                      <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${themeForRank(rankedTop[0]?.computedRank ?? 1).codeChip}`}>
                        {rankedTop[0]?.code ?? '—'}
                      </span>
                    </div>

                    {/* Points Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Men's:</span>
                        <span className="text-blue-400 font-bold">{rankedTop[0]?.mensPoints ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Women's:</span>
                        <span className="text-pink-400 font-bold">{rankedTop[0]?.womensPoints ?? 0}</span>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className={`pt-4 px-3 border-t ${themeForRank(rankedTop[0]?.computedRank ?? 1).totalBorder}`}>
                      <div className={`text-5xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[0]?.computedRank ?? 1).pointsGradient}`}>
                        {rankedTop[0]?.totalPoints ?? 0}
                      </div>
                      <div className="text-xs text-yellow-400 mt-1 font-semibold">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card 
                onClick={() => navigate('/leaderboard')}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer order-3 md:order-3 md:mt-8 ${themeForRank(rankedTop[2]?.computedRank ?? 3).card}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-3 md:p-6 relative z-10">
                  {/* Mobile compact row layout */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeForRank(rankedTop[2]?.computedRank ?? 3).badge}`}>
                        <span className="text-lg font-bold">{rankedTop[2]?.computedRank ?? 3}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-white font-semibold text-sm">{rankedTop[2]?.name ?? '—'}</div>
                        <div className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${themeForRank(rankedTop[2]?.computedRank ?? 3).codeChip}`}>
                          {rankedTop[2]?.code ?? '—'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                          <span>Men's: <span className="text-blue-400 font-bold">{rankedTop[2]?.mensPoints ?? 0}</span></span>
                          <span>Women's: <span className="text-pink-400 font-bold">{rankedTop[2]?.womensPoints ?? 0}</span></span>
                        </div>
                      </div>
                      <div className="text-right px-2">
                        <div className={`text-2xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[2]?.computedRank ?? 3).pointsGradient}`}>
                          {rankedTop[2]?.totalPoints ?? 0}
                        </div>
                        <div className="text-[10px] text-gray-400 -mt-0.5">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop original content */}
                  <div className="hidden md:block text-center">
                    {/* Rank Badge */}
                    <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${themeForRank(rankedTop[2]?.computedRank ?? 3).badge}`}>
                      <span className="text-2xl font-bold">{rankedTop[2]?.computedRank ?? 3}</span>
                    </div>

                    {/* Medal Icon */}
                    <div className="mb-3">
                      <Trophy className={`w-12 h-12 mx-auto group-hover:scale-110 transition-transform ${themeForRank(rankedTop[2]?.computedRank ?? 3).trophy}`} />
                    </div>

                    {/* Faculty Info */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-lg mb-1 transition-colors">
                        {rankedTop[2]?.name ?? '—'}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${themeForRank(rankedTop[2]?.computedRank ?? 3).codeChip}`}>
                        {rankedTop[2]?.code ?? '—'}
                      </span>
                    </div>

                    {/* Points Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Men's:</span>
                        <span className="text-blue-400 font-bold">{rankedTop[2]?.mensPoints ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Women's:</span>
                        <span className="text-pink-400 font-bold">{rankedTop[2]?.womensPoints ?? 0}</span>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div className={`pt-4 px-3 border-t ${themeForRank(rankedTop[2]?.computedRank ?? 3).totalBorder}`}>
                      <div className={`text-4xl font-bold bg-clip-text text-transparent ${themeForRank(rankedTop[2]?.computedRank ?? 3).pointsGradient}`}>
                        {rankedTop[2]?.totalPoints ?? 0}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick Actions removed as requested */}
        </section>
      </div>
    </div>
  );
}
