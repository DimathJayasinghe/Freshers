import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { AdminHeader } from '@/components/AdminHeader';
import { fetchSports, fetchFacultiesList, fetchActiveSeriesBySport, createLiveSeries, addLiveMatch, fetchMatchesBySeries, updateLiveMatch, finishSeries, completeAllMatchesInSeries, fetchLiveSportsNow, deleteLiveSeries, applyCustomSeriesResultsAndPoints, deleteLiveMatch, fetchResultsBySport, fetchResultPositions, updateResultRow, replaceResultPositionsAndReapply, fetchScheduledEvents, createScheduledEvent, updateScheduledEvent, deleteScheduledEvent } from '@/lib/api';
import { Check, Loader2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/confirm-dialog';

type SportOption = { id: string; name: string; category: string; gender?: string };

const AdminDashboardPage: React.FC = () => {
  const [sports, setSports] = useState<SportOption[]>([]);
  const [faculties, setFaculties] = useState<{ id: string; name: string; short_name: string }[]>([]);
  const facultyNameById = useMemo(() => Object.fromEntries(faculties.map(f => [f.id, f.name])), [faculties]);

  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [seriesTitle, setSeriesTitle] = useState<string>('');
  const [seriesGender, setSeriesGender] = useState<'male'|'female'|'mixed'>('male');
  const [activeSeries, setActiveSeries] = useState<{ id: number; sport_id: string; title: string | null; is_finished?: boolean; gender?: 'male'|'female'|'mixed' } | null>(null);

  const [matches, setMatches] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingMatchIds, setSavingMatchIds] = useState<number[]>([]);
  const [savedMatchIds, setSavedMatchIds] = useState<number[]>([]);
  const [pushingCommentIds, setPushingCommentIds] = useState<number[]>([]);
  const [pushedCommentIds, setPushedCommentIds] = useState<number[]>([]);
  const enterCountsRef = useRef<Record<number, { count: number; timer: any }>>({});
  const [liveSports, setLiveSports] = useState<{ id: string; name: string }[]>([]);
  // Results manager state
  const [results, setResults] = useState<Array<{ id: number; event: string | null; category: string; gender: string; event_date: string; event_time: string }>>([]);
  const [resultsRefreshKey, setResultsRefreshKey] = useState(0);
  const [editingResultId, setEditingResultId] = useState<number | null>(null);
  const [editingResultMeta, setEditingResultMeta] = useState<Partial<{ event: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string }>>({});
  const [editingPositions, setEditingPositions] = useState<Array<{ place: number; faculty_id: string }>>([]);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsSaving, setResultsSaving] = useState(false);
  // Schedule manager state
  const [schedule, setSchedule] = useState<Array<{ id: number; event_date: string; sport_id: string | null; sport_label: string | null; time_range: string | null; start_time: string | null; end_time: string | null; venue: string }>>([]);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [newSched, setNewSched] = useState<{ event_date: string; sport_id: string | null; sport_label: string | null; start_time: string | null; end_time: string | null; venue: string }>({ event_date: '', sport_id: null, sport_label: null, start_time: null, end_time: null, venue: '' });
  const [editingSchedId, setEditingSchedId] = useState<number | null>(null);
  const [editingSched, setEditingSched] = useState<{ event_date?: string; sport_label?: string | null; start_time?: string | null; end_time?: string | null; venue?: string }>({});
  useEffect(() => {
    (async () => {
      try {
        const ls = await fetchLiveSportsNow();
        setLiveSports(ls);
      } catch (err) {
        // non-blocking
        console.warn('live sports now fetch failed', err);
      }
    })();
  }, [refreshKey]);

  // Load results for selected sport
  useEffect(() => {
    (async () => {
      setResultsError(null);
      if (!selectedSportId) { setResults([]); return; }
      try {
        const rs = await fetchResultsBySport(selectedSportId);
        setResults(rs as any);
      } catch (e: any) {
        setResultsError(e?.message || 'Failed to load results');
      }
    })();
  }, [selectedSportId, resultsRefreshKey]);

  // Load schedule
  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchScheduledEvents();
        setSchedule(rows as any);
      } catch (e) {
        console.warn('schedule fetch failed', e);
      }
    })();
  }, [scheduleRefreshKey]);

  // Controlled match order to avoid unique constraint collisions
  const suggestedOrder = useMemo(() => (matches.length ? Math.max(...matches.map(m => Number(m.match_order) || 0)) + 1 : 1), [matches]);
  const [matchOrder, setMatchOrder] = useState<number>(1);
  useEffect(() => { setMatchOrder(suggestedOrder); }, [suggestedOrder]);

  useEffect(() => {
    (async () => {
      try {
        const [sp, fc] = await Promise.all([fetchSports(), fetchFacultiesList()]);
        setSports(sp as any);
        setFaculties(fc);
      } catch (err) {
        console.error('Failed to load sports/faculties', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedSportId) { setActiveSeries(null); setMatches([]); return; }
    (async () => {
      try {
        const series = await fetchActiveSeriesBySport(selectedSportId);
        setActiveSeries(series);
        if (series?.id) {
          const m = await fetchMatchesBySeries(series.id);
          setMatches(m);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Failed to load active series/matches', err);
      }
    })();
  }, [selectedSportId, refreshKey]);

  // const selectedSport = useMemo(() => sports.find(s => s.id === selectedSportId), [sports, selectedSportId]);

  async function handleCreateSeries(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSportId) return;
    const s = await createLiveSeries(selectedSportId, seriesTitle || null, seriesGender);
    setActiveSeries(s);
  }

  async function handleAddMatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeSeries?.id) return;
    setFormError(null);
    // Capture form element before any await to avoid React SyntheticEvent pooling
    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    const match_order = Number(form.get('match_order') || matchOrder || 1);
    const venue = String(form.get('venue') || '');
    const stageVal = String(form.get('stage') || '');
    const stage = (stageVal ? stageVal : null) as any;
    const f1 = form.get('faculty1_id');
    const f2 = form.get('faculty2_id');
    const faculty1_id = f1 ? String(f1) : '';
    const faculty2_id = f2 ? String(f2) : '';
    const st = form.get('status_text');
    const status_text = st ? String(st) : null;

    if (!faculty1_id || !faculty2_id) { setFormError('Please select both teams'); return; }
    if (faculty1_id === faculty2_id) { setFormError('Teams must be different'); return; }
    if (!match_order || match_order < 1) { setFormError('Order must be 1 or higher'); return; }
    try {
      await addLiveMatch({
        series_id: activeSeries.id,
        match_order,
        venue,
        stage,
        faculty1_id,
        faculty2_id,
        faculty1_score: null,
        faculty2_score: null,
        status: 'live',
        status_text,
        is_finished: false,
        winner_faculty_id: null,
      } as any);
      setRefreshKey((k) => k + 1);
      setMatchOrder((o) => o + 1);
      formEl.reset();
    } catch (err: any) {
      console.error('add match failed', err);
      // Friendly message for common DB check constraint
      const msg: string = err?.message || 'Failed to add match';
      if (/check constraint/i.test(msg) || /live_series_matches_check/i.test(msg)) {
        setFormError('Invalid match setup. Ensure different teams and valid stage.');
      } else {
        setFormError(msg);
      }
    }
  }

  async function performSave(idx: number) {
    const m = matches[idx];
    const id = m.id as number;
    setSavingMatchIds((arr) => (arr.includes(id) ? arr : [...arr, id]));
    setConfirmSaveLoading(true);
    try {
      // Persist scores and winner selection together on Save
      await updateLiveMatch(id, {
        faculty1_score: m.faculty1_score ?? '',
        faculty2_score: m.faculty2_score ?? '',
        winner_faculty_id: m.winner_faculty_id ?? null,
        status_text: m.status_text ?? null,
        // Save commentary if present (new feature)
        commentary: (m as any).commentary ?? null,
      });
      setSavedMatchIds((arr) => (arr.includes(id) ? arr : [...arr, id]));
      setTimeout(() => {
        setSavedMatchIds((arr) => arr.filter((x) => x !== id));
      }, 1200);
      setRefreshKey((k) => k + 1);
      setConfirmSaveIdx(null);
    } finally {
      setSavingMatchIds((arr) => arr.filter((x) => x !== id));
      setConfirmSaveLoading(false);
    }
  }

  function saveScores(idx: number) {
    setConfirmSaveIdx(idx);
  }

  function markWinner(idx: number, winnerId: string) {
    // Only update local state; actual persistence happens when clicking Save
    setMatches((arr) => arr.map((x, i) => (i === idx ? { ...x, winner_faculty_id: winnerId || null } : x)));
  }

  async function pushCommentary(idx: number) {
    const m = matches[idx];
    const id = m.id as number;
    const commentary = (m as any).commentary ?? '';
    setPushingCommentIds((arr) => (arr.includes(id) ? arr : [...arr, id]));
    try {
      await updateLiveMatch(id, { commentary });
      setPushedCommentIds((arr) => (arr.includes(id) ? arr : [...arr, id]));
      setTimeout(() => setPushedCommentIds((arr) => arr.filter((x) => x !== id)), 1200);
      setRefreshKey((k) => k + 1);
    } finally {
      setPushingCommentIds((arr) => arr.filter((x) => x !== id));
    }
  }

  // Finalization UI state
  // Custom placements and participants
  type Placement = { faculty_id: string; label: 'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up'; points: number };
  type Participant = { faculty_id: string; points: number };
  const [placements, setPlacements] = useState<Placement[]>([
    { faculty_id: '', label: 'champion', points: 7 },
    { faculty_id: '', label: 'runner_up', points: 5 },
    { faculty_id: '', label: 'second_runner_up', points: 3 },
    { faculty_id: '', label: 'third_runner_up', points: 2 },
  ]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeOk, setFinalizeOk] = useState<string | null>(null);
  const [confirmSaveIdx, setConfirmSaveIdx] = useState<number | null>(null);
  const [confirmSaveLoading, setConfirmSaveLoading] = useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [confirmFinalizeLoading, setConfirmFinalizeLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [confirmDeleteSeriesOpen, setConfirmDeleteSeriesOpen] = useState(false);
  const [confirmDeleteSeriesLoading, setConfirmDeleteSeriesLoading] = useState(false);

  async function onFinalizeSeries() {
    if (!activeSeries?.id || !selectedSportId) return;
    setFinalizeError(null);
    setFinalizeOk(null);
    const validPlacements = placements.filter(p => p.faculty_id && p.points >= 0);
    if (validPlacements.length === 0) { setFinalizeError('Add at least one placement with a faculty and points'); return; }
    try {
  // Mark series finished (store winners if available from the placements)
  const champId = validPlacements.find(p => p.label === 'champion')?.faculty_id || '';
  const runId = validPlacements.find(p => p.label === 'runner_up')?.faculty_id || '';
  const thirdId = validPlacements.find(p => p.label === 'second_runner_up')?.faculty_id || '';
  await finishSeries(activeSeries.id, { champion: champId, runner_up: runId, third: thirdId });
  const gLabel: "Men's" | "Women's" | 'Mixed' = activeSeries?.gender === 'female' ? "Women's" : activeSeries?.gender === 'mixed' ? 'Mixed' : "Men's";
  await applyCustomSeriesResultsAndPoints({
    sport_id: selectedSportId,
    gender: gLabel,
    placements: validPlacements,
    participants: participants.filter(p => p.faculty_id).map(p => ({ faculty_id: p.faculty_id, points: Number(p.points || 1) })),
    series_id: activeSeries.id,
  });
      setFinalizeOk('Series finalized and points applied');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      console.error('finalize failed', err);
      setFinalizeError(err?.message || 'Failed to finalize');
    }
  }

  // finalizeSeries removed from UI for now per request

  // Results editor helpers
  async function openEditResult(rid: number) {
    setResultsError(null);
    setEditingResultId(rid);
    try {
      const meta = results.find(r => r.id === rid);
      if (meta) setEditingResultMeta({ event: meta.event ?? '', category: meta.category as any, gender: meta.gender as any, event_date: meta.event_date, event_time: meta.event_time });
      const pos = await fetchResultPositions(rid);
      const rows = (pos as any[]).map(p => ({ place: Number(p.place), faculty_id: String(p.faculty_id) })).sort((a,b)=>a.place-b.place);
      setEditingPositions(rows.length ? rows : [{ place: 1, faculty_id: '' }]);
    } catch (e: any) {
      setResultsError(e?.message || 'Failed to open result for editing');
    }
  }

  function addPositionRow() { setEditingPositions(arr => [...arr, { place: Math.max(1, (arr[arr.length-1]?.place||0)+1), faculty_id: '' }]); }
  function removePositionRow(i: number) { setEditingPositions(arr => arr.filter((_,idx)=>idx!==i)); }

  async function saveEditedResult() {
    if (!editingResultId) return;
    setResultsSaving(true);
    setResultsError(null);
    try {
      if (Object.keys(editingResultMeta).length) {
        await updateResultRow(editingResultId, editingResultMeta as any);
      }
      await replaceResultPositionsAndReapply(editingResultId, editingPositions.filter(p=>p.faculty_id));
      setEditingResultId(null);
      setResultsRefreshKey(k=>k+1);
    } catch (e: any) {
      setResultsError(e?.message || 'Failed to save result');
    } finally {
      setResultsSaving(false);
    }
  }

  // Schedule CRUD helpers
  async function addScheduleItem(e: React.FormEvent) {
    e.preventDefault();
    setScheduleError(null);
    try {
      if (!newSched.event_date || !newSched.venue) { setScheduleError('Date and venue are required'); return; }
      if (!newSched.sport_id && !(newSched.sport_label && newSched.sport_label.trim())) { setScheduleError('Provide a sport selection or a label'); return; }
      if (!(newSched.start_time && newSched.start_time.trim())) { setScheduleError('Start time is required'); return; }
      await createScheduledEvent({
        event_date: newSched.event_date,
        sport_id: newSched.sport_id || null,
        sport_label: newSched.sport_label || null,
        time_range: null,
        start_time: newSched.start_time || null,
        end_time: newSched.end_time || null,
        venue: newSched.venue,
      });
      setNewSched({ event_date: '', sport_id: null, sport_label: null, start_time: null, end_time: null, venue: '' });
      setScheduleRefreshKey(k=>k+1);
    } catch (e: any) {
      setScheduleError(e?.message || 'Failed to add schedule');
    }
  }

  async function saveScheduleItem(id: number) {
    try {
      await updateScheduledEvent(id, editingSched);
      setEditingSchedId(null);
      setEditingSched({});
      setScheduleRefreshKey(k=>k+1);
    } catch (e) {
      console.error('schedule update failed', e);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <AdminLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2">1) Select sport & series</h3>
              <label className="block text-sm mb-1">Sport</label>
              <select className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2 mb-3" value={selectedSportId} onChange={(e) => setSelectedSportId(e.target.value)}>
                <option value="">-- choose --</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {liveSports.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Currently Live:</div>
                  <div className="flex flex-wrap gap-2">
                    {liveSports.map(s => (
                      <button key={s.id} className={`px-3 py-1 rounded-full text-xs border ${selectedSportId===s.id?'bg-red-600 text-white border-red-500':'bg-black/40 text-gray-300 border-white/10 hover:border-red-600'}`} onClick={() => setSelectedSportId(s.id)}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeSeries ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-green-300 text-sm">Active series: #{activeSeries.id} {activeSeries.title ? `— ${activeSeries.title}` : ''} {activeSeries?.gender ? `· ${activeSeries.gender === 'male' ? 'Men' : activeSeries.gender === 'female' ? 'Women' : 'Mixed'}` : ''}</div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md border border-red-700 bg-red-900/30 text-red-300 hover:bg-red-800/40"
                    onClick={() => setConfirmDeleteSeriesOpen(true)}
                  >
                    Remove series
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateSeries} className="mt-2 space-y-2">
                  <label className="block text-sm">Series title (optional)</label>
                  <input className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" placeholder="e.g., Knockouts" value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} />
                  <div>
                    <label className="block text-sm">Gender</label>
                    <select className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" value={seriesGender} onChange={(e) => setSeriesGender(e.target.value as any)}>
                      <option value="male">Men</option>
                      <option value="female">Women</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <button className="w-full bg-red-600 hover:bg-red-500 rounded-md py-2">Create series</button>
                </form>
              )}
            </div>

            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2">2) Add live match</h3>
              {!activeSeries ? (
                <div className="text-sm text-gray-400">Select a sport and create/continue a series first.</div>
              ) : (
                <form onSubmit={handleAddMatch} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm">Order</label>
                      <input name="match_order" type="number" min={1} value={matchOrder} onChange={(e) => setMatchOrder(Number(e.target.value||1))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm">Venue</label>
                      <input name="venue" className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" placeholder="Court 1" />
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm">Stage</label>
                      <select name="stage" className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                        <option value="">--</option>
                        <option value="round_of_16">Round of 16</option>
                        <option value="quarter_final">Quarter Final</option>
                        <option value="semi_final">Semi Final</option>
                        <option value="final">Final</option>
                      </select>
                    </div>
                    <div>
                        <label className="block text-sm">Status text</label>
                        <input name="status_text" className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" placeholder="QF1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm">Team 1</label>
                      <select name="faculty1_id" className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" required>
                        <option value="">-- choose --</option>
                        {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">Team 2</label>
                      <select name="faculty2_id" className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" required>
                        <option value="">-- choose --</option>
                        {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {formError && <div className="text-red-400 text-sm">{formError}</div>}
                  <button className="w-full bg-red-600 hover:bg-red-500 rounded-md py-2">Add match</button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">3) Matches in series</h3>
                {activeSeries?.gender && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{activeSeries.gender === 'male' ? 'Men' : activeSeries.gender === 'female' ? 'Women' : 'Mixed'}</span>
                )}
              </div>
              {!activeSeries ? (
                <div className="text-sm text-gray-400">No active series selected.</div>
              ) : matches.length === 0 ? (
                <div className="text-sm text-gray-400">No matches yet.</div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m, idx) => (
                    <div key={m.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-black/40 border border-zinc-800 rounded-lg p-3 overflow-hidden">
                      <div className="md:col-span-4 min-w-0">
                        <div className="text-xs text-gray-400">Match #{m.match_order} — {m.stage || 'stage'}</div>
                        <div className="text-sm text-gray-300">{m.venue || 'venue'}</div>
                        {m.winner_faculty_id && <div className="text-xs text-green-400 mt-1">Winner: {facultyNameById[m.winner_faculty_id] || m.winner_faculty_id}</div>}
                        <div className="mt-2 text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-1 mr-3"><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" /> Team 1:</span>
                          <span className="text-gray-300">{facultyNameById[m.faculty1_id] || 'Unknown'}</span>
                          <span className="mx-2 text-gray-600">|</span>
                          <span className="inline-flex items-center gap-1 mr-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" /> Team 2:</span>
                          <span className="text-gray-300">{facultyNameById[m.faculty2_id] || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 min-w-0">
                        <label className="block text-xs text-gray-500">Team 1 score — <span className="text-gray-300">{facultyNameById[m.faculty1_id] || 'Unknown'}</span></label>
                        <input value={m.faculty1_score ?? ''} onChange={(e) => { const v = e.target.value; setMatches((arr) => arr.map((x,i) => i===idx? { ...x, faculty1_score: v } : x)); }} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition" />
                      </div>
                      <div className="md:col-span-2 min-w-0">
                        <label className="block text-xs text-gray-500">Team 2 score — <span className="text-gray-300">{facultyNameById[m.faculty2_id] || 'Unknown'}</span></label>
                        <input value={m.faculty2_score ?? ''} onChange={(e) => { const v = e.target.value; setMatches((arr) => arr.map((x,i) => i===idx? { ...x, faculty2_score: v } : x)); }} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition" />
                      </div>
                      <div className="md:col-span-2 min-w-0">
                        <button
                          className={`px-3 py-1.5 rounded-md border transition-transform active:scale-95 disabled:opacity-50 w-full ${savedMatchIds.includes(m.id) ? 'bg-green-900/40 border-green-700/60' : 'bg-zinc-800 border-zinc-700'}`}
                          disabled={savingMatchIds.includes(m.id)}
                          onClick={() => saveScores(idx)}
                        >
                          {savingMatchIds.includes(m.id) ? (
                            <span className="inline-flex items-center gap-2 justify-center"><Loader2 className="w-4 h-4 animate-spin" /><span>Saving</span></span>
                          ) : savedMatchIds.includes(m.id) ? (
                            <span className="inline-flex items-center gap-2 justify-center"><Check className="w-4 h-4 text-green-400" /><span>Saved</span></span>
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                      <div className="md:col-span-2 min-w-0">
                        <label className="block text-xs text-gray-500">Winner</label>
                        <select className="bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition" value={m.winner_faculty_id ?? ''} onChange={(e) => markWinner(idx, e.target.value)}>
                          <option value="">TBA — Not decided</option>
                          <option value={m.faculty1_id}>Team 1 — {facultyNameById[m.faculty1_id] || 'Unknown'}</option>
                          <option value={m.faculty2_id}>Team 2 — {facultyNameById[m.faculty2_id] || 'Unknown'}</option>
                        </select>
                        <div className="text-[10px] text-zinc-500 mt-1">Choose and click Save to publish or reset to TBA.</div>
                        <button
                          type="button"
                          className="mt-2 w-full px-3 py-1.5 rounded-md border border-red-700 bg-red-900/30 text-red-300 hover:bg-red-800/40 disabled:opacity-50"
                          onClick={() => setConfirmDeleteId(m.id)}
                          disabled={savingMatchIds.includes(m.id) || pushingCommentIds.includes(m.id)}
                        >
                          Remove match
                        </button>
                      </div>
                      {/* Commentary input spanning full width below */}
                      <div className="md:col-span-12">
                        <label className="block text-xs text-gray-500">Commentary / Message (shown to audience)</label>
                        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
                          <textarea
                            rows={2}
                            placeholder="e.g., Thrilling rally! Score now 18-16."
                            value={(m as any).commentary ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setMatches((arr) => arr.map((x, i) => (i === idx ? { ...x, commentary: v } : x)));
                            }}
                            onKeyDown={(e) => {
                              const id = m.id as number;
                              if (e.key === 'Enter') {
                                e.stopPropagation();
                                const rec = enterCountsRef.current[id] || { count: 0, timer: null };
                                if (rec.timer) clearTimeout(rec.timer);
                                rec.count += 1;
                                rec.timer = setTimeout(() => {
                                  enterCountsRef.current[id] = { count: 0, timer: null } as any;
                                }, 600);
                                enterCountsRef.current[id] = rec as any;
                                if (rec.count >= 2) {
                                  e.preventDefault();
                                  enterCountsRef.current[id] = { count: 0, timer: null } as any;
                                  pushCommentary(idx);
                                }
                              } else {
                                enterCountsRef.current[m.id] = { count: 0, timer: null } as any;
                              }
                            }}
                            className="w-full bg-black border border-zinc-700 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => pushCommentary(idx)}
                            disabled={pushingCommentIds.includes(m.id)}
                            className={`px-3 py-2 rounded-md text-sm border transition-colors whitespace-nowrap ${pushingCommentIds.includes(m.id) ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-red-700/80 hover:bg-red-600 border-red-600 text-white'}`}
                          >
                            {pushingCommentIds.includes(m.id) ? 'Pushing…' : pushedCommentIds.includes(m.id) ? 'Pushed!' : 'Push comment (press Enter twice)'}
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">This message appears under the scores until you update it again. Tip: press Enter twice to push instantly.</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Finalization */}
            <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-2">4) All matches done</h3>
              {!activeSeries ? (
                <div className="text-sm text-gray-400">Select a sport and create/continue a series first.</div>
              ) : (
                <div className="space-y-3">
                  {/* Placements section */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Placements and points</div>
                    {placements.map((p, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-6">
                          <label className="block text-xs text-gray-500">Faculty</label>
                          <select value={p.faculty_id} onChange={(e) => setPlacements(arr => arr.map((x, idx) => idx===i ? { ...x, faculty_id: e.target.value } : x))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                            <option value="">-- choose --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs text-gray-500">Winning status</label>
                          <select value={p.label} onChange={(e) => setPlacements(arr => arr.map((x, idx) => idx===i ? { ...x, label: e.target.value as any } : x))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                            <option value="champion">Champion</option>
                            <option value="runner_up">Runner-up</option>
                            <option value="second_runner_up">Second runner-up</option>
                            <option value="third_runner_up">Third runner-up</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Points</label>
                          <input type="number" min={0} value={p.points} onChange={(e) => setPlacements(arr => arr.map((x, idx) => idx===i ? { ...x, points: Number(e.target.value||0) } : x))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" />
                        </div>
                        <div className="md:col-span-1">
                          <button type="button" className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md" onClick={() => setPlacements(arr => arr.filter((_, idx) => idx !== i))}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => setPlacements(arr => [...arr, { faculty_id: '', label: 'third_runner_up', points: 1 }])}>Add placement</button>
                    </div>
                  </div>

                  {/* Participants section */}
                  <div className="space-y-2 pt-2">
                    <div className="text-sm font-medium text-zinc-200">Participants (default 1 point)</div>
                    {participants.map((p, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <div className="md:col-span-9">
                          <label className="block text-xs text-gray-500">Faculty</label>
                          <select value={p.faculty_id} onChange={(e) => setParticipants(arr => arr.map((x, idx) => idx===i ? { ...x, faculty_id: e.target.value } : x))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                            <option value="">-- choose --</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Points</label>
                          <input type="number" min={0} value={p.points} onChange={(e) => setParticipants(arr => arr.map((x, idx) => idx===i ? { ...x, points: Number(e.target.value||1) } : x))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" />
                        </div>
                        <div className="md:col-span-1">
                          <button type="button" className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md" onClick={() => setParticipants(arr => arr.filter((_, idx) => idx !== i))}>Remove</button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => setParticipants(arr => [...arr, { faculty_id: '', points: 1 }])}>Add participant</button>
                    </div>
                  </div>
                  {finalizeError && <div className="text-red-400 text-sm">{finalizeError}</div>}
                  {finalizeOk && <div className="text-green-400 text-sm">{finalizeOk}</div>}
                  <button onClick={() => setConfirmFinalizeOpen(true)} className="w-full bg-green-700 hover:bg-green-600 rounded-md py-2">Finalize series + apply points</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
      {/* Custom confirmation dialogs */}
      <ConfirmDialog
        open={confirmSaveIdx !== null}
        title="Save scores?"
        description={(() => {
          if (confirmSaveIdx === null) return null as any;
          const m = matches[confirmSaveIdx];
          if (!m) return null as any;
          const t1 = facultyNameById[m.faculty1_id] || 'Team 1';
          const t2 = facultyNameById[m.faculty2_id] || 'Team 2';
          return (
            <div>
              <div className="text-sm text-zinc-300">Match #{m.match_order} — {m.stage || 'stage'}</div>
              <div className="mt-1 text-zinc-400">
                {t1}: <span className="text-white">{m.faculty1_score ?? ''}</span>
                <span className="mx-2 text-zinc-600">vs</span>
                {t2}: <span className="text-white">{m.faculty2_score ?? ''}</span>
              </div>
            </div>
          );
        })()}
        confirmLabel="Save"
        cancelLabel="Cancel"
        loading={confirmSaveLoading}
        onConfirm={() => { if (confirmSaveIdx !== null) performSave(confirmSaveIdx); }}
        onCancel={() => setConfirmSaveIdx(null)}
      />

      <ConfirmDialog
        open={confirmFinalizeOpen}
        title="Finalize series?"
        description={(
          <div className="space-y-1">
            <div className="text-zinc-400 text-sm">Placements: {placements.filter(p=>p.faculty_id).length} • Participants: {participants.filter(p=>p.faculty_id).length}</div>
            <div className="pt-2 text-xs text-zinc-500">This will apply points as configured and remove the live series.</div>
          </div>
        )}
        confirmLabel="Finalize"
        cancelLabel="Back"
        loading={confirmFinalizeLoading}
        onConfirm={async () => {
          setConfirmFinalizeLoading(true);
          try {
            await onFinalizeSeries();
            if (activeSeries?.id) {
              await completeAllMatchesInSeries(activeSeries.id);
              await deleteLiveSeries(activeSeries.id);
              setActiveSeries(null);
              setMatches([]);
              setRefreshKey(k=>k+1);
            }
            setConfirmFinalizeOpen(false);
          } finally {
            setConfirmFinalizeLoading(false);
          }
        }}
        onCancel={() => setConfirmFinalizeOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Remove match?"
        description={(() => {
          const m = matches.find(x => x.id === confirmDeleteId);
          if (!m) return null as any;
          const t1 = facultyNameById[m.faculty1_id] || 'Team 1';
          const t2 = facultyNameById[m.faculty2_id] || 'Team 2';
          return (
            <div>
              <div className="text-sm text-zinc-300">Match #{m.match_order} — {m.stage || 'stage'}</div>
              <div className="mt-1 text-zinc-400">{t1} vs {t2} @ {m.venue || 'venue'}</div>
              <div className="pt-2 text-xs text-zinc-500">This cannot be undone. Any in-progress viewers will stop seeing this match.</div>
            </div>
          );
        })()}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        loading={confirmDeleteLoading}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          setConfirmDeleteLoading(true);
          try {
            await deleteLiveMatch(confirmDeleteId);
            setMatches(arr => arr.filter(m => m.id !== confirmDeleteId));
            setRefreshKey(k=>k+1);
            setConfirmDeleteId(null);
          } finally {
            setConfirmDeleteLoading(false);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmDeleteSeriesOpen}
        title="Remove entire series?"
        description={(
          <div className="space-y-1">
            <div className="text-sm text-zinc-300">This will delete the active live series and ALL its matches.</div>
            <div className="pt-2 text-xs text-zinc-500">This cannot be undone.</div>
          </div>
        )}
        confirmLabel="Remove series"
        cancelLabel="Cancel"
        loading={confirmDeleteSeriesLoading}
        onConfirm={async () => {
          if (!activeSeries?.id) return;
          setConfirmDeleteSeriesLoading(true);
          try {
            await deleteLiveSeries(activeSeries.id);
            setActiveSeries(null);
            setMatches([]);
            setRefreshKey(k=>k+1);
            setConfirmDeleteSeriesOpen(false);
          } finally {
            setConfirmDeleteSeriesLoading(false);
          }
        }}
        onCancel={() => setConfirmDeleteSeriesOpen(false)}
      />

      {/* 5) Manage previous results */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
          <h3 className="font-semibold mb-2">5) Manage previous results</h3>
          {!selectedSportId ? (
            <div className="text-sm text-gray-400">Select a sport at the top to view results.</div>
          ) : (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="text-sm text-gray-400">No results yet for this sport.</div>
              ) : (
                results.map(r => (
                  <div key={r.id} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-300">
                        <div className="font-medium">{r.event || 'Overall'}</div>
                        <div className="text-xs text-gray-500">{r.gender} • {r.category} • {r.event_date} {r.event_time}</div>
                      </div>
                      {editingResultId === r.id ? (
                        <div className="text-xs text-red-300">Editing…</div>
                      ) : (
                        <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => openEditResult(r.id)}>Edit</button>
                      )}
                    </div>
                    {editingResultId === r.id && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-3">
                          <label className="block text-xs text-gray-500">Event</label>
                          <input value={(editingResultMeta.event ?? '') as string} onChange={e=>setEditingResultMeta(m=>({ ...m, event: e.target.value }))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs text-gray-500">Category</label>
                          <select value={(editingResultMeta.category as any) || r.category} onChange={e=>setEditingResultMeta(m=>({ ...m, category: e.target.value as any }))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                            <option value="Team Sport">Team Sport</option>
                            <option value="Individual Sport">Individual Sport</option>
                            <option value="Athletics">Athletics</option>
                            <option value="Swimming">Swimming</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Gender</label>
                          <select value={(editingResultMeta.gender as any) || r.gender} onChange={e=>setEditingResultMeta(m=>({ ...m, gender: e.target.value as any }))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                            <option value="Men's">Men's</option>
                            <option value="Women's">Women's</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Date</label>
                          <input type="date" value={editingResultMeta.event_date || r.event_date} onChange={e=>setEditingResultMeta(m=>({ ...m, event_date: e.target.value }))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Time</label>
                          <input type="time" value={(editingResultMeta.event_time || (r.event_time || '')).slice(0,5)} onChange={e=>setEditingResultMeta(m=>({ ...m, event_time: (e.target.value.length===5? e.target.value+':00' : e.target.value) }))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                        </div>
                        <div className="md:col-span-12">
                          <div className="text-sm font-medium text-zinc-300 mb-1">Positions</div>
                          {editingPositions.map((p, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end mb-2">
                              <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500">Place</label>
                                <input type="number" min={1} value={p.place} onChange={e=>setEditingPositions(arr=>arr.map((x,idx)=>idx===i?{...x, place: Number(e.target.value||1)}:x))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                              </div>
                              <div className="md:col-span-8">
                                <label className="block text-xs text-gray-500">Faculty</label>
                                <select value={p.faculty_id} onChange={e=>setEditingPositions(arr=>arr.map((x,idx)=>idx===i?{...x, faculty_id: e.target.value}:x))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                                  <option value="">-- choose --</option>
                                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <button type="button" className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md" onClick={()=>removePositionRow(i)}>Remove</button>
                              </div>
                            </div>
                          ))}
                          <button type="button" className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={addPositionRow}>Add position</button>
                        </div>
                        {resultsError && <div className="md:col-span-12 text-red-400 text-sm">{resultsError}</div>}
                        <div className="md:col-span-12 flex gap-2 justify-end">
                          <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>setEditingResultId(null)}>Cancel</button>
                          <button className={`px-3 py-1.5 rounded-md ${resultsSaving? 'bg-green-900/50 cursor-wait' : 'bg-green-700 hover:bg-green-600'}`} onClick={saveEditedResult} disabled={resultsSaving}>{resultsSaving ? 'Saving…' : 'Save'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

  {/* 6) Manage schedule (lineup) */}
  <div id="config-lineup" className="max-w-6xl mx-auto mt-6 mb-10 px-4">
        <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
          <h3 className="font-semibold mb-2">6) Manage schedule (lineup)</h3>
          <form onSubmit={addScheduleItem} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3">
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500">Date</label>
              <input type="date" value={newSched.event_date} onChange={e=>setNewSched(s=>({...s, event_date: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500">Sport</label>
              <select value={newSched.sport_id ?? ''} onChange={e=>setNewSched(s=>({...s, sport_id: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                <option value="">— none —</option>
                {sports.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500">Label (event)</label>
              <input value={newSched.sport_label ?? ''} onChange={e=>setNewSched(s=>({...s, sport_label: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" placeholder="e.g., Football" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500">Start time</label>
              <input type="time" value={newSched.start_time ?? ''} onChange={e=>setNewSched(s=>({...s, start_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500">End time</label>
              <input type="time" value={newSched.end_time ?? ''} onChange={e=>setNewSched(s=>({...s, end_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs text-gray-500">Venue</label>
              <input value={newSched.venue} onChange={e=>setNewSched(s=>({...s, venue: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" placeholder="Main Ground" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button className="w-full px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500">Add</button>
            </div>
          </form>
          <div className="text-xs text-gray-500 mb-2">Tip: Provide either Sport or Label. Start time is required; End time is optional.</div>
          {scheduleError && <div className="text-red-400 text-sm mb-2">{scheduleError}</div>}
          <div className="space-y-2">
            {schedule.map(item => (
              <div key={item.id} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                {editingSchedId === item.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500">Date</label>
                      <input type="date" defaultValue={item.event_date} onChange={e=>setEditingSched(s=>({...s, event_date: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500">Label</label>
                      <input defaultValue={item.sport_label ?? ''} onChange={e=>setEditingSched(s=>({...s, sport_label: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500">Time range</label>
                      <input defaultValue={item.time_range ?? ''} onChange={e=>setEditingSched(s=>({...s, time_range: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500">Start time</label>
                      <input type="time" defaultValue={item.start_time ? item.start_time.slice(0,5) : ''} onChange={e=>setEditingSched(s=>({...s, start_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500">End time</label>
                      <input type="time" defaultValue={item.end_time ? item.end_time.slice(0,5) : ''} onChange={e=>setEditingSched(s=>({...s, end_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-xs text-gray-500">Venue</label>
                      <input defaultValue={item.venue} onChange={e=>setEditingSched(s=>({...s, venue: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                    </div>
                    <div className="md:col-span-12 flex justify-end gap-2">
                      <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingSchedId(null); setEditingSched({}); }}>Cancel</button>
                      <button className="px-3 py-1.5 rounded-md bg-green-700 hover:bg-green-600" onClick={()=>saveScheduleItem(item.id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-300">
                      <div className="font-medium">{item.sport_label || 'Event'}</div>
                      <div className="text-xs text-gray-500">{item.event_date} • {(item.time_range || ((item.start_time || item.end_time) ? `${(item.start_time||'').slice(0,5)}${item.end_time ? `–${item.end_time.slice(0,5)}` : ''}` : ''))} • {item.venue}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingSchedId(item.id); setEditingSched({}); }}>Edit</button>
                      <button className="px-3 py-1.5 rounded-md border border-red-700 bg-red-900/30 text-red-300 hover:bg-red-800/40" onClick={async()=>{ if(!confirm('Delete this schedule item? This cannot be undone.')) return; await deleteScheduledEvent(item.id); setScheduleRefreshKey(k=>k+1); }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
