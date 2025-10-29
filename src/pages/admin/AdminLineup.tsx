import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminCard from "@/components/AdminCard";
import { fetchScheduledEvents, createScheduledEvent, updateScheduledEvent, deleteScheduledEvent, fetchSports } from "@/lib/api";
import type { ScheduledEventRowFull } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLineup() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ScheduledEventRowFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);

  // form state
  const [id, setId] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState<string>('');
  const [sportId, setSportId] = useState<string>('');
  const [sportLabel, setSportLabel] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [evs, sps] = await Promise.all([fetchScheduledEvents(), fetchSports()]);
      setEvents(evs || []);
      setSports((sps || []) as { id: string; name: string }[]);
    } catch (e) {
      console.error(e);
      setError('Failed to load lineup or sports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setId(null);
    setEventDate(''); setSportId(''); setSportLabel(''); setTimeRange(''); setStartTime(''); setEndTime(''); setVenue(''); setError(null);
  };

  const startEdit = (e: ScheduledEventRowFull) => {
    setId(e.id);
    setEventDate(e.event_date);
    setSportId(e.sport_id ?? '');
    setSportLabel(e.sport_label ?? '');
    setTimeRange(e.time_range ?? '');
    setStartTime(e.start_time ?? '');
    setEndTime(e.end_time ?? '');
    setVenue(e.venue ?? '');
    setError(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!eventDate || !venue) { setError('Please set a date and venue'); return; }
    try {
      if (id) {
        await updateScheduledEvent(id, { event_date: eventDate, sport_id: sportId || null, sport_label: sportLabel || null, time_range: timeRange || null, start_time: startTime || null, end_time: endTime || null, venue });
      } else {
        await createScheduledEvent({ event_date: eventDate, sport_id: sportId || null, sport_label: sportLabel || null, time_range: timeRange || null, start_time: startTime || null, end_time: endTime || null, venue });
      }
      await load();
      resetForm();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Save failed');
    }
  };

  const handleDelete = async (evId: number) => {
    if (!confirm('Delete this scheduled event?')) return;
    try {
      await deleteScheduledEvent(evId);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Delete failed');
    }
  };

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  }

  return (
    <AdminLayout title="Admin — Lineup">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — Lineup</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>Back</Button>
            <Button variant="outline" onClick={() => { resetForm(); }}>New</Button>
          </div>
        </div>

            <AdminCard className="mb-6">
              <div className="mb-2 text-lg font-semibold text-white">{id ? 'Edit Event' : 'Create Event'}</div>
              <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-300">Date</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Sport</label>
                    <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={sportId} onChange={(e) => setSportId(e.target.value)}>
                    <option value="">-- select sport --</option>
                    {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Sport label (optional)</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={sportLabel} onChange={(e) => setSportLabel(e.target.value)} placeholder="e.g. Athletics (Track & Field)" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="text-sm text-gray-300">Time range</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} placeholder="e.g. 8:00 AM - 12:00 PM" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Start time</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">End time</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Venue</label>
                      <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Main Grounds" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {error && <div className="text-sm text-red-400">{error}</div>}
                <Button variant="outline" onClick={handleCreateOrUpdate}>{id ? 'Save changes' : 'Create event'}</Button>
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
              </div>
            </AdminCard>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Scheduled Events</h3>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="text-gray-400">Loading…</div>
              ) : (
                events.map((ev) => (
                  <AdminCard key={ev.id} className="flex items-center justify-between">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-300 w-40">{formatDate(ev.event_date)}</div>
                        <div className="flex items-center gap-3">
                          <div className="text-white font-medium">
                            {ev.sport_id ? (
                              <Link to={`/sport/${ev.sport_id}`} className="underline">{(sports.find(s => s.id === ev.sport_id)?.name) ?? ev.sport_id}</Link>
                            ) : (
                              <span className="text-gray-300">{ev.sport_label ?? 'Event'}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{ev.time_range ?? `${ev.start_time ?? ''}${ev.start_time && ev.end_time ? ' - ' + ev.end_time : ''}`}</div>
                          <div className="text-sm text-gray-400">• {ev.venue}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => startEdit(ev)}>Edit</Button>
                        <Button variant="destructive" onClick={() => handleDelete(ev.id)}>Delete</Button>
                      </div>
                    </div>
                  </AdminCard>
                ))
              )}
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
