import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faculties } from "@/data/facultiesData";
import { Trophy, Users, Medal, TrendingUp, Sparkles, Target, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function Faculties() {
  const navigate = useNavigate();
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
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 px-4 py-2 text-sm animate-fade-in-up delay-300">
                <Target className="w-4 h-4 mr-2 inline" />
                {faculties.length} Faculties
              </Badge>
              <Badge className="bg-green-600/20 text-green-400 border-green-500/50 px-4 py-2 text-sm animate-fade-in-up delay-400">
                <Award className="w-4 h-4 mr-2 inline" />
                Active Competition
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Top 3 Standings */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Top Performers</h2>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              size="sm"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 group"
            >
              View Full Rankings
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.slice(0, 3).map((faculty, index) => (
              <Card
                key={faculty.id}
                onClick={() => navigate(`/faculty/${faculty.id}`)}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 animate-scale-in ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-500/20 via-amber-600/10 to-yellow-500/20 border-yellow-600/50 shadow-lg shadow-yellow-500/20' 
                    : 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border-yellow-800/50 hover:border-yellow-600'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg"
                        style={{ backgroundColor: faculty.colors.primary }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg group-hover:text-yellow-400 transition-colors">
                          {faculty.shortName}
                        </CardTitle>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{faculty.name}</p>
                      </div>
                    </div>
                    {index === 0 ? (
                      <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Award className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
                      <span className="text-gray-400 text-sm">Total Points</span>
                      <span className="text-white font-bold text-xl">{faculty.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
                      <span className="text-gray-400 text-sm">Sports</span>
                      <span className="text-white font-semibold">{faculty.sportsParticipated.length}</span>
                    </div>
                    {faculty.achievements.length > 0 && (
                      <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-yellow-500 text-xs">
                          <Medal className="w-4 h-4" />
                          <span className="line-clamp-1">Recent: {faculty.achievements[0].sport} {faculty.achievements[0].position}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Faculties Grid */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">All Faculties</h2>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty, index) => (
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
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-white font-bold">#{faculty.position}</span>
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
                      <div className="text-2xl font-bold text-white">{faculty.sportsParticipated.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Sports</div>
                    </div>
                  </div>

                  {/* Sports Tags */}
                  <div className="flex flex-wrap gap-2">
                    {faculty.sportsParticipated.slice(0, 3).map((sport) => (
                      <Badge
                        key={sport}
                        className="bg-red-900/30 border border-red-700/50 text-red-300 text-xs hover:bg-red-900/50 transition-colors"
                      >
                        {sport}
                      </Badge>
                    ))}
                    {faculty.sportsParticipated.length > 3 && (
                      <Badge className="bg-gray-800 text-gray-400 text-xs border-gray-700">
                        +{faculty.sportsParticipated.length - 3}
                      </Badge>
                    )}
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
