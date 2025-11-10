import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sparkles, Target, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFacultiesOverview, type FacultyOverview } from "../lib/api";

export function Faculties() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<FacultyOverview[] | null>(null);
  const loading = rows === null;

  useEffect(() => {
    let mounted = true;
    fetchFacultiesOverview()
      .then((data) => { if (mounted) setRows(data); })
      .catch((err) => console.error('[Faculties] fetchFacultiesOverview error', err));
    return () => { mounted = false; };
  }, []);

  // Sort by rank (leaderboard position)
  const list = rows ? [...rows].sort((a, b) => {
    const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  }) : [];
  return (
    <div className="min-h-screen">
      {/* Page Header with Animated Background */}
      <section className="relative bg-gradient-to-br from-red-950 via-black to-gray-900 py-12 md:py-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/50 rounded-full px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Users className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400 text-sm font-semibold">Competing Teams</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white animate-fade-in-up">
              Participating <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">Faculties</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
              Explore the competing faculties and campuses in UOC Freshers' Meet 2025
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
              {loading ? (
                <div className="h-8 w-40 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 px-4 py-2 text-sm animate-fade-in-up delay-300">
                  <Target className="w-4 h-4 mr-2 inline" />
                  {list.length} Faculties
                </Badge>
              )}
              {loading ? (
                <div className="h-8 w-44 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <Badge className="bg-green-600/20 text-green-400 border-green-500/50 px-4 py-2 text-sm animate-fade-in-up delay-400">
                  <Award className="w-4 h-4 mr-2 inline" />
                  Active Competition
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* All Faculties Grid */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">All Faculties</h2>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({ length: 6 }).map((_, index) => (
              <Card key={`skeleton-all-${index}`} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10 animate-pulse">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white/10 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-56 bg-white/10 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-14 bg-white/10 rounded" />
                    <div className="h-14 bg-white/10 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-white/10 rounded" />
                    <div className="h-6 w-12 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-9 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
            {!loading && list.map((faculty, index) => (
              <Card
                key={faculty.id}
                onClick={() => navigate(`/faculty/${faculty.id}`)}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-red-800/30 hover:border-red-600 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-red-500/10 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                      <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg"
                      style={{ backgroundColor: faculty.colors.primary + '20', border: `2px solid ${faculty.colors.primary}` }}
                    >
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: faculty.colors.primary }}
                      >
                          {faculty.shortName.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-white text-lg group-hover:text-red-400 transition-colors">
                          {faculty.shortName}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-bold">#{faculty.rank ?? '-'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">{faculty.name}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-lg p-3 text-center group-hover:border-yellow-500/40 transition-colors">
                      <div className="text-2xl font-bold text-white">{faculty.totalPoints}</div>
                      <div className="text-xs text-gray-400 mt-1">Points</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-3 text-center group-hover:border-blue-500/40 transition-colors">
                      <div className="text-2xl font-bold text-white">{faculty.sportsCount}</div>
                      <div className="text-xs text-gray-400 mt-1">Sports</div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/faculty/${faculty.id}`);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white group/btn"
                    size="sm"
                  >
                    View Full Profile
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border-red-500/30">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold text-white mb-2">Follow the Competition</h3>
            <p className="text-gray-400 mb-6">
              Stay updated with live scores, schedules, and faculty achievements
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => navigate('/lineup')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                View Schedule
              </Button>
              <Button 
                onClick={() => navigate('/results')}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                Check Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
