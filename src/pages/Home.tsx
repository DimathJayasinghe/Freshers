import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Calendar, Trophy, Users, Flame, ChevronRight } from "lucide-react";
import { liveMatches, todaySchedule } from "@/data/homeData";
import { Button } from "@/components/ui/button";

export function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section */}
      <section className="relative bg-gradient-to-br from-red-950 via-black to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-red-400 text-sm font-semibold">University of Colombo</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold mb-2 text-gray-300">
                Welcome to
              </span>
              <span className="block bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
                UOC Freshers' Meet 2025
              </span>
            </h1>
            
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Experience the spirit of competition and camaraderie. Follow live matches, 
              check schedules, view leaderboards, and celebrate victories together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-red-500/50 group">
                View Live Matches
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full backdrop-blur-sm">
                Check Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Stats/Highlights Bar */}
        <div className="relative border-t border-white/10 backdrop-blur-sm bg-black/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="text-2xl md:text-3xl font-bold text-white">12+</div>
                </div>
                <div className="text-xs md:text-sm text-gray-400">Sports Events</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div className="text-2xl md:text-3xl font-bold text-white">20+</div>
                </div>
                <div className="text-xs md:text-sm text-gray-400">Faculties</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{liveMatches.length}</div>
                </div>
                <div className="text-xs md:text-sm text-gray-400">Live Now</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{todaySchedule.length}</div>
                </div>
                <div className="text-xs md:text-sm text-gray-400">Today's Matches</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 md:space-y-12 py-8 md:py-12">
        {/* Live Matches Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Live Matches</h2>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {liveMatches.map((match) => (
            <Card
              key={match.id}
              className="bg-gradient-to-br from-red-950/50 via-gray-900 to-black border-red-800 hover:border-red-600 transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-base md:text-lg mb-1">{match.sport}</CardTitle>
                    <p className="text-xs md:text-sm text-gray-400">{match.venue}</p>
                  </div>
                  <span className="px-2 md:px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    LIVE
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded"></div>
                    <span className="text-white font-medium text-sm md:text-base">{match.team1}</span>
                  </div>
                  <div className="text-center text-gray-500 text-sm font-semibold">vs</div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded"></div>
                    <span className="text-white font-medium text-sm md:text-base">{match.team2}</span>
                  </div>
                  <div className={`text-center pt-2 font-semibold ${match.statusColor}`}>
                    {match.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <span className="text-yellow-500">💡</span>
              Click on any live match to view the tournament draw and bracket
            </p>
          </div>
        </section>

        {/* Today's Schedule Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Calendar className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Today's Schedule</h2>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>

        <div className="space-y-4">
          {todaySchedule.map((event) => (
            <Card
              key={event.id}
              className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-red-800/50 hover:border-red-600 transition-all duration-300 cursor-pointer"
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  {/* Time Badge */}
                  <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black rounded-lg p-2 md:p-3 min-w-[80px] md:min-w-[100px] text-center flex-shrink-0">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 mx-auto mb-1" />
                    <div className="font-bold text-xs md:text-sm">{event.time}</div>
                  </div>

                  {/* Sport Badge */}
                  <div className="bg-red-900/30 border border-red-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm">
                    {event.sport}
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">{event.match}</div>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center justify-center gap-2 md:gap-4">
                    <span className="text-white font-medium text-xs md:text-base truncate">{event.team1}</span>
                    <span className="bg-white text-black px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0">
                      vs
                    </span>
                    <span className="text-white font-medium text-xs md:text-base truncate">{event.team2}</span>
                  </div>

                  {/* Venue */}
                  <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  </div>
  );
}
