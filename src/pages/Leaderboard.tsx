import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import type { TeamData } from "../data/leaderboardData";
import { getFacultyIdByName } from "../data/facultiesData";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/api";

export function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TeamData[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchLeaderboard()
      .then((data) => {
        if (!mounted) return;
        if (data) setRows(data);
      })
      .catch((err) => {
        console.error('[Leaderboard] fetch error', err);
        // Fallback to static data silently
      })
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Handle faculty name click
  const handleFacultyClick = (facultyName: string) => {
    const facultyId = getFacultyIdByName(facultyName);
    if (facultyId) {
      navigate(`/faculty/${facultyId}`);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-7 w-7 text-yellow-500 drop-shadow-lg" />;
    if (rank === 2) return <Medal className="h-7 w-7 text-gray-400 drop-shadow-lg" />;
    if (rank === 3) return <Award className="h-7 w-7 text-orange-600 drop-shadow-lg" />;
    return <span className="text-xl font-bold text-gray-500">#{rank}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Page Header with Animated Background */}
      <section className="relative bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/50 rounded-full px-4 py-2 animate-fade-in backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400 text-sm font-semibold">Rankings</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white animate-fade-in-up">
              Faculty <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Leaderboard</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
              Real-time standings of competing faculties in UOC Freshers' Meet 2025
            </p>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 max-w-4xl mx-auto">
              {leaderboardData.slice(0, 3).map((team, index) => (
                <Card
                  key={team.rank}
                  onClick={() => handleFacultyClick(team.name)}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 animate-scale-in ${
                    index === 0 
                      ? 'md:order-2 bg-gradient-to-br from-yellow-500/20 via-amber-600/10 to-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                      : index === 1
                      ? 'md:order-1 bg-gradient-to-br from-gray-400/20 via-gray-500/10 to-gray-400/20 border-gray-400/50'
                      : 'md:order-3 bg-gradient-to-br from-orange-600/20 via-orange-700/10 to-orange-600/20 border-orange-500/50'
                  }`}
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      {getMedalIcon(team.rank)}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{team.code}</h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-1">{team.name}</p>
                    <Separator className="my-3 bg-white/10" />
                    <div className="text-3xl font-bold text-white mb-1">{team.totalPoints}</div>
                    <p className="text-gray-400 text-xs">Total Points</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <div className="text-white font-semibold">{team.mensPoints}</div>
                        <div className="text-gray-500">Men's</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{team.womensPoints}</div>
                        <div className="text-gray-500">Women's</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rows.length === 0 && (
                <div className="col-span-1 md:col-span-3 text-center text-gray-400 text-sm">
                  No leaderboard data
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-950/50 to-black border-b border-white/10">
            <CardTitle className="text-white text-xl md:text-2xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Complete Faculty Rankings
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              Click on any faculty to view their detailed profile and achievements
            </p>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {/* Header Row */}
            <div className="hidden md:grid md:grid-cols-10 gap-4 p-4 bg-gradient-to-r from-red-900/20 to-transparent rounded-lg mb-4 font-semibold text-gray-300 text-sm border border-white/5">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Faculty</div>
              <div className="col-span-5 grid grid-cols-3 gap-4 text-center">
                <div>Men's Points</div>
                <div>Women's Points</div>
                <div className="text-yellow-400 font-bold">Total Points</div>
              </div>
            </div>

            {/* Team Rows */}
            <div className="space-y-3">
              {leaderboardData.map((team, index) => (
                <div
                  key={team.rank}
                  onClick={() => handleFacultyClick(team.name)}
                  className={`grid grid-cols-1 md:grid-cols-10 gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] cursor-pointer group animate-fade-in-up ${
                    team.rank <= 3
                      ? "bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/10"
                      : "bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/40 hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="md:col-span-1 flex md:justify-center items-center">
                    <div className="flex items-center gap-3 md:block md:text-center">
                      <div className="flex justify-center transform group-hover:scale-110 transition-transform">
                        {getMedalIcon(team.rank)}
                      </div>
                      <div className="md:hidden flex-1">
                        <span className="text-white font-semibold text-base block">
                          {team.name}
                        </span>
                        <span className="text-gray-400 text-xs">{team.code}</span>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Name (Desktop only) */}
                  <div className="hidden md:flex md:col-span-4 items-center group-hover:translate-x-2 transition-transform">
                    <div>
                      <h3 className="text-white font-semibold text-base lg:text-lg group-hover:text-yellow-400 transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-400 text-xs">{team.code}</p>
                        {team.rank <= 3 && (
                          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/50 text-xs px-2 py-0">
                            Top {team.rank}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="md:col-span-5 grid grid-cols-3 gap-3 text-center">
                    <div className="flex flex-col justify-center">
                      <div className="text-white font-bold text-xl lg:text-2xl">
                        {team.mensPoints}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">Men's</div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-white font-bold text-xl lg:text-2xl">
                        {team.womensPoints}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">Women's</div>
                    </div>
                    <div className="flex flex-col justify-center group-hover:scale-110 transition-transform">
                      <div className="text-yellow-400 font-bold text-xl lg:text-2xl">
                        {team.totalPoints}
                      </div>
                      <div className="text-gray-400 text-xs mt-1 font-semibold">Total</div>
                    </div>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-6">No data loaded</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Info Card */}
        <Card className="mt-6 bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border-red-500/30">
          <CardContent className="p-6 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold text-white mb-2">Competition Updates</h3>
            <p className="text-gray-400 text-sm">
              Rankings are updated in real-time based on match results. Check back frequently for the latest standings!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
