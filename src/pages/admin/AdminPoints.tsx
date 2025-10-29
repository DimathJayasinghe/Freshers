import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { fetchSports, createResult, addResultPositions, fetchFacultiesList, fetchResultsBySport } from '@/lib/api';
import type { ResultPositionInput } from '@/data/adminData';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/AdminLayout';
import AdminCard from '@/components/AdminCard';

export default function AdminPoints() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<{ id: string; name: string; category: string; gender?: string }[]>([]);
  const [faculties, setFaculties] = useState<{ id: string; name: string; short_name?: string }[]>([]);
  const [sportId, setSportId] = useState('');
  const [eventChoice, setEventChoice] = useState<'overall' | 'new' | `result:${number}`>('overall');
  const [newEventName, setNewEventName] = useState('');
  const [gender, setGender] = useState<"Men's" | "Women's" | 'Mixed'>("Men's");
  const [positions, setPositions] = useState<ResultPositionInput[]>([{ place: 1, faculty_id: '' }, { place: 2, faculty_id: '' }, { place: 3, faculty_id: '' }]);
  const [events, setEvents] = useState<{ id: number; event: string | null; event_date: string; event_time: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { const [s, f] = await Promise.all([fetchSports(), fetchFacultiesList()]); setSports(s || []); setFaculties(f || []); })(); }, []);

  // When sportId changes, fetch existing results and set sensible defaults
  useEffect(() => {
    (async () => {
      if (!sportId) { setEvents([]); setEventChoice('overall'); setNewEventName(''); return; }
      const rs = await fetchResultsBySport(sportId);
      setEvents(rs || []);
      setEventChoice('overall');
      setNewEventName('');
      // set default gender based on sport definition
      const sp = sports.find((s) => s.id === sportId);
      if (sp) {
        if (sp.gender === 'Both') setGender("Men's");
        else if (sp.gender === 'Mens') setGender("Men's");
        else if (sp.gender === 'Womens') setGender("Women's");
      }
    })();
  }, [sportId, sports]);

  const addPlace = () => setPositions((p) => [...p, { place: p.length + 1, faculty_id: '' }]);
  const updatePosition = (index: number, upd: Partial<ResultPositionInput>) => setPositions((p) => p.map((it, i) => i === index ? { ...it, ...upd } : it));

  const handleCreateOverall = async () => {
    if (!sportId) { setError('Select a sport'); return; }
    if (positions.some((p) => !p.faculty_id)) { setError('Select faculty for all places'); return; }
    setLoading(true); setError(null);
    try {
      // if adding to existing result
      if (String(eventChoice).startsWith('result:')) {
        const id = Number(String(eventChoice).split(':')[1]);
        await addResultPositions(id, positions.map(p => ({ place: p.place, faculty_id: p.faculty_id })));
      } else {
        const sp = sports.find((s) => s.id === sportId);
        const category = sp?.category ?? 'Individual Sport';
        const evName = eventChoice === 'new' ? (newEventName || 'Event') : 'Overall';
        const created = await createResult({ sport_id: sportId, event: evName, category: category as any, gender, event_date: new Date().toISOString().slice(0,10), event_time: '09:00:00' } as any);
        const rid = created?.id;
        if (!rid) throw new Error('Failed to create result');
        await addResultPositions(rid, positions.map(p => ({ place: p.place, faculty_id: p.faculty_id })));
      }
      // reset
      setPositions([{ place: 1, faculty_id: '' }, { place: 2, faculty_id: '' }, { place: 3, faculty_id: '' }]);
      // refresh events
      if (sportId) {
        const rs = await fetchResultsBySport(sportId);
        setEvents(rs || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create overall');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Admin — Points System">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — Points System</h2>
          <Button variant="ghost" onClick={() => navigate('/admin')}>Back</Button>
        </div>

        <AdminCard className="mb-6">
          <Card className="bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Add ranks / overall results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">Select a sport and add an overall ranking (for team sports) or an overall event result (you can use the sport edit page for event-level results).</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white">Sport</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={sportId} onChange={(e) => setSportId(e.target.value)}>
                  <option value="">Select sport</option>
                  {sports.map((s) => <option key={s.id} value={s.id}>{s.name} • {s.category}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-white">Event</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={String(eventChoice)} onChange={(e) => setEventChoice(e.target.value as any)}>
                  <option value="overall">Overall</option>
                  {events.length > 0 && (
                    <optgroup label="Existing events">
                      {events.map((ev) => (<option key={ev.id} value={`result:${ev.id}`}>{(ev.event ?? 'Event') + ' • ' + ev.event_date}</option>))}
                    </optgroup>
                  )}
                  {(() => {
                    const sp = sports.find((s) => s.id === sportId);
                    if (!sp || sp.category !== 'Team Sport') return <option value="new">Create new event</option>;
                    return null;
                  })()}
                </select>
              </div>
            </div>

            {eventChoice === 'new' && (
              <div className="mt-3">
                <label className="text-sm text-white">New event name</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} placeholder="e.g. 100m Sprint" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm text-white">Gender</label>
                {(() => {
                  const sp = sports.find((s) => s.id === sportId);
                  const options: string[] = sp?.gender === 'Both' ? ["Men's","Women's"] : (sp?.gender === 'Mens' ? ["Men's"] : (sp?.gender === 'Womens' ? ["Women's"] : ["Men's","Women's"]));
                  return (
                    <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                      {options.map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  );
                })()}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2"><div className="text-sm font-medium">Places</div><div className="text-sm text-gray-400">Add/remove places</div></div>
              {positions.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <div className="w-12 text-white">#{p.place}</div>
                  <select className="flex-1 bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={p.faculty_id} onChange={(e) => updatePosition(idx, { faculty_id: e.target.value })}>
                    <option value="">Select faculty</option>
                    {faculties.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.short_name ?? f.id})</option>)}
                  </select>
                  <Button variant="ghost" onClick={() => setPositions(pos => pos.filter((_, i) => i !== idx).map((r, i) => ({ ...r, place: i+1 })))}>Remove</Button>
                </div>
              ))}
              <div className="mt-2"><Button variant="ghost" onClick={addPlace}>Add place</Button></div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {error && <div className="text-sm text-red-400">{error}</div>}
              <Button variant="outline" onClick={handleCreateOverall} disabled={loading}>{loading ? 'Saving…' : 'Create overall result'}</Button>
              <Button variant="ghost" onClick={() => navigate('/admin/sports')}>Open Sports Editor</Button>
            </div>
          </CardContent>
          </Card>
        </AdminCard>

        <AdminCard>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Notes / usage</h3>
            <p className="text-sm text-gray-400">- For event-level results (per-event ranks) use the sport edit page which allows adding event rows with places.<br />- For team-only sports you can create an "Overall" result here and add places (mens/womens separately by selecting gender).</p>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
