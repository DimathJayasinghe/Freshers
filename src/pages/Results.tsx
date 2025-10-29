import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Trophy, Medal, ArrowRight } from "lucide-react";
import type { CompletedEvent } from "@/data/resultsData";
import { getFacultyIdByName } from "@/data/facultiesData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchResults } from "@/lib/api";

export function Results() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CompletedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchResults()
      .then((data) => { if (mounted) setRows(data || []); })
      .catch((e) => { console.error('[Results] fetchResults error', e); if (mounted) setError('Failed to load results'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Handle faculty name click
  const handleFacultyClick = (e: React.MouseEvent, facultyName: string) => {
    e.stopPropagation();
    const facultyId = getFacultyIdByName(facultyName);
    if (facultyId) {
      navigate(`/faculty/${facultyId}`);
    }
  };
  
  // Group events - now each event has all positions in a single entry
  const sortedEvents = [...rows].sort((a, b) => {
    // Sort by date then time
    return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
  });

  // Handle navigation based on category
  const handleCardClick = (event: CompletedEvent) => {
    // All sports go to their specific sport detail page
    navigate(`/sport/${event.sport.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Medal className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/50 rounded-full px-4 py-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-sm font-semibold">Completed Events</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Live <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Results</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              View completed events, winners, and championship results
            </p>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={`res-skel-${idx}`} className="border-2 border-white/10 animate-pulse">
                <CardHeader className="pb-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg w-9 h-9" />
                      <div>
                        <div className="h-5 w-40 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-28 bg-white/10 rounded" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-3 w-16 bg-white/10 rounded mb-1" />
                      <div className="h-3 w-20 bg-white/10 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {Array.from({ length: 3 }).map((__, i2) => (
                    <div key={i2} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-24 bg-white/10 rounded" />
                      </div>
                      <div className="h-6 w-10 bg-white/10 rounded" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-400 py-8">{error}</div>
        )}
        {!loading && !error && sortedEvents.length === 0 && (
          <div className="text-center text-gray-400 py-8">No results available yet.</div>
        )}
        {/* Results Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedEvents.map((event) => (
            <Card
              key={event.id}
              onClick={() => handleCardClick(event)}
              className="border-2 border-red-800/50 hover:border-red-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <Trophy className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl font-bold">
                        {event.sport}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          event.gender === "Men's" ? 'bg-blue-600/20 text-blue-400' : 
                          event.gender === "Women's" ? 'bg-pink-600/20 text-pink-400' : 
                          'bg-purple-600/20 text-purple-400'
                        }`}>
                          {event.gender}
                        </span>
                        {event.event && <span className="text-gray-400 text-sm">{event.event}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          event.category === "Team Sport" ? 'bg-green-600/20 text-green-400' :
                          event.category === "Athletics" ? 'bg-orange-600/20 text-orange-400' :
                          event.category === "Swimming" ? 'bg-cyan-600/20 text-cyan-400' :
                          'bg-purple-600/20 text-purple-400'
                        }`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-gray-500 mb-1">Updated</div>
                    <div className="text-gray-300 font-medium animate-pulse">{event.date}</div>
                    <div className="text-gray-400">{event.time}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Top 3 Positions */}
                {event.positions.slice(0, 3).map((position) => (
                  <div 
                    key={position.place}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      position.place === 1 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-2 border-yellow-500/40' 
                        : position.place === 2
                        ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-2 border-gray-400/40'
                        : 'bg-gradient-to-r from-amber-600/20 to-transparent border-2 border-amber-600/40'
                    }`}
                  >
                    {/* Medal */}
                    <div className={`flex-shrink-0 p-2 rounded-full ${
                      position.place === 1 ? 'bg-yellow-500/20 animate-pulse' :
                      position.place === 2 ? 'bg-gray-400/20' :
                      'bg-amber-600/20'
                    }`}>
                      {getMedalIcon(position.place)}
                    </div>

                    {/* Position Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold uppercase mb-1 ${
                        position.place === 1 ? 'text-yellow-400' :
                        position.place === 2 ? 'text-gray-300' :
                        'text-amber-500'
                      }`}>
                        {position.place === 1 ? '🥇 Champion' : 
                         position.place === 2 ? '🥈 Runner-up' : 
                         '🥉 Third Place'}
                      </div>
                      <div 
                        className="text-white font-semibold text-base hover:text-red-400 cursor-pointer transition-colors underline decoration-transparent hover:decoration-red-400"
                        onClick={(e) => handleFacultyClick(e, position.faculty)}
                      >
                        {position.faculty}
                      </div>
                    </div>

                    {/* Position Number */}
                    <div className={`text-2xl font-black ${
                      position.place === 1 ? 'text-yellow-400' :
                      position.place === 2 ? 'text-gray-300' :
                      'text-amber-500'
                    }`}>
                      #{position.place}
                    </div>
                  </div>
                ))}

                {/* Show More Link - always visible */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(event);
                  }}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer group"
                >
                  <span>
                    {event.category === "Team Sport" 
                      ? "View full standings" 
                      : "View all events"}
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
