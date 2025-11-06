import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import AdminLayout from '@/components/AdminLayout';
import { fetchScheduledEvents, createScheduledEvent, updateScheduledEvent, deleteScheduledEvent, fetchSports } from '@/lib/api';

type SportOption = { id: string; name: string; category: string; gender?: string };

const ConfigLineupPage: React.FC = () => {
  const [sports, setSports] = useState<SportOption[]>([]);
  const [schedule, setSchedule] = useState<Array<{ id: number; event_date: string; sport_id: string | null; sport_label: string | null; time_range: string | null; start_time: string | null; end_time: string | null; venue: string }>>([]);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [newSched, setNewSched] = useState<{ event_date: string; sport_id: string | null; sport_label: string | null; start_time: string | null; end_time: string | null; venue: string }>({ event_date: '', sport_id: null, sport_label: null, start_time: null, end_time: null, venue: '' });
  const [editingSchedId, setEditingSchedId] = useState<number | null>(null);
  const [editingSched, setEditingSched] = useState<{ event_date?: string; sport_label?: string | null; start_time?: string | null; end_time?: string | null; venue?: string }>({});

  useEffect(() => {
    fetchSports().then((sp: any) => setSports(sp)).catch((e) => console.error('Failed to load sports', e));
  }, []);

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
      <AdminLayout title="Configure Lineup">
        <div className="max-w-6xl mx-auto mt-2 mb-10 px-4">
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Configure lineup (upcoming schedule)</h3>
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
              <div className="md:col-span-3">
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
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500">Start time</label>
                        <input type="time" defaultValue={item.start_time ? item.start_time.slice(0,5) : ''} onChange={e=>setEditingSched(s=>({...s, start_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500">End time</label>
                        <input type="time" defaultValue={item.end_time ? item.end_time.slice(0,5) : ''} onChange={e=>setEditingSched(s=>({...s, end_time: e.target.value || null}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                      </div>
                      <div className="md:col-span-3">
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
      </AdminLayout>
    </div>
  );
};

export default ConfigLineupPage;
