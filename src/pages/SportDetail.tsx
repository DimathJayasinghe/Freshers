import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { fetchResults, fetchFacultiesList, fetchSports, fetchFacultySportsBySportId } from "@/lib/api";
import { getShortFacultyName } from "@/data/tournamentData";

export function SportDetail() {
  const { sportName } = useParams<{ sportName: string }>();
  const navigate = useNavigate();
  const [divisionTab, setDivisionTab] = useState<'men' | 'women' | 'both'>('both');
  const [allResults, setAllResults] = useState([] as Awaited<ReturnType<typeof fetchResults>>);
  const [facNameToId, setFacNameToId] = useState<Map<string, string>>(new Map());
  const [facNameToShort, setFacNameToShort] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchResults(), fetchFacultiesList(), fetchSports()])
      .then(async ([rows, facs, sports]) => {
        if (!mounted) return;
        setAllResults(rows || []);
        const idMap = new Map<string, string>();
        const shortMap = new Map<string, string>();
        (facs || []).forEach(f => {
          if (f?.name) {
            if (f.id) idMap.set(f.name, f.id);
            if ((f as any).short_name) shortMap.set(f.name, (f as any).short_name);
          }
        });
        setFacNameToId(idMap);
        setFacNameToShort(shortMap);

        // Determine sportId from slug param using sports list (no longer stored in state)
        const slug = (sportName || '').toLowerCase();
        const found = (sports || []).find(s => s.name && s.name.toLowerCase().replace(/\s+/g,'-') === slug);
        if (found?.id) {
          try {
            await fetchFacultySportsBySportId(found.id);
          } catch (e) {
            console.warn('[SportDetail] faculty_sports fetch failed', e);
          }
        }
      })
      .catch((e) => { console.error('[SportDetail] initial load error', e); if (mounted) setError('Failed to load results'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Faculty detail navigation removed; names now static text

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
  // Note: We intentionally do NOT override with faculty_sports totals because that table
  // lacks gender granularity and was causing identical counts for Men/Women.
  // If gender-specific participation data becomes available, integrate it here.
  const latestEvent = sportResults[0];
  const latestDate = latestEvent?.date ?? '';
  const latestVenue = 'Main Grounds'; // No venue in results_view; keep consistent with event cards

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Location */}
          <Card className="border-2 border-yellow-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <MapPin className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white truncate">{latestVenue}</div>
                <div className="text-xs text-gray-400">Location</div>
              </div>
            </CardContent>
          </Card>

          {/* Date */}
          <Card className="border-2 border-purple-800/50 bg-gradient-to-br from-gray-900 to-black">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{latestDate}</div>
                <div className="text-xs text-gray-400">Date</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Division Slider */}
        <div className="mb-6 flex justify-center sm:justify-start">
          <Tabs value={divisionTab} onValueChange={(v) => setDivisionTab(v as any)}>
            <TabsList className="bg-black/40 border border-white/10 text-gray-400 mx-auto sm:mx-0">
              <TabsTrigger value="men" className="text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-500/10 min-w-[96px]">Men's ({mensEvents.length})</TabsTrigger>
              <TabsTrigger value="women" className="text-gray-400 data-[state=active]:text-pink-400 data-[state=active]:bg-pink-500/10 min-w-[96px]">Women's ({womensEvents.length})</TabsTrigger>
              <TabsTrigger value="both" className="text-gray-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-500/10 min-w-[80px]">Both</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Standings View - Leaderboard Style */}
        <div className="space-y-6">
          {/* Men's Division */}
          {(divisionTab === 'men' || divisionTab === 'both') && mensEvents.length > 0 && (
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
                      {event.event && (
                        <h3 className="text-sm font-semibold text-blue-400">{event.event}</h3>
                      )}
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
                              className="text-white font-bold text-lg"
                            >
                              {facNameToShort.get(position.faculty) ?? getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs"
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-12 sm:col-span-4 text-right">
                            <div
                              className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap leading-none w-fit ml-auto sm:ml-0 ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && (<><Trophy className="w-3.5 h-3.5" /><span>Champion</span></>)}
                              {position.place === 2 && (<><Medal className="w-3.5 h-3.5" /><span>Runner-up</span></>)}
                              {position.place === 3 && (<><Medal className="w-3.5 h-3.5" /><span>2nd Runner-up</span></>)}
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
          {(divisionTab === 'women' || divisionTab === 'both') && womensEvents.length > 0 && (
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
                      {event.event && (
                        <h3 className="text-sm font-semibold text-pink-400">{event.event}</h3>
                      )}
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
                              className="text-white font-bold text-lg"
                            >
                              {facNameToShort.get(position.faculty) ?? getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs"
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-12 sm:col-span-4 text-right">
                            <div
                              className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap leading-none w-fit ml-auto sm:ml-0 ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && (<><Trophy className="w-3.5 h-3.5" /><span>Champion</span></>)}
                              {position.place === 2 && (<><Medal className="w-3.5 h-3.5" /><span>Runner-up</span></>)}
                              {position.place === 3 && (<><Medal className="w-3.5 h-3.5" /><span>2nd Runner-up</span></>)}
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
          {mixedEvents.length > 0 && (
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
                      {event.event && (
                        <h3 className="text-sm font-semibold text-purple-400">{event.event}</h3>
                      )}
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
                              className="text-white font-bold text-lg"
                            >
                              {facNameToShort.get(position.faculty) ?? getShortFacultyName(position.faculty)}
                            </div>
                            <div 
                              className="text-gray-400 text-xs"
                            >
                              {position.faculty}
                            </div>
                          </div>

                          {/* Status/Medal */}
                          <div className="col-span-12 sm:col-span-4 text-right">
                            <div
                              className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap leading-none w-fit ml-auto sm:ml-0 ${
                                position.place === 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : position.place === 2
                                  ? 'bg-gray-400/20 text-gray-300'
                                  : position.place === 3
                                  ? 'bg-amber-600/20 text-amber-500'
                                  : 'bg-gray-700/20 text-gray-400'
                              }`}
                            >
                              {position.place === 1 && (<><Trophy className="w-3.5 h-3.5" /><span>Champion</span></>)}
                              {position.place === 2 && (<><Medal className="w-3.5 h-3.5" /><span>Runner-up</span></>)}
                              {position.place === 3 && (<><Medal className="w-3.5 h-3.5" /><span>2nd Runner-up</span></>)}
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
