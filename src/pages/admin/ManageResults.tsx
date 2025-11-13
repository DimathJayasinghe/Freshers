import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import AdminLayout from '@/components/AdminLayout';
import {
  fetchSports,
  fetchResultsBySport,
  fetchResultPositions,
  updateResultRow,
  replaceResultPositionsAndReapply,
  deleteResult,
  fetchFacultiesList,
  isCurrentUserAdmin,
} from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

type Sport = { id: string; name: string; };
type ResultRow = { id: number; event: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string };
type PositionRow = { place: number; faculty_id: string; faculties?: { name: string } | { name: string }[] | null };

const ManageResultsPage: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [whoami, setWhoami] = useState<{ email: string | null; admin: boolean }>({ email: null, admin: false });

  const [editingMetaId, setEditingMetaId] = useState<number | null>(null);
  const [metaDraft, setMetaDraft] = useState<Partial<ResultRow>>({});

  const [positionsByResult, setPositionsByResult] = useState<Record<number, PositionRow[]>>({});
  const [editingPosId, setEditingPosId] = useState<number | null>(null);
  // New drafts to mirror AdminDashboard finalization UI
  const [placementsDraft, setPlacementsDraft] = useState<Record<number, { faculty_id: string; label: 'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up'; points: number }[]>>({});
  const [participantsRowsDraft, setParticipantsRowsDraft] = useState<Record<number, { faculty_id: string; points: number }[]>>({});
  const [faculties, setFaculties] = useState<{ id: string; name: string; short_name: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSports();
        setSports((s as any[]).map(r => ({ id: r.id, name: r.name })));
        const { data: user } = await supabase!.auth.getUser();
        const admin = await isCurrentUserAdmin();
        setWhoami({ email: user.user?.email ?? null, admin });
        const facs = await fetchFacultiesList();
        setFaculties(facs);
      } catch (e: any) {
        console.error('[ManageResults] init error', e);
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedSport) { setResults([]); return; }
    setLoading(true);
    fetchResultsBySport(selectedSport)
      .then((rows: any) => setResults(rows))
      .catch((e) => setError(e?.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [selectedSport]);

  async function loadPositions(resultId: number) {
    try {
      const pos = await fetchResultPositions(resultId);
      setPositionsByResult(prev => ({ ...prev, [resultId]: pos as PositionRow[] }));
    } catch (e) {
      console.error('[ManageResults] fetch positions error', e);
    }
  }

  // faculty options derived directly from faculties when rendering selects

  // Metadata editing
  function startEditMeta(r: ResultRow) {
    setEditingMetaId(r.id);
    setMetaDraft({ event: r.event ?? '', category: r.category, gender: r.gender, event_date: r.event_date, event_time: r.event_time });
  }
  async function saveMeta(id: number) {
    setError(null);
    try {
      setSaving(true);
      const patch: any = {
        event: (metaDraft.event ?? '').trim(),
        category: metaDraft.category,
        gender: metaDraft.gender,
        event_date: metaDraft.event_date,
        event_time: metaDraft.event_time,
      };
      await updateResultRow(id, patch);
      const updated = await fetchResultsBySport(selectedSport);
      setResults(updated as any);
      setEditingMetaId(null);
      setMetaDraft({});
    } catch (e: any) {
      console.error('[ManageResults] saveMeta error', e);
      const msg = e?.message || 'Failed to update result';
      if (/row[- ]level security|RLS/i.test(msg)) setError('Permission denied by RLS. Ensure admin policies allow UPDATE on results.');
      else setError(msg);
    } finally { setSaving(false); }
  }

  // Positions editing
  async function startEditPos(r: ResultRow) {
    setEditingPosId(r.id);
    if (!positionsByResult[r.id]) await loadPositions(r.id);
    const current = (positionsByResult[r.id] || []).sort((a,b)=>a.place-b.place);
    // Map first four places to labeled placements; remainder become participants with 1 point
    const placeToLabel = (place: number): 'champion' | 'runner_up' | 'second_runner_up' | 'third_runner_up' => {
      if (place === 1) return 'champion';
      if (place === 2) return 'runner_up';
      if (place === 3) return 'second_runner_up';
      return 'third_runner_up';
    };
    const defaultPointsForLabel: Record<'champion'|'runner_up'|'second_runner_up'|'third_runner_up', number> = { champion:7, runner_up:5, second_runner_up:3, third_runner_up:2 };
    const placements = current
      .filter(p => p.place >= 1 && p.place <= 4)
      .map(p => ({ faculty_id: p.faculty_id, label: placeToLabel(p.place), points: defaultPointsForLabel[placeToLabel(p.place)] }));
    const participants = current
      .filter(p => p.place > 4)
      .map(p => ({ faculty_id: p.faculty_id, points: 1 }));
    setPlacementsDraft(prev => ({ ...prev, [r.id]: placements.length ? placements : [
      { faculty_id: '', label: 'champion', points: 7 },
      { faculty_id: '', label: 'runner_up', points: 5 },
      { faculty_id: '', label: 'second_runner_up', points: 3 },
      { faculty_id: '', label: 'third_runner_up', points: 2 },
    ] }));
    setParticipantsRowsDraft(prev => ({ ...prev, [r.id]: participants }));
  }
  function addPlacement(resultId: number) {
    setPlacementsDraft(prev => ({
      ...prev,
      [resultId]: [...(prev[resultId] || []), { faculty_id: '', label: 'third_runner_up', points: 1 }]
    }));
  }
  function removePlacement(resultId: number, index: number) {
    setPlacementsDraft(prev => {
      const list = prev[resultId] || [];
      const removed = list[index];
      const updated = list.filter((_, i) => i !== index);
      if (removed?.faculty_id) {
        setParticipantsRowsDraft(pp => ({ ...pp, [resultId]: [ ...(pp[resultId] || []), { faculty_id: removed.faculty_id, points: 1 } ] }));
      }
      return { ...prev, [resultId]: updated };
    });
  }
  function addParticipant(resultId: number) {
    setParticipantsRowsDraft(prev => ({ ...prev, [resultId]: [ ...(prev[resultId] || []), { faculty_id: '', points: 1 } ] }));
  }
  function removeParticipant(resultId: number, index: number) {
    setParticipantsRowsDraft(prev => ({ ...prev, [resultId]: (prev[resultId] || []).filter((_,i)=>i!==index) }));
  }
  async function savePositions(resultId: number) {
    setError(null);
    try {
      setSaving(true);
      const placements = (placementsDraft[resultId] || []).filter(p => p.faculty_id);
      const placeMap: Record<'champion'|'runner_up'|'second_runner_up'|'third_runner_up', number> = { champion:1, runner_up:2, second_runner_up:3, third_runner_up:4 };
      const positions = placements.map(p => ({ place: placeMap[p.label], faculty_id: p.faculty_id }));
      // Important: backend splits base points among ties; to make per-team points stick, multiply by tie size
      const groupedByPlace: Record<number, { count: number; perTeamPoints: number }> = {};
      placements.forEach(p => {
        const place = placeMap[p.label];
        const per = Number(p.points || 0);
        if (!groupedByPlace[place]) groupedByPlace[place] = { count: 0, perTeamPoints: per };
        groupedByPlace[place].count += 1;
        // if multiple entries have different per-team points, keep the first non-zero; UI should ideally keep them equal
        if (!groupedByPlace[place].perTeamPoints && per) groupedByPlace[place].perTeamPoints = per;
      });
      const customPoints: Record<number, number> = {};
      Object.entries(groupedByPlace).forEach(([placeStr, g]) => {
        const place = Number(placeStr);
        customPoints[place] = (g.perTeamPoints || 0) * Math.max(1, g.count);
      });
      const participants = (participantsRowsDraft[resultId] || []).filter(pp => pp.faculty_id && !positions.some(x => x.faculty_id === pp.faculty_id));
      await replaceResultPositionsAndReapply(resultId, positions, customPoints, participants, 'always');
      await loadPositions(resultId);
      setEditingPosId(null);
      // clear draft states for this result
      setParticipantsRowsDraft(prev => ({ ...prev, [resultId]: [] }));
    } catch (e: any) {
      console.error('[ManageResults] savePositions error', e);
      const msg = e?.message || 'Failed to update positions';
      if (/row[- ]level security|RLS/i.test(msg)) setError('Permission denied by RLS. Ensure admin policies allow INSERT/DELETE on result_positions.');
      else setError(msg);
    } finally { setSaving(false); }
  }

  async function handleDeleteResult(resultId: number) {
    if (!confirm('Delete this result and its placements? Points for overall results will be reversed automatically.')) return;
    setError(null);
    try {
      setSaving(true);
      await deleteResult(resultId);
      const updated = await fetchResultsBySport(selectedSport);
      setResults(updated as any);
      const p = { ...positionsByResult }; delete p[resultId]; setPositionsByResult(p);
    } catch (e: any) {
      console.error('[ManageResults] delete result error', e);
      const msg = e?.message || 'Failed to delete result';
      if (/row[- ]level security|RLS/i.test(msg)) setError('Permission denied by RLS. Ensure admin policies allow DELETE on results and result_positions.');
      else setError(msg);
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <AdminLayout title="Manage Results">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs text-gray-500 mb-2">Signed in as: {whoami.email ?? '—'} • Admin verified: {whoami.admin ? 'Yes' : 'No'}</div>
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Edit finalized results</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-6">
                <label className="block text-xs text-gray-500">Sport</label>
                <select value={selectedSport} onChange={e=>setSelectedSport(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                  <option value="">Select a sport…</option>
                  {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
            {loading && <div className="text-gray-400 text-sm">Loading…</div>}

            {!loading && selectedSport && (
              <div className="space-y-3">
                {results.length === 0 && (
                  <div className="text-gray-400 text-sm">No results found for this sport.</div>
                )}
                {results.map((r) => {
                  const positions = positionsByResult[r.id];
                  return (
                    <div key={r.id} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                      {/* Metadata */}
                      {editingMetaId === r.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <div className="md:col-span-4">
                            <label className="block text-xs text-gray-500">Event (optional)</label>
                            <input defaultValue={r.event ?? ''} onChange={e=>setMetaDraft(d=>({...d, event: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs text-gray-500">Category</label>
                            <select defaultValue={r.category} onChange={e=>setMetaDraft(d=>({...d, category: e.target.value as ResultRow['category']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                              <option>Team Sport</option>
                              <option>Individual Sport</option>
                              <option>Athletics</option>
                              <option>Swimming</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500">Gender</label>
                            <select defaultValue={r.gender} onChange={e=>setMetaDraft(d=>({...d, gender: e.target.value as ResultRow['gender']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                              <option>Men's</option>
                              <option>Women's</option>
                              <option>Mixed</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500">Date</label>
                            <input type="date" defaultValue={r.event_date} onChange={e=>setMetaDraft(d=>({...d, event_date: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500">Time</label>
                            <input
                              type="time"
                              value={(metaDraft.event_time || (r.event_time || '')).slice(0,5)}
                              onChange={e=>setMetaDraft(d=>({
                                ...d,
                                event_time: (e.target.value.length===5 ? `${e.target.value}:00` : e.target.value)
                              }))}
                              className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="md:col-span-12 flex justify-end gap-2">
                            <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingMetaId(null); setMetaDraft({}); }}>Cancel</button>
                            <button className="px-3 py-1.5 rounded-md bg-green-700 hover:bg-green-600" onClick={()=>saveMeta(r.id)}>{saving ? 'Saving…' : 'Save'}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm text-gray-300">
                            <div className="font-medium">{r.event || 'Overall standings'} • {r.gender}</div>
                            <div className="text-xs text-gray-500">{r.category} • {r.event_date} {r.event_time}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>startEditMeta(r)}>Edit meta</button>
                            <button className="px-3 py-1.5 rounded-md border border-red-700 bg-red-900/30 text-red-300 hover:bg-red-800/40" onClick={()=>handleDeleteResult(r.id)}>Delete</button>
                          </div>
                        </div>
                      )}

                      {/* Positions */}
                      <div className="mt-3">
                        {editingPosId === r.id ? (
                          <div className="space-y-3">
                            {/* Placements and points */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-zinc-200">Placements and points</div>
                              {(placementsDraft[r.id] || []).map((p, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                  <div className="md:col-span-6">
                                    <label className="block text-xs text-gray-500">Faculty</label>
                                    <select value={p.faculty_id} onChange={e => setPlacementsDraft(arr => ({ ...arr, [r.id]: (arr[r.id] || []).map((x,idx)=> idx===i ? { ...x, faculty_id: e.target.value } : x) }))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                                      <option value="">-- choose --</option>
                                      {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                  </div>
                                  <div className="md:col-span-3">
                                    <label className="block text-xs text-gray-500">Winning status</label>
                                    <select value={p.label} onChange={e => setPlacementsDraft(arr => ({ ...arr, [r.id]: (arr[r.id] || []).map((x,idx)=> idx===i ? { ...x, label: e.target.value as any } : x) }))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                                      <option value="champion">Champion</option>
                                      <option value="runner_up">Runner-up</option>
                                      <option value="second_runner_up">Second runner-up</option>
                                      <option value="third_runner_up">Third runner-up</option>
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500">Points</label>
                                    <input type="number" min={0} value={p.points} onChange={e => setPlacementsDraft(arr => ({ ...arr, [r.id]: (arr[r.id] || []).map((x,idx)=> idx===i ? { ...x, points: Number(e.target.value||0) } : x) }))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" />
                                  </div>
                                  <div className="md:col-span-1">
                                    <button type="button" className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md" onClick={() => removePlacement(r.id, i)}>Remove</button>
                                  </div>
                                </div>
                              ))}
                              <div>
                                <button type="button" className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => addPlacement(r.id)}>Add placement</button>
                              </div>
                            </div>
                            {/* Participants */}
                            <div className="space-y-2 pt-2">
                              <div className="text-sm font-medium text-zinc-200">Participants (default 1 point)</div>
                              {(participantsRowsDraft[r.id] || []).map((p, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                  <div className="md:col-span-9">
                                    <label className="block text-xs text-gray-500">Faculty</label>
                                    <select value={p.faculty_id} onChange={e => setParticipantsRowsDraft(arr => ({ ...arr, [r.id]: (arr[r.id] || []).map((x,idx)=> idx===i ? { ...x, faculty_id: e.target.value } : x) }))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2">
                                      <option value="">-- choose --</option>
                                      {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500">Points</label>
                                    <input type="number" min={0} value={p.points} onChange={e => setParticipantsRowsDraft(arr => ({ ...arr, [r.id]: (arr[r.id] || []).map((x,idx)=> idx===i ? { ...x, points: Number(e.target.value||1) } : x) }))} className="w-full bg-black border border-zinc-700 rounded-md px-3 py-2" />
                                  </div>
                                  <div className="md:col-span-1">
                                    <button type="button" className="w-full px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-md" onClick={() => removeParticipant(r.id, i)}>Remove</button>
                                  </div>
                                </div>
                              ))}
                              <div>
                                <button type="button" className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => addParticipant(r.id)}>Add participant</button>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingPosId(null); }}>Cancel</button>
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded-md bg-green-700 hover:bg-green-600" onClick={()=>savePositions(r.id)}>{saving ? 'Saving…' : 'Save positions'}</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {!positions ? (
                              <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>loadPositions(r.id)}>Load placements</button>
                            ) : positions.length === 0 ? (
                              <div className="text-xs text-gray-500">No placements yet</div>
                            ) : (
                              <div className="space-y-1">
                                {positions.map((p, idx) => (
                                  <div key={idx} className="text-xs text-gray-400">{p.place}. {(Array.isArray(p.faculties) ? (p.faculties as any[])[0]?.name : p.faculties?.name) || p.faculty_id}</div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2">
                              <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>startEditPos(r)}>Edit placements</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default ManageResultsPage;
