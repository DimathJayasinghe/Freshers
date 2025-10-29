import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Calendar, Trophy, Users, Flame, ChevronRight } from "lucide-react";
import { liveMatches, todaySchedule } from "@/data/homeData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section - Full viewport height on mobile, auto on desktop */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)]">
        <div className="bg-gradient-to-br from-red-950 via-black to-red-950 min-h-[calc(100vh-64px)]">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 ">
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
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight px-2 animate-fade-in-up delay-200">
              <span className="block text-lg sm:text-xl md:text-2xl lg:text-4xl font-semibold mb-2 text-gray-300">
                Welcome to
              </span>
              <span className="block bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
                UOC Freshers' Meet 2025
              </span>
            </h1>
            
            <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4 animate-fade-in-up delay-300">
              Experience the spirit of competition and camaraderie. Follow live matches, 
              check schedules, view leaderboards, and celebrate victories together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 px-4 animate-fade-in-up delay-400">
              <Button 
                onClick={() => navigate('/results')}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg shadow-red-500/50 group"
              >
                View Live Matches
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate('/lineup')}
                variant="outline" 
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Check Schedule
              </Button>
            </div>
          </div>
        </div>
        </div>
        
        {/* Stats/Highlights Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-md bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              <div 
                onClick={() => navigate('/sports')}
                className="text-center cursor-pointer hover:scale-105 transition-transform group"
              >
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">12+</div>
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 group-hover:text-yellow-400 transition-colors">Sports Events</div>
              </div>
              <div 
                onClick={() => navigate('/faculties')}
                className="text-center cursor-pointer hover:scale-105 transition-transform group"
              >
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">11</div>
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Faculties</div>
              </div>
              <div 
                onClick={() => navigate('/results')}
                className="text-center cursor-pointer hover:scale-105 transition-transform group"
              >
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{liveMatches.length}</div>
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 group-hover:text-red-400 transition-colors">Live Now</div>
              </div>
              <div 
                onClick={() => navigate('/lineup')}
                className="text-center cursor-pointer hover:scale-105 transition-transform group"
              >
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:scale-110 transition-transform" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{todaySchedule.length}</div>
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 group-hover:text-green-400 transition-colors">Today's Matches</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 py-8 md:py-12">
        {/* Live Results Section */}
        <section className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 md:mb-8">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Live Results</h2>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent hidden sm:block"></div>
            <Button
              onClick={() => navigate('/results')}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 group"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {liveMatches.map((match, index) => (
              <Card
                key={match.id}
                onClick={() => navigate('/results')}
                className="group relative overflow-hidden bg-gradient-to-br from-red-950/50 via-gray-900 to-black border-red-800/50 hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-base md:text-lg mb-1 group-hover:text-red-400 transition-colors truncate flex items-center gap-2">
                        <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                        {match.sport}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-gray-400 truncate ml-3">{match.venue}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse flex-shrink-0 shadow-lg shadow-red-500/50">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      LIVE
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/5 to-transparent group-hover:from-white/10 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold text-sm md:text-base truncate">{match.team1}</span>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-white/10">
                        <span className="text-gray-400 text-xs font-bold">VS</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/5 to-transparent group-hover:from-white/10 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold text-sm md:text-base truncate">{match.team2}</span>
                    </div>
                    <div className={`text-center pt-2 font-bold text-sm ${match.statusColor} px-4 py-2 bg-black/30 rounded-lg border border-white/5`}>
                      {match.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {liveMatches.length === 0 && (
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
            <div className="flex items-center gap-2 sm:gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2">
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
            {todaySchedule.map((event, index) => (
              <Card
                key={event.id}
                onClick={() => navigate('/lineup')}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-950/20 via-black to-gray-900 border-yellow-800/30 hover:border-yellow-600/50 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-3 sm:p-4 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Time Badge */}
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black rounded-xl p-3 min-w-[90px] text-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-yellow-500/20">
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-bold text-sm">{event.time}</div>
                    </div>

                    {/* Sport & Match Info */}
                    <div className="flex-1 bg-gradient-to-r from-white/5 to-transparent p-3 rounded-lg group-hover:from-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">{event.sport}</div>
                          <div className="text-gray-400 text-xs">{event.match}</div>
                        </div>
                      </div>
                      
                      {/* Teams */}
                      <div className="flex items-center gap-2 sm:gap-3 justify-center mt-3">
                        <span className="text-white font-semibold text-sm md:text-base truncate flex-1 text-center sm:text-left bg-black/30 px-3 py-2 rounded-lg">
                          {event.team1}
                        </span>
                        <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 shadow-lg">
                          VS
                        </span>
                        <span className="text-white font-semibold text-sm md:text-base truncate flex-1 text-center sm:text-right bg-black/30 px-3 py-2 rounded-lg">
                          {event.team2}
                        </span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2 text-gray-400 text-sm bg-black/30 px-4 py-2 rounded-lg flex-shrink-0 group-hover:text-yellow-400 transition-colors">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                      <span className="font-medium">{event.venue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {todaySchedule.length === 0 && (
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

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card 
              onClick={() => navigate('/leaderboard')}
              className="bg-gradient-to-br from-yellow-900/20 via-black to-gray-900 border-yellow-700/30 hover:border-yellow-500/50 cursor-pointer group transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 group-hover:text-yellow-400 transition-colors">
                  Leaderboard
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">View faculty rankings</p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => navigate('/sports')}
              className="bg-gradient-to-br from-red-900/20 via-black to-gray-900 border-red-700/30 hover:border-red-500/50 cursor-pointer group transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 group-hover:text-red-400 transition-colors">
                  All Sports
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Browse all events</p>
              </CardContent>
            </Card>

            <Card 
              onClick={() => navigate('/faculties')}
              className="bg-gradient-to-br from-blue-900/20 via-black to-gray-900 border-blue-700/30 hover:border-blue-500/50 cursor-pointer group transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1"
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-base sm:text-lg mb-1 group-hover:text-blue-400 transition-colors">
                  Faculties
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Explore competing teams</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
