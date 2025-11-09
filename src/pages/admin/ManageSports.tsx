import React, { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import AdminLayout from '@/components/AdminLayout';
import { fetchSports, createSport, updateSport, deleteSport, isCurrentUserAdmin, deleteSportWithCascade } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

type Sport = {
  id: string;
  name: string;
  category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
  gender?: 'Mens' | 'Womens' | 'Both';
};

const defaultNew: Sport = { id: '', name: '', category: 'Team Sport', gender: 'Both' };

const ManageSportsPage: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSport, setNewSport] = useState<Sport>(defaultNew);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Sport>>({});
  const [whoami, setWhoami] = useState<{ email: string | null; admin: boolean }>({ email: null, admin: false });

  useEffect(() => {
    setLoading(true);
    fetchSports()
      .then((s: any) => setSports(s))
      .catch((e) => setError(e?.message || 'Failed to load sports'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: user } = await supabase!.auth.getUser();
        const admin = await isCurrentUserAdmin();
        setWhoami({ email: user.user?.email ?? null, admin });
      } catch {
        setWhoami({ email: null, admin: false });
      }
    })();
  }, []);

  const idExists = useMemo(() => new Set(sports.map(s => s.id)), [sports]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newSport.id.trim() || !newSport.name.trim()) { setError('ID and Name are required'); return; }
    if (idExists.has(newSport.id)) { setError('A sport with this ID already exists'); return; }
    try {
      setSaving(true);
      await createSport({ id: newSport.id.trim(), name: newSport.name.trim(), category: newSport.category, gender: newSport.gender ?? 'Both' });
      const updated = await fetchSports();
      setSports(updated as any);
      setNewSport(defaultNew);
    } catch (e: any) {
      console.error('[ManageSports] create error', e);
      const msg: string = e?.message || 'Failed to create sport';
      if (/row[- ]level security|RLS/i.test(msg)) {
        setError('Permission denied by database policies. Ensure your admin user has INSERT permissions on sports via Supabase RLS policies.');
      } else if (/foreign key|violates foreign key constraint/i.test(msg)) {
        setError('Cannot create due to foreign key constraints. Check related tables and constraints.');
      } else {
        setError(msg);
      }
    } finally { setSaving(false); }
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    try {
      setSaving(true);
      await updateSport(id, {
        name: editDraft.name?.trim() || undefined,
        category: (editDraft.category as Sport['category']) || undefined,
        gender: (editDraft.gender as Sport['gender']) || undefined,
      });
      const updated = await fetchSports();
      setSports(updated as any);
      setEditingId(null);
      setEditDraft({});
    } catch (e: any) {
      console.error('[ManageSports] update error', e);
      const msg: string = e?.message || 'Failed to update sport';
      if (/row[- ]level security|RLS/i.test(msg)) {
        setError('Permission denied by database policies. Ensure your admin user has UPDATE permissions on sports via Supabase RLS policies.');
      } else if (/foreign key|violates foreign key constraint/i.test(msg)) {
        setError('Cannot update due to foreign key constraints. Check related tables and constraints.');
      } else {
        setError(msg);
      }
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this sport? This cannot be undone.')) return;
    setError(null);
    try {
      await deleteSport(id);
      setSports(sports.filter(s => s.id !== id));
    } catch (e: any) {
      console.error('[ManageSports] delete error', e);
      const msg: string = e?.message || 'Failed to delete sport';
      if (/row[- ]level security|RLS/i.test(msg)) {
        setError('Permission denied by database policies. Ensure your admin user has DELETE permissions on sports via Supabase RLS policies.');
      } else if (/foreign key|violates foreign key constraint/i.test(msg)) {
        setError('Cannot delete this sport because it is referenced by other records (e.g., results, schedule). You can use "Force delete all data" to remove linked data first.');
      } else {
        setError(msg);
      }
    }
  }

  async function handleForceDelete(id: string) {
    if (!confirm('Force delete ALL data linked to this sport (schedule, live series, results, faculty links) and the sport itself? This is destructive and cannot be undone.')) return;
    setError(null);
    try {
      setSaving(true);
      await deleteSportWithCascade(id);
      setSports(sports.filter(s => s.id !== id));
    } catch (e: any) {
      console.error('[ManageSports] force delete error', e);
      const msg: string = e?.message || 'Force delete failed';
      setError(msg);
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader />
      <AdminLayout title="Manage Sports">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs text-gray-500 mb-2">Signed in as: {whoami.email ?? '—'} • Admin verified: {whoami.admin ? 'Yes' : 'No'}</div>
          <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Add a sport</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-gray-500">ID (slug)</label>
                <input value={newSport.id} onChange={e=>setNewSport(s=>({...s, id: e.target.value}))} placeholder="e.g., football" className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs text-gray-500">Name</label>
                <input value={newSport.name} onChange={e=>setNewSport(s=>({...s, name: e.target.value}))} placeholder="Football" className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs text-gray-500">Category</label>
                <select value={newSport.category} onChange={e=>setNewSport(s=>({...s, category: e.target.value as Sport['category']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                  <option>Team Sport</option>
                  <option>Individual Sport</option>
                  <option>Athletics</option>
                  <option>Swimming</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500">Gender</label>
                <select value={newSport.gender ?? 'Both'} onChange={e=>setNewSport(s=>({...s, gender: e.target.value as Sport['gender']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                  <option>Both</option>
                  <option>Mens</option>
                  <option>Womens</option>
                </select>
              </div>
              <div className="md:col-span-12 flex items-end justify-end">
                <button disabled={saving} className={`px-3 py-1.5 rounded-md ${saving ? 'bg-red-900/50 cursor-wait' : 'bg-red-600 hover:bg-red-500'}`}>{saving ? 'Saving…' : 'Add'}</button>
              </div>
            </form>
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

            <h3 className="font-semibold mt-4 mb-2">All sports</h3>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading…</div>
            ) : (
              <div className="space-y-2">
                {sports.map(s => (
                  <div key={s.id} className="border border-zinc-800 rounded-lg p-3 bg-black/40">
                    {editingId === s.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-500">Name</label>
                          <input defaultValue={s.name} onChange={e=>setEditDraft(d=>({...d, name: e.target.value}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm" />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-500">Category</label>
                          <select defaultValue={s.category} onChange={e=>setEditDraft(d=>({...d, category: e.target.value as Sport['category']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                            <option>Team Sport</option>
                            <option>Individual Sport</option>
                            <option>Athletics</option>
                            <option>Swimming</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500">Gender</label>
                          <select defaultValue={s.gender ?? 'Both'} onChange={e=>setEditDraft(d=>({...d, gender: e.target.value as Sport['gender']}))} className="w-full bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                            <option>Both</option>
                            <option>Mens</option>
                            <option>Womens</option>
                          </select>
                        </div>
                        <div className="md:col-span-12 flex justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingId(null); setEditDraft({}); }}>Cancel</button>
                          <button className="px-3 py-1.5 rounded-md bg-green-700 hover:bg-green-600" onClick={()=>handleSaveEdit(s.id)}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-300">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.id} • {s.category} • {s.gender ?? 'Both'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700" onClick={()=>{ setEditingId(s.id); setEditDraft({}); }}>Edit</button>
                          <button className="px-3 py-1.5 rounded-md border border-red-700 bg-red-900/30 text-red-300 hover:bg-red-800/40" onClick={()=>handleDelete(s.id)}>Delete</button>
                          <button className="px-3 py-1.5 rounded-md border border-red-700/60 bg-red-950/50 text-red-300 hover:bg-red-900/60" onClick={()=>handleForceDelete(s.id)} title="Delete all linked data and the sport">Force delete all data</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default ManageSportsPage;
