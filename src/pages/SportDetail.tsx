import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowLeft, Users, Award, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchResults } from "@/lib/api";
import { getShortFacultyName } from "@/data/tournamentData";
import { getFacultyIdByName } from "@/data/facultiesData";

export function SportDetail() {
  const { sportName } = useParams<{ sportName: string }>();
  const navigate = useNavigate();
  const [showMens, setShowMens] = useState(true);
  const [showWomens, setShowWomens] = useState(true);
  const [showMixed, setShowMixed] = useState(true);
  const [allResults, setAllResults] = useState([] as Awaited<ReturnType<typeof fetchResults>>);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchResults()
      .then((rows) => { if (mounted) setAllResults(rows || []); })
      .catch((e) => { console.error('[SportDetail] fetchResults error', e); if (mounted) setError('Failed to load results'); })
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

  // Filter results for this sport
  const sportResults = allResults.filter(
    (event) => event.sport.toLowerCase().replace(/\s+/g, '-') === sportName
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  if (sportResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">No results for this sport yet</h1>
          <Button onClick={() => navigate('/results')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const sportName_display = sportResults[0].sport;
  const sportCategory = sportResults[0].category;

  // Calculate insights
  const mensEvents = sportResults.filter(r => r.gender === "Men's");
  const womensEvents = sportResults.filter(r => r.gender === "Women's");
  const mixedEvents = sportResults.filter(r => r.gender === "Mixed");
  
  const totalTeams = new Set(
    sportResults.flatMap(event => event.positions.map(p => p.faculty))
  ).size;
  
  const totalEvents = sportResults.length;
  const latestEvent = sportResults[0];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Back Button and Badge Row */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/results')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-full px-4 py-2 animate-pulse">
              <Trophy className="w-4 h-4 text-red-500" />
              <span className="text-red-400 text-sm font-semibold">Results & Standings</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {sportName_display}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full ${
                sportCategory === "Team Sport" ? 'bg-green-600/20 text-green-400' :
                sportCategory === "Athletics" ? 'bg-orange-600/20 text-orange-400' :
                sportCategory === "Swimming" ? 'bg-cyan-600/20 text-cyan-400' :
                'bg-purple-600/20 text-purple-400'
              }`}>
                {sportCategory}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {sportCategory === "Team Sport" 
                ? "Complete standings and results" 
                : "Event-wise results and rankings"}
            </p>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Teams */}
          <Card className="border-2 border-red-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{totalTeams}</div>
                <div className="text-xs text-gray-400">Total Teams</div>
              </div>
            </CardContent>
          </Card>

          {/* Total Events */}
          <Card className="border-2 border-blue-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{totalEvents}</div>
                <div className="text-xs text-gray-400">Events Completed</div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Champion */}
          <Card className="border-2 border-yellow-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-yellow-600/20 rounded-lg animate-pulse">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white truncate">
                  {getShortFacultyName(latestEvent.positions[0].faculty)}
                </div>
                <div className="text-xs text-gray-400">Latest Champion</div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card className="border-2 border-purple-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{latestEvent.date}</div>
                <div className="text-xs text-gray-400">Last Updated</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Division Toggles */}
        <div className="flex flex-wrap gap-3 mb-6">
          {mensEvents.length > 0 && (
            <Button
              variant={showMens ? "default" : "outline"}
              onClick={() => setShowMens(!showMens)}
              className={`${
                showMens 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-blue-600/50 text-blue-400 hover:bg-blue-600/10'
              }`}
            >
              Men's Division ({mensEvents.length})
            </Button>
          )}
          {womensEvents.length > 0 && (
            <Button
              variant={showWomens ? "default" : "outline"}
              onClick={() => setShowWomens(!showWomens)}
              className={`${
                showWomens 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'border-pink-600/50 text-pink-400 hover:bg-pink-600/10'
              }`}
            >
              Women's Division ({womensEvents.length})
            </Button>
          )}
          {mixedEvents.length > 0 && (
            <Button
              variant={showMixed ? "default" : "outline"}
              onClick={() => setShowMixed(!showMixed)}
              className={`${
                showMixed 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-purple-600/50 text-purple-400 hover:bg-purple-600/10'
              }`}
            >
              Mixed Division ({mixedEvents.length})
            </Button>
          )}
        </div>
        {/* Standings View - Leaderboard Style */}
        <div className="space-y-6">
          {/* Men's Division */}
          {showMens && mensEvents.length > 0 && (
            <Card className="border-2 border-blue-800/50 bg-gradient-to-br from-gray-900 to-black shadow-xl">
              <div className="px-6 py-4 border-b border-gray-800 bg-blue-600/10">
                <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Men's Division Standings
                </h2>
              </div>
              <CardContent className="p-0">
                {mensEvents.map((event) => (
                  <div key={event.id} className="border-b border-gray-800 last:border-b-0">
                    {/* Event Info Section */}
                    <div className="px-6 py-3 bg-gray-900/50 border-b border-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          {event.event && (
                            <h3 className="text-sm font-semibold text-blue-400 mb-1">{event.event}</h3>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Scheduled: {event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>Main Grounds</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Updated: </span>
                          <span className="text-green-400 font-semibold">{event.date} {event.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {/* Leaderboard Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-800 mb-2">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-7">Team</div>
                        <div className="col-span-4 text-right">Status</div>
                      </div>
                      
                      {/* Leaderboard Rows */}
                      {event.positions.map((position) => (
                          <div
                            key={position.place}
                            className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg mb-2 transition-all hover:scale-[1.01] ${
                              position.place === 1
                                ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500 animate-pulse'
                                : position.place === 2
                                ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-l-4 border-gray-400'
                                : position.place === 3
                                ? 'bg-gradient-to-r from-amber-600/20 to-transparent border-l-4 border-amber-600'
                                : 'bg-gray-800/30 border-l-4 border-gray-700'
                            }`}
                          >
                          {/* Rank */}
                          <div className="col-span-1">
                            <div
                              className={`text-2xl font-black ${
                                position.place === 1
                                  ? 'text-yellow-400'
                                  : position.place === 2
                                  ? 'text-gray-300'
                                  : position.place === 3
                                  ? 'text-amber-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {position.place}
                            </div>
                          </div>

                          {/* Team Name */}
                          <div className="col-span-7">
                            <div 
                              className="text-white font-bold text-lg hover:text-red-400 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs hover:text-gray-300 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-4 text-right">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && '🥇 Champion'}
                              {position.place === 2 && '🥈 Runner-up'}
                              {position.place === 3 && '🥉 Third'}
                              {position.place > 3 && `#${position.place}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Women's Division */}
          {showWomens && womensEvents.length > 0 && (
            <Card className="border-2 border-pink-800/50 bg-gradient-to-br from-gray-900 to-black shadow-xl">
              <div className="px-6 py-4 border-b border-gray-800 bg-pink-600/10">
                <h2 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Women's Division Standings
                </h2>
              </div>
              <CardContent className="p-0">
                {womensEvents.map((event) => (
                  <div key={event.id} className="border-b border-gray-800 last:border-b-0">
                    {/* Event Info Section */}
                    <div className="px-6 py-3 bg-gray-900/50 border-b border-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          {event.event && (
                            <h3 className="text-sm font-semibold text-pink-400 mb-1">{event.event}</h3>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Scheduled: {event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>Main Grounds</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Updated: </span>
                          <span className="text-green-400 font-semibold">{event.date} {event.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {/* Leaderboard Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-800 mb-2">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-7">Team</div>
                        <div className="col-span-4 text-right">Status</div>
                      </div>
                      
                      {/* Leaderboard Rows */}
                      {event.positions.map((position) => (
                        <div
                          key={position.place}
                          className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg mb-2 transition-all hover:scale-[1.01] ${
                            position.place === 1
                              ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500'
                              : position.place === 2
                              ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-l-4 border-gray-400'
                              : position.place === 3
                              ? 'bg-gradient-to-r from-amber-600/20 to-transparent border-l-4 border-amber-600'
                              : 'bg-gray-800/30 border-l-4 border-gray-700'
                          }`}
                        >
                          {/* Rank */}
                          <div className="col-span-1">
                            <div
                              className={`text-2xl font-black ${
                                position.place === 1
                                  ? 'text-yellow-400'
                                  : position.place === 2
                                  ? 'text-gray-300'
                                  : position.place === 3
                                  ? 'text-amber-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {position.place}
                            </div>
                          </div>

                          {/* Team Name */}
                          <div className="col-span-7">
                            <div 
                              className="text-white font-bold text-lg hover:text-red-400 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs hover:text-gray-300 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-4 text-right">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && '🥇 Champion'}
                              {position.place === 2 && '🥈 Runner-up'}
                              {position.place === 3 && '🥉 Third'}
                              {position.place > 3 && `#${position.place}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Mixed Division */}
          {showMixed && mixedEvents.length > 0 && (
            <Card className="border-2 border-purple-800/50 bg-gradient-to-br from-gray-900 to-black shadow-xl">
              <div className="px-6 py-4 border-b border-gray-800 bg-purple-600/10">
                <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Mixed Division Standings
                </h2>
              </div>
              <CardContent className="p-0">
                {mixedEvents.map((event) => (
                  <div key={event.id} className="border-b border-gray-800 last:border-b-0">
                    {/* Event Info Section */}
                    <div className="px-6 py-3 bg-gray-900/50 border-b border-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          {event.event && (
                            <h3 className="text-sm font-semibold text-purple-400 mb-1">{event.event}</h3>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Scheduled: {event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>Main Grounds</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Updated: </span>
                          <span className="text-green-400 font-semibold">{event.date} {event.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {/* Leaderboard Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-800 mb-2">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-7">Team</div>
                        <div className="col-span-4 text-right">Status</div>
                      </div>
                      
                      {/* Leaderboard Rows */}
                      {event.positions.map((position) => (
                        <div
                          key={position.place}
                          className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg mb-2 transition-all hover:scale-[1.01] ${
                            position.place === 1
                              ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500'
                              : position.place === 2
                              ? 'bg-gradient-to-r from-gray-400/20 to-transparent border-l-4 border-gray-400'
                              : position.place === 3
                              ? 'bg-gradient-to-r from-amber-600/20 to-transparent border-l-4 border-amber-600'
                              : 'bg-gray-800/30 border-l-4 border-gray-700'
                          }`}
                        >
                          {/* Rank */}
                          <div className="col-span-1">
                            <div
                              className={`text-2xl font-black ${
                                position.place === 1
                                  ? 'text-yellow-400'
                                  : position.place === 2
                                  ? 'text-gray-300'
                                  : position.place === 3
                                  ? 'text-amber-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {position.place}
                            </div>
                          </div>

                          {/* Team Name */}
                          <div className="col-span-7">
                            <div 
                              className="text-white font-bold text-lg hover:text-red-400 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs hover:text-gray-300 cursor-pointer transition-colors"
                              onClick={(e) => handleFacultyClick(e, position.faculty)}
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-4 text-right">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && '🥇 Champion'}
                              {position.place === 2 && '🥈 Runner-up'}
                              {position.place === 3 && '🥉 Third'}
                              {position.place > 3 && `#${position.place}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
