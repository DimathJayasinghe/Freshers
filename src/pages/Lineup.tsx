import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, CalendarDays, Sparkles, ChevronRight } from "lucide-react";
// no local fallbacks; rely on Supabase only
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { fetchScheduleCalendar, type ScheduleDay } from "../lib/api";

export function Lineup() {
  const navigate = useNavigate();
  const [days, setDays] = useState<ScheduleDay[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchScheduleCalendar()
      .then((d) => { if (mounted) setDays(d); })
      .catch((e) => console.error('[Lineup] fetchScheduleCalendar error', e));
    return () => { mounted = false; };
  }, []);

  const handleSportClick = (sport: string) => {


    // Generate a slug from the sport label for routing
    const sportId = sport.toLowerCase().replace(/\s+/g, '-').replace(/[()&']/g, '');
    if (sportId === 'closing-ceremony') {
      navigate('/closing-ceremony');
    } else {
      navigate(`/sport/${sportId}`);
    }
  };

  const dayList = days;
  const totalEvents = dayList.reduce((sum, day) => sum + day.events.length, 0);

  return (
    <div className="min-h-screen">
      {/* Page Header with Animated Background */}
      <section className="relative bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 rounded-full px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-blue-400 text-sm font-semibold">Event Calendar</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white animate-fade-in-up">
              Championship <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Schedule</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
              Complete day-by-day calendar for UOC Freshers' Meet 2025
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/50 px-4 py-2 text-sm hover:bg-green-600/30 transition-all animate-fade-in-up delay-300">
                <CalendarDays className="w-4 h-4 mr-2 inline" />
                {dayList.length} Days
              </Badge>
              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/50 px-4 py-2 text-sm hover:bg-yellow-600/30 transition-all animate-fade-in-up delay-400">
                <Clock className="w-4 h-4 mr-2 inline" />
                {totalEvents} Events
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="space-y-6">
          {dayList.map((day, index) => {
              // Parse the date to get day number and month
              const dateObj = new Date(day.date);
              const dayNumber = dateObj.getDate();
              const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <Card
                  key={index}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-xl overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-red-950/50 to-black border-b border-white/10 group-hover:from-red-900/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Calendar Date Box */}
                      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-3 min-w-[70px] text-center shadow-lg group-hover:scale-105 transition-transform">
                        <div className="text-white/80 text-xs font-semibold uppercase">{monthName}</div>
                        <div className="text-white text-3xl font-bold leading-none my-1">{dayNumber}</div>
                        <div className="text-white/80 text-xs font-semibold uppercase">{dayName}</div>
                      </div>
                      
                      {/* Date Title */}
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl group-hover:text-yellow-400 transition-colors">
                          <Calendar className="h-5 w-5 text-yellow-500" />
                          {day.date}
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{day.events.length} event{day.events.length !== 1 ? 's' : ''} scheduled</p>
                      </div>

                      {/* Day Badge */}
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 hidden md:inline-flex">
                        Day {index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex}>
                          <div
                            onClick={() => handleSportClick(event.sport)}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-white/10 hover:shadow-lg hover:shadow-red-500/10 transition-all cursor-pointer group/event"
                          >
                            {/* Sport Name */}
                            <div className="md:col-span-5 flex items-center gap-3">
                              <div className="w-1 h-full min-h-[40px] bg-gradient-to-b from-red-600 to-yellow-500 rounded group-hover/event:from-yellow-500 group-hover/event:to-red-600 transition-all"></div>
                              <div className="flex-1">
                                <p className="text-white font-semibold text-sm md:text-base group-hover/event:text-yellow-400 transition-colors flex items-center gap-2">
                                  {event.sport}
                                  <ChevronRight className="w-4 h-4 opacity-0 group-hover/event:opacity-100 group-hover/event:translate-x-1 transition-all" />
                                </p>
                                <p className="text-gray-500 text-xs mt-0.5 md:hidden flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {event.time}
                                </p>
                              </div>
                            </div>

                            {/* Time */}
                            <div className="md:col-span-4 hidden md:flex items-center gap-2 text-gray-300 text-sm md:text-base">
                              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>

                            {/* Venue */}
                            <div className="md:col-span-3 flex items-center gap-2 text-gray-300 text-sm md:text-base">
                              <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          </div>
                          
                          {eventIndex < day.events.length - 1 && (
                            <Separator className="my-3 bg-white/5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <Card className="bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border-red-500/30 overflow-hidden">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Check back regularly for schedule updates and live results
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => navigate('/results')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                View Results
              </Button>
              <Button 
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                Check Leaderboard
              </Button>
              <Button 
                onClick={() => navigate('/closing-ceremony')}
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              >
                Closing Ceremony
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
