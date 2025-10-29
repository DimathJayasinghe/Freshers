import { useEffect, useState, type ChangeEvent } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminCard from "@/components/AdminCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// use native select element (no Select component in UI toolkit)
import { fetchSports, createSport, updateSport, deleteSport } from "@/lib/api";
import { Trash2, Edit, PlusSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';

type SportRow = { id: string; name: string; category: string; gender?: 'Mens' | 'Womens' | 'Both' };

export default function AdminSports() {
  const [sports, setSports] = useState<SportRow[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming'>('Team Sport');
  const [gender, setGender] = useState<'Mens' | 'Womens' | 'Both'>('Both');
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSports();
      setSports(data as unknown as SportRow[]);
    } catch (e) {
      console.error(e);
      setError('Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setId(''); setName(''); setCategory('Team Sport'); setGender('Both'); setEditing(null); setError(null); };

  const handleCreate = async () => {
    if (!id.trim() || !name.trim()) { setError('Please provide id and name'); return; }
    try {
      await createSport({ id: id.trim(), name: name.trim(), category, gender });
      await load();
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Create failed');
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!name.trim()) { setError('Please provide a name'); return; }
    try {
      await updateSport(editing, { name: name.trim(), category, gender });
      await load();
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  };

  const handleDelete = async (sportId: string) => {
    if (!confirm('Delete this sport? This cannot be undone.')) return;
    try {
      await deleteSport(sportId);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Delete failed');
    }
  };

  // startEdit previously handled inline editing; navigation now goes to a dedicated edit page
  const navigate = useNavigate();

  return (
    <AdminLayout title="Admin — Sports">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — Sports</h2>
        </div>

        <AdminCard className="mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">{editing ? 'Edit Sport' : 'Create Sport'}</h3>
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-300">ID (slug)</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={id} onChange={(e) => setId(e.target.value)} disabled={!!editing} placeholder="e.g. cricket" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Name</label>
                <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cricket" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Category</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={category} onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as any)}>
                  <option>Team Sport</option>
                  <option>Individual Sport</option>
                  <option>Athletics</option>
                  <option>Swimming</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Gender</label>
                <select className="w-full bg-transparent border border-white/20 rounded-md px-2 py-1 text-white" value={gender} onChange={(e: ChangeEvent<HTMLSelectElement>) => setGender(e.target.value as any)}>
                  <option value="Both">Both</option>
                  <option value="Mens">Mens</option>
                  <option value="Womens">Womens</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {error && <div className="text-sm text-red-400">{error}</div>}
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleUpdate}><Edit className="mr-2" /> Save changes</Button>
                  <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleCreate}><PlusSquare className="mr-2" /> Create sport</Button>
              )}
            </div>
          </div>
        </AdminCard>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Existing Sports</h3>
          <div className="grid grid-cols-1 gap-3">
            {loading ? (
              <div className="text-gray-400">Loading…</div>
            ) : (
              sports.map((s) => (
                <AdminCard key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center justify-between w-full">
                    <div>
                        <div className="text-white font-medium">{s.name}</div>
                        <div className="text-sm text-gray-400">{s.id} • {s.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate(`/admin/sports/${s.id}`)}><Edit /></Button>
                      <Button variant="destructive" onClick={() => handleDelete(s.id)}><Trash2 /></Button>
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
