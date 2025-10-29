import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminCard from "@/components/AdminCard";
import { Button } from "@/components/ui/button";
import { fetchSports, fetchFacultiesList, fetchResultsBySport, createResult, addResultPositions, fetchResultPositions, applyPointsForResult, deleteResult } from "@/lib/api";
import type { AdminResultInput, ResultPositionInput } from "@/data/adminData";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSportEdit() {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const [sport, setSport] = useState<{ id: string; name: string; category: string; gender?: string } | null>(null);
  const [faculties, setFaculties] = useState<{ id: string; name: string }[]>([]);
  const [results, setResults] = useState<any[]>([]);

  // form for new event/result
  const [eventName, setEventName] = useState('');
  const [gender, setGender] = useState<"Men's" | "Women's" | 'Mixed'>("Men's");
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('09:00');
  const [positions, setPositions] = useState<ResultPositionInput[]>([{ place: 1, faculty_id: '' }, { place: 2, faculty_id: '' }, { place: 3, faculty_id: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sp = await fetchSports();
      const found = (sp || []).find((s) => s.id === sportId);
      setSport(found ?? null);
      const f = await fetchFacultiesList();
      setFaculties((f || []).map((x: any) => ({ id: x.id, name: x.name })));
      if (sportId) {
        const rs = await fetchResultsBySport(sportId);
        setResults(rs || []);
      }
    })();
  }, [sportId]);

  const updatePosition = (index: number, upd: Partial<ResultPositionInput>) => {
    setPositions((p) => p.map((it, i) => i === index ? { ...it, ...upd } : it));
  };

  const addPlace = () => setPositions((p) => [...p, { place: p.length + 1, faculty_id: '' }]);
  const removePlace = (index: number) => setPositions((p) => p.filter((_, i) => i !== index).map((r, i) => ({ ...r, place: i + 1 })));

  const handleCreateEvent = async () => {
    if (!sportId) return;
    if (!eventName.trim()) { setError('Please provide event name'); return; }
    if (positions.some((p) => !p.faculty_id)) { setError('Please select faculty for every place'); return; }
    setLoading(true);
    setError(null);
    try {
      const payload: AdminResultInput = {
        sport_id: sportId,
        event: eventName.trim(),
        category: (sport?.category as AdminResultInput['category']) ?? 'Individual Sport',
        gender,
        event_date: eventDate || new Date().toISOString().slice(0, 10),
        event_time: (eventTime.length === 5 ? eventTime + ':00' : eventTime),
      };
      const created = await createResult(payload as any);
      const rid = created?.id;
      if (!rid) throw new Error('Missing created result id');
      await addResultPositions(rid, positions.map((p) => ({ place: p.place, faculty_id: p.faculty_id })));
      // If this is an overall-style event, apply points immediately
      const lname = (payload.event || '').toLowerCase();
      if (lname.includes('overall') || (payload.event ?? '').trim() === '') {
        try { await applyPointsForResult(rid); } catch (err) { console.error('applyPointsForResult error', err); }
      }
      // reload results
      const rs = await fetchResultsBySport(sportId);
      setResults(rs || []);
      // reset
      setEventName('');
      setPositions([{ place: 1, faculty_id: '' }, { place: 2, faculty_id: '' }, { place: 3, faculty_id: '' }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const viewPositions = async (rid: number) => {
    const rows = await fetchResultPositions(rid);
    return rows.map((r) => ({ place: r.place, faculty: Array.isArray(r.faculties) ? r.faculties[0]?.name : r.faculties?.name ?? 'Unknown' }));
  };

  return (
    <AdminLayout title={`Admin — Sport: ${sport?.name ?? sportId}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — Sport: {sport?.name ?? sportId}</h2>
          <div>
            <Button variant="ghost" onClick={() => navigate('/admin/sports')}>Back to sports</Button>
          </div>
        </div>

        <AdminCard className="mb-6">
          <Card className="bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Add Event / Result</CardTitle>
          </CardHeader>
          <CardContent>
            {sport?.category === 'Team Sport' ? (
              <div className="text-sm text-gray-400 mb-3">This is a team sport — use this page to add overall mens/womens results (enter event as 'Overall - Mens' or similar).</div>
            ) : (
              <div className="text-sm text-gray-400 mb-3">This is an individual/athletics/swimming sport — add event-level results and places here.</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300">Event name</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. 100m Sprint" />
              </div>
              <div>
                <label className="text-sm text-white">Gender</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                  <option value="Men's">Men's</option>
                  <option value="Women's">Women's</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Date</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Time</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2"><div className="text-sm font-medium">Places</div><div className="text-sm text-gray-400">Add/remove places</div></div>
              {positions.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <div className="w-12 text-gray-300">#{p.place}</div>
                  <select className="flex-1 bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={p.faculty_id} onChange={(e) => updatePosition(idx, { faculty_id: e.target.value })}>
                    <option value="">Select faculty</option>
                    {faculties.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
                  <Button variant="ghost" onClick={() => removePlace(idx)}>Remove</Button>
                </div>
              ))}
              <div className="mt-2">
                <Button variant="ghost" onClick={addPlace}>Add place</Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {error && <div className="text-sm text-red-400">{error}</div>}
              <Button variant="outline" onClick={handleCreateEvent} disabled={loading}>{loading ? 'Saving…' : 'Create event & places'}</Button>
            </div>
          </CardContent>
          </Card>
        </AdminCard>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Existing Results</h3>
          <div className="grid grid-cols-1 gap-3">
            {results.length === 0 && <div className="text-gray-400">No results yet.</div>}
            {results.map((r) => (
              <AdminCard key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.event ?? 'Overall'}</div>
                    <div className="text-sm text-gray-400">{r.event_date} • {r.event_time} • {r.gender}</div>
                  </div>
                  <div className="text-sm">
                    <Button variant="ghost" onClick={async () => {
                        const ps = await viewPositions(r.id);
                        alert(ps.map((p: any) => `#${p.place} — ${p.faculty}`).join('\n'));
                      }}>View places</Button>
                    <Button variant="destructive" onClick={async () => {
                      if (!confirm('Delete this result and reverse applied points (if any)?')) return;
                      try {
                        await deleteResult(r.id);
                        const rs = await fetchResultsBySport(sportId!);
                        setResults(rs || []);
                      } catch (err: any) {
                        console.error(err);
                        alert(err.message || 'Delete failed');
                      }
                    }}>Delete</Button>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
