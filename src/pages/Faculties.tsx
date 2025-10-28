import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { faculties } from "@/data/facultiesData";
import { Trophy, Users, Medal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Faculties() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-red-950 via-black to-gray-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-600/20 border border-yellow-500/50 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400 text-sm font-semibold">Competing Teams</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Participating <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">Faculties</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Explore the competing faculties and campuses in UOC Freshers' Meet 2025
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Current Standings Preview */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Current Standings</h2>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties.slice(0, 3).map((faculty, index) => (
              <Card
                key={faculty.id}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-yellow-800/50 hover:border-yellow-600 transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: faculty.colors.primary }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{faculty.shortName}</CardTitle>
                        <p className="text-xs text-gray-400 mt-1">{faculty.name}</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total Points</span>
                      <span className="text-white font-bold text-lg">{faculty.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Sports</span>
                      <span className="text-white font-semibold">{faculty.sportsParticipated.length}</span>
                    </div>
                    {faculty.achievements.length > 0 && (
                      <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-yellow-500 text-xs">
                          <Medal className="w-4 h-4" />
                          <span>Recent: {faculty.achievements[0].sport} {faculty.achievements[0].position}</span>
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
            {faculties.map((faculty) => (
              <Card
                key={faculty.id}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-red-800/30 hover:border-red-600 transition-all duration-300 group cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
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
                  <p className="text-gray-400 text-sm italic">{faculty.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{faculty.totalPoints}</div>
                      <div className="text-xs text-gray-400 mt-1">Points</div>
                    </div>
                    <div className="bg-black/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{faculty.sportsParticipated.length}</div>
                      <div className="text-xs text-gray-400 mt-1">Sports</div>
                    </div>
                  </div>

                  {/* Sports Tags */}
                  <div className="flex flex-wrap gap-2">
                    {faculty.sportsParticipated.slice(0, 3).map((sport) => (
                      <span
                        key={sport}
                        className="px-2 py-1 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300"
                      >
                        {sport}
                      </span>
                    ))}
                    {faculty.sportsParticipated.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                        +{faculty.sportsParticipated.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    size="sm"
                  >
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
