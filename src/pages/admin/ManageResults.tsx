import React, { useEffect, useMemo, useState } from 'react';
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
type ResultRow = { id: number; event: string | null; category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'; gender: "Men's" | "Women's" | 'Mixed'; event_date: string; event_time: string; venue?: string | null };
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
  const [posDraft, setPosDraft] = useState<Record<number, { place: number; faculty_id: string }[]>>({});
  const [useCustomPoints, setUseCustomPoints] = useState<Record<number, boolean>>({});
  const [customPointsMap, setCustomPointsMap] = useState<Record<number, Record<number, number>>>({});
  const [participantsDraft, setParticipantsDraft] = useState<Record<number, string[]>>({});
  const [participantToAdd, setParticipantToAdd] = useState<Record<number, string>>({});
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

  const facultyOptions = useMemo(() => faculties.map(f => ({ id: f.id, label: `${f.name}` })), [faculties]);

  // Metadata editing
  function startEditMeta(r: ResultRow) {
    setEditingMetaId(r.id);
  setMetaDraft({ event: r.event ?? '', category: r.category, gender: r.gender, event_date: r.event_date, event_time: r.event_time, venue: r.venue ?? '' });
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
        venue: (metaDraft.venue ?? '').trim() || null,
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
    const current = positionsByResult[r.id] || [];
    const draft = current.map(p => ({ place: p.place, faculty_id: p.faculty_id }));
    setPosDraft(prev => ({ ...prev, [r.id]: draft }));
    // initialize participants as empty; admins can add moved/other faculties
    setParticipantsDraft(prev => ({ ...prev, [r.id]: prev[r.id] ?? [] }));
  }
  function addPlace(resultId: number) {
    const list = posDraft[resultId] || [];
    const nextPlace = (list[list.length - 1]?.place || 0) + 1;
    const updated = [...list, { place: nextPlace, faculty_id: '' }];
    setPosDraft(prev => ({ ...prev, [resultId]: updated }));
  }
  function removePlace(resultId: number, index: number) {
    const list = posDraft[resultId] || [];
    const removed = list[index];
    const updated = list.filter((_, i) => i !== index).map((p, i2) => ({ ...p, place: i2 + 1 }));
    // if a faculty was removed from placements, add to participants list
    if (removed?.faculty_id) {
      setParticipantsDraft(prev => {
        const cur = new Set(prev[resultId] || []);
        cur.add(removed.faculty_id);
        return { ...prev, [resultId]: Array.from(cur) };
      });
    }
    setPosDraft(prev => ({ ...prev, [resultId]: updated }));
  }
  async function savePositions(resultId: number) {
    setError(null);
    try {
      setSaving(true);
      const draft = (posDraft[resultId] || []).filter(p => p.faculty_id);
      // normalize places ascending
      draft.sort((a, b) => a.place - b.place).forEach((p, i) => { p.place = i + 1; });
      const custom = useCustomPoints[resultId] ? (customPointsMap[resultId] || {}) : undefined;
      const participants = (participantsDraft[resultId] || [])
        .filter(fid => fid && !draft.some(p => p.faculty_id === fid))
        .map(fid => ({ faculty_id: fid, points: 1 }));
  await replaceResultPositionsAndReapply(resultId, draft, custom as any, participants as any, 'always');
      await loadPositions(resultId);
      setEditingPosId(null);
      // clear draft states for this result
      setParticipantsDraft(prev => ({ ...prev, [resultId]: [] }));
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
                            <input type="time" defaultValue={r.event_time} onChange={e=>setMetaDraft(d=>({...d, event_time: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs text-gray-500">Venue</label>
                            <input defaultValue={r.venue ?? ''} onChange={e=>setMetaDraft(d=>({...d, venue: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" placeholder="Main Ground" />
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
                            <div className="text-xs text-gray-500">{r.category} • {r.event_date} {r.event_time} • {r.venue || '—'}</div>
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
                          <div className="space-y-2">
                            {/* Custom points toggle and inputs */}
                            <div className="border border-zinc-800 rounded-md p-2 bg-black/30">
                              <label className="flex items-center gap-2 text-xs text-gray-400">
                                <input type="checkbox" checked={!!useCustomPoints[r.id]} onChange={e=>setUseCustomPoints(prev=>({...prev, [r.id]: e.target.checked}))} />
                                Use custom points for placements
                              </label>
                              {useCustomPoints[r.id] && (
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2 text-xs">
                                  {[1,2,3,4,5,6].map(place => (
                                    <div key={place} className="flex items-center gap-1">
                                      <span className="text-gray-500">#{place}:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        defaultValue={customPointsMap[r.id]?.[place] ?? (place===1?7:place===2?5:place===3?3:place===4?2:1)}
                                        onChange={e=>{
                                          const val = Number(e.target.value);
                                          setCustomPointsMap(prev=>({ ...prev, [r.id]: { ...(prev[r.id]||{}), [place]: val } }));
                                        }}
                                        className="w-16 bg-black border border-zinc-700 rounded-md px-2 py-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {(posDraft[r.id] || []).map((p, idx) => (
                              <div key={idx} className="grid grid-cols-12 items-center gap-2">
                                <div className="col-span-2 text-xs text-gray-500">Place #{idx + 1}</div>
                                <div className="col-span-8">
                                  <select value={p.faculty_id} onChange={e => {
                                    const list = [...(posDraft[r.id] || [])];
                                    list[idx] = { ...list[idx], faculty_id: e.target.value };
                                    setPosDraft(prev => ({ ...prev, [r.id]: list }));
                                  }} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                                    <option value="">Select faculty…</option>
                                    {facultyOptions.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                  </select>
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <button className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>removePlace(r.id, idx)}>Remove</button>
                                </div>
                              </div>
                            ))}
                            {/* Participants editor */}
                            <div className="mt-3">
                              <div className="text-xs text-gray-400 mb-1">Participants (1 point each, not in placements)</div>
                              <div className="flex items-center gap-2 mb-2">
                                <select value={participantToAdd[r.id] || ''} onChange={e=>setParticipantToAdd(prev=>({ ...prev, [r.id]: e.target.value }))} className="bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                                  <option value="">Select faculty…</option>
                                  {facultyOptions.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                                <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={() => {
                                  const fid = (participantToAdd[r.id] || '').trim();
                                  if (!fid) return;
                                  setParticipantsDraft(prev => {
                                    const cur = new Set(prev[r.id] || []);
                                    // do not add if already placed
                                    const placed = (posDraft[r.id] || []).some(p => p.faculty_id === fid);
                                    if (!placed) cur.add(fid);
                                    return { ...prev, [r.id]: Array.from(cur) };
                                  });
                                  setParticipantToAdd(prev => ({ ...prev, [r.id]: '' }));
                                }}>Add participant</button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(participantsDraft[r.id] || []).map(fid => (
                                  <span key={fid} className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 flex items-center gap-2">
                                    {facultyOptions.find(f => f.id === fid)?.label || fid}
                                    <button className="text-red-400" onClick={() => setParticipantsDraft(prev => ({ ...prev, [r.id]: (prev[r.id] || []).filter(x => x !== fid) }))}>✕</button>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingPosId(null); }}>Cancel</button>
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>addPlace(r.id)}>Add place</button>
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
