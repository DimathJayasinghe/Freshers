import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ChevronRight, MapPin, ListOrdered, RefreshCw } from 'lucide-react';
import { supabase, hasSupabaseEnv } from '@/lib/supabaseClient';
import { fetchLiveSportsNow, fetchLiveSeriesMatchesBySport, fetchActiveSeriesBySport, type LiveSeriesMatchView } from '@/lib/api';

export function LiveResults() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedSportName, setSelectedSportName] = useState<string>('');
  const [fixtures, setFixtures] = useState<LiveSeriesMatchView[]>([]);
  const [loadingSports, setLoadingSports] = useState<boolean>(true);
  const [loadingFixtures, setLoadingFixtures] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'mixed' | null>(null);
  // Track last scores/winner to animate when numbers or winner change
  const lastScoresRef = useRef<Record<string, { s1: string | null; s2: string | null }>>({});
  const lastWinnerRef = useRef<Record<string, string | null>>({});
  const [flashKeys, setFlashKeys] = useState<Record<string, number>>({});

  // Load ongoing sports on mount
  useEffect(() => {
    let alive = true;
    setLoadingSports(true);
    setError(null);
    // Read preselected sport from query param if available
    const params = new URLSearchParams(window.location.search);
    const preselectSport = params.get('sport');
    fetchLiveSportsNow()
      .then((rows) => {
        if (!alive) return;
        setSports(rows);
        // Select by URL param if provided and exists; otherwise auto-select first
        if (preselectSport) {
          const found = rows.find(r => r.id === preselectSport);
          if (found) {
            setSelectedSport(found.id);
            setSelectedSportName(found.name);
          } else if (rows.length > 0) {
            setSelectedSport((prev) => prev ?? rows[0].id);
            setSelectedSportName((prev) => prev || rows[0].name);
          }
        } else {
          if (rows.length > 0) {
            setSelectedSport((prev) => prev ?? rows[0].id);
            setSelectedSportName((prev) => prev || rows[0].name);
          }
        }
      })
      .catch((e) => {
        console.error('[LiveResults] fetchOngoingSports error', e);
        if (alive) setError('Failed to load live sports');
      })
      .finally(() => alive && setLoadingSports(false));
    return () => {
      alive = false;
    };
  }, []);

  // Load live matches for selected sport (from live schema) and attach realtime on live tables
  useEffect(() => {
    if (!selectedSport) {
      setFixtures([]);
      setSelectedGender(null);
      return;
    }
    let alive = true;
    let matchesChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    let seriesChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    setLoadingFixtures(true);
    setError(null);

    const load = async () => {
      try {
        const rows = await fetchLiveSeriesMatchesBySport(selectedSport);
        if (!alive) return;
        // Detect score changes and trigger flash animation
        const newLast: Record<string, { s1: string | null; s2: string | null }> = {};
        rows.forEach((r) => {
          const prev = lastScoresRef.current[String(r.id)];
          const cur1 = (r as any).team1_score ?? null;
          const cur2 = (r as any).team2_score ?? null;
          const prevWinner = lastWinnerRef.current[String(r.id)];
          const curWinner = (r as any).winner_name ?? null;
          if (prev) {
            if (prev.s1 !== cur1) {
              const key = `${r.id}-1`;
              setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
              setTimeout(() => {
                setFlashKeys((fk) => {
                  const { [key]: _omit, ...rest } = fk;
                  return rest;
                });
              }, 700);
            }
            if (prev.s2 !== cur2) {
              const key = `${r.id}-2`;
              setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
              setTimeout(() => {
                setFlashKeys((fk) => {
                  const { [key]: _omit, ...rest } = fk;
                  return rest;
                });
              }, 700);
            }
          }
          if (prevWinner !== curWinner) {
            const key = `${r.id}-w`;
            setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
            setTimeout(() => {
              setFlashKeys((fk) => {
                const { [key]: _omit, ...rest } = fk;
                return rest;
              });
            }, 900);
          }
          newLast[String(r.id)] = { s1: cur1, s2: cur2 };
          lastWinnerRef.current[String(r.id)] = curWinner;
        });
        lastScoresRef.current = newLast;
        setFixtures(rows);
        // Also fetch active series meta to get gender for header chip
        try {
          const series = await fetchActiveSeriesBySport(selectedSport);
          if (alive) setSelectedGender(series?.gender ?? null);
        } catch {
          if (alive) setSelectedGender(null);
        }
      } catch (e) {
        console.error('[LiveResults] fetchLiveSeriesMatchesBySport error', e);
        if (alive) setError('Failed to load live matches');
      } finally {
        if (alive) setLoadingFixtures(false);
      }
    };

    load();

    // Realtime subscription for score/status changes (matches) and series creation/finish
    if (hasSupabaseEnv && supabase) {
      // Matches channel
      console.info('[LiveResults] Subscribing to Realtime: live_series_matches for sport', selectedSport);
      matchesChannel = supabase
        .channel(`rt-live-series-matches-${selectedSport}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_series_matches' }, async () => {
          try {
            const rows = await fetchLiveSeriesMatchesBySport(selectedSport);
            if (!alive) return;
            const newLast: Record<string, { s1: string | null; s2: string | null }> = {};
            rows.forEach((r) => {
              const prev = lastScoresRef.current[String(r.id)];
              const cur1 = (r as any).team1_score ?? null;
              const cur2 = (r as any).team2_score ?? null;
              const prevWinner = lastWinnerRef.current[String(r.id)];
              const curWinner = (r as any).winner_name ?? null;
              if (prev) {
                if (prev.s1 !== cur1) {
                  const key = `${r.id}-1`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
                if (prev.s2 !== cur2) {
                  const key = `${r.id}-2`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
              }
              if (prevWinner !== curWinner) {
                const key = `${r.id}-w`;
                setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                setTimeout(() => {
                  setFlashKeys((fk) => {
                    const { [key]: _omit, ...rest } = fk;
                    return rest;
                  });
                }, 900);
              }
              newLast[String(r.id)] = { s1: cur1, s2: cur2 };
              lastWinnerRef.current[String(r.id)] = curWinner;
            });
            lastScoresRef.current = newLast;
            setFixtures(rows);
          } catch (e) {
            console.error('[LiveResults] realtime matches INSERT refetch error', e);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_series_matches' }, async () => {
          try {
            const rows = await fetchLiveSeriesMatchesBySport(selectedSport);
            if (!alive) return;
            const newLast: Record<string, { s1: string | null; s2: string | null }> = {};
            rows.forEach((r) => {
              const prev = lastScoresRef.current[String(r.id)];
              const cur1 = (r as any).team1_score ?? null;
              const cur2 = (r as any).team2_score ?? null;
              const prevWinner = lastWinnerRef.current[String(r.id)];
              const curWinner = (r as any).winner_name ?? null;
              if (prev) {
                if (prev.s1 !== cur1) {
                  const key = `${r.id}-1`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
                if (prev.s2 !== cur2) {
                  const key = `${r.id}-2`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
              }
              if (prevWinner !== curWinner) {
                const key = `${r.id}-w`;
                setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                setTimeout(() => {
                  setFlashKeys((fk) => {
                    const { [key]: _omit, ...rest } = fk;
                    return rest;
                  });
                }, 900);
              }
              newLast[String(r.id)] = { s1: cur1, s2: cur2 };
              lastWinnerRef.current[String(r.id)] = curWinner;
            });
            lastScoresRef.current = newLast;
            setFixtures(rows);
          } catch (e) {
            console.error('[LiveResults] realtime matches UPDATE refetch error', e);
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'live_series_matches' }, async () => {
          try {
            const rows = await fetchLiveSeriesMatchesBySport(selectedSport);
            if (!alive) return;
            const newLast: Record<string, { s1: string | null; s2: string | null }> = {};
            rows.forEach((r) => {
              const prev = lastScoresRef.current[String(r.id)];
              const cur1 = (r as any).team1_score ?? null;
              const cur2 = (r as any).team2_score ?? null;
              if (prev) {
                if (prev.s1 !== cur1) {
                  const key = `${r.id}-1`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
                if (prev.s2 !== cur2) {
                  const key = `${r.id}-2`;
                  setFlashKeys((fk) => ({ ...fk, [key]: Date.now() }));
                  setTimeout(() => {
                    setFlashKeys((fk) => {
                      const { [key]: _omit, ...rest } = fk;
                      return rest;
                    });
                  }, 700);
                }
              }
              newLast[String(r.id)] = { s1: cur1, s2: cur2 };
            });
            lastScoresRef.current = newLast;
            setFixtures(rows);
          } catch (e) {
            console.error('[LiveResults] realtime matches DELETE refetch error', e);
          }
        })
        .subscribe((status) => {
          console.info('[LiveResults] Matches channel status:', status);
        });

      // Series channel
      console.info('[LiveResults] Subscribing to Realtime: live_sport_series');
      seriesChannel = supabase
        .channel(`rt-live-series-${selectedSport}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sport_series' }, async () => {
          try {
            const list = await fetchLiveSportsNow();
            if (!alive) return;
            setSports(list);
            const exists = list.some(s => s.id === selectedSport);
            if (!exists) {
              if (list.length > 0) {
                setSelectedSport(list[0].id);
                setSelectedSportName(list[0].name);
              } else {
                setSelectedSport(null);
                setFixtures([]);
              }
            }
          } catch (e) {
            console.error('[LiveResults] realtime sports refetch error', e);
          }
        })
        .subscribe((status) => {
          console.info('[LiveResults] Series channel status:', status);
        });
    } else {
      console.warn('[LiveResults] Realtime disabled: Supabase env not configured');
    }

    return () => {
      alive = false;
      if (matchesChannel) supabase?.removeChannel(matchesChannel);
      if (seriesChannel) supabase?.removeChannel(seriesChannel);
    };
  }, [selectedSport, selectedSportName]);

  const sportButtons = useMemo(() => {
    if (loadingSports) {
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`sport-skel-${i}`} className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
      );
    }
    if (sports.length === 0)
      return <div className="text-gray-400">No sports are currently live.</div>;
    return (
      <div className="flex flex-wrap gap-2">
        {sports.map((s) => {
          const active = s.id === selectedSport;
          return (
            <button
              key={s.id}
              onClick={() => { setSelectedSport(s.id); setSelectedSportName(s.name); }}
              className={`px-4 h-9 rounded-full text-sm font-semibold border transition-colors ${
                active
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-black/40 text-gray-300 border-white/10 hover:border-red-600 hover:text-red-400'
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    );
  }, [loadingSports, sports, selectedSport]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-950 via-black to-red-950 py-12 md:py-16 border-b border-red-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 rounded-full px-4 py-2">
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-red-400 text-sm font-semibold">Live Results</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Currently Ongoing Sports</h1>
              <p className="text-gray-300">Tap a sport to view all ongoing matches and live scores.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/')}>Home</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/lineup')}>
                Check Schedule <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        {/* Sport filter pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {sportButtons}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => {
              // manual refresh
              if (!selectedSport) return;
              setLoadingFixtures(true);
              fetchLiveSeriesMatchesBySport(selectedSport)
                .then((rows) => setFixtures(rows))
                .catch((e) => { console.error(e); setError('Failed to refresh'); })
                .finally(() => setLoadingFixtures(false));
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Fixtures list */}
        {!selectedSport && (
          <div className="text-gray-400">Select a sport to view live matches.</div>
        )}

        {selectedSport && (
          <Card className="border-red-800/40 bg-gradient-to-b from-black/60 to-black/20">
            <CardHeader className="pb-2 border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-red-500" />
                <span className="truncate">{selectedSportName || 'Live Matches'}</span>
                {selectedGender && (
                  <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    selectedGender === 'male'
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : selectedGender === 'female'
                      ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                      : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                  }`}>
                    {selectedGender === 'male' ? 'Men' : selectedGender === 'female' ? 'Women' : 'Mixed'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingFixtures && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`fix-skel-${i}`} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse h-20" />
                  ))}
                </div>
              )}

              {!loadingFixtures && fixtures.length === 0 && (
                <div className="text-gray-400">No matches are live right now for this sport.</div>
              )}

              {!loadingFixtures && fixtures.length > 0 && (
                <div className="space-y-3">
                  {fixtures.map((m, idx) => (
                    <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-600/40 transition-colors">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-400 font-semibold">Match {idx + 1}</div>
                          {m.gender && (
                            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                              {m.gender === 'male' ? 'Men' : m.gender === 'female' ? 'Women' : 'Mixed'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                          <MapPin className="w-4 h-4 text-red-400" />
                          <span>{m.venue}</span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-8 bg-red-600 rounded" />
                          <div className="text-white font-semibold truncate">{m.team1 || 'Team A'}</div>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center gap-2 text-gray-400 text-xs bg-black/30 px-3 py-1 rounded-full border border-white/10">VS</div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="text-white font-semibold truncate text-right">{m.team2 || 'Team B'}</div>
                          <div className="w-2 h-8 bg-red-600 rounded" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-4">
                        {(() => {
                          const key1 = `${m.id}-1`;
                          const key2 = `${m.id}-2`;
                          const flash1 = Boolean((flashKeys as any)?.[key1]);
                          const flash2 = Boolean((flashKeys as any)?.[key2]);
                          return (
                            <>
                              <div className={`text-lg font-bold min-w-16 text-center transform-gpu transition-all duration-300 ${flash1 ? 'scale-125 text-yellow-200 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-yellow-400'}`}>{m.team1_score ?? '-'}</div>
                              <div className="text-gray-500">-</div>
                              <div className={`text-lg font-bold min-w-16 text-center transform-gpu transition-all duration-300 ${flash2 ? 'scale-125 text-yellow-200 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-yellow-400'}`}>{m.team2_score ?? '-'}</div>
                            </>
                          );
                        })()}
                      </div>
                      {Boolean((m as any).commentary) && (
                        <div className="mt-3 flex justify-center">
                          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs">
                            <svg aria-hidden className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
                            <span>{(m as any).commentary}</span>
                          </div>
                        </div>
                      )}
                      {m.winner_name && (
                        <div className="mt-3 flex justify-center">
                          {(() => {
                            const keyW = `${m.id}-w`;
                            const winnerFlash = Boolean((flashKeys as any)?.[keyW]);
                            return (
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold transition-all duration-500 ${winnerFlash ? 'bg-green-400/20 border-green-400/60 text-green-200 shadow-[0_0_18px_rgba(34,197,94,0.45)] scale-[1.03]' : 'bg-green-500/10 border-green-400/30 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.25)]'}`}>
                            <svg aria-hidden className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h10l1 4a4 4 0 1 1-7.9 1h0A4 4 0 1 1 6 12l1-4Z"/></svg>
                            <span>Winner: {m.winner_name}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      {m.status_text && (
                        <div className="mt-2 text-center text-xs text-green-400">{m.status_text}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}

export default LiveResults;
