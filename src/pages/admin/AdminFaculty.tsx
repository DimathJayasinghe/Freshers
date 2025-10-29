import { useEffect, useState, type ChangeEvent } from "react";
import AdminCard from "@/components/AdminCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchFacultiesOverview, createFaculty, deleteFaculty } from "@/lib/api";
import { PlusSquare, Edit, Trash2 } from "lucide-react";

type FacultyRow = { id: string; name: string; shortName?: string; logo?: string; colors?: { primary: string; secondary: string }; totalPoints?: number };

import AdminLayout from "@/components/AdminLayout";

export default function AdminFaculty() {
  const [faculties, setFaculties] = useState<FacultyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1f2937");
  const [secondaryColor, setSecondaryColor] = useState("#111827");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFacultiesOverview();
      setFaculties(data as unknown as FacultyRow[]);
    } catch (e) {
      console.error(e);
      setError('Failed to load faculties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setId(''); setName(''); setShortName(''); setPrimaryColor('#1f2937'); setSecondaryColor('#111827'); setLogoFile(null); setLogoPreview(null); setEditing(null); setError(null);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setLogoFile(f);
    if (f) setLogoPreview(URL.createObjectURL(f)); else setLogoPreview(null);
  };

  const handleCreate = async () => {
    if (!id.trim() || !name.trim() || !shortName.trim()) { setError('Please provide id, name and short code'); return; }
    try {
      await createFaculty({ id: id.trim(), name: name.trim(), short_name: shortName.trim(), primary_color: primaryColor, secondary_color: secondaryColor, logoFile });
      await load();
      resetForm();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Create failed');
    }
  };

  const handleDelete = async (facId: string) => {
    if (!confirm('Delete this faculty? This cannot be undone.')) return;
    try {
      await deleteFaculty(facId);
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Delete failed');
    }
  };

  const startEdit = (f: FacultyRow) => {
    setEditing(f.id);
    setId(f.id); setName(f.name); setShortName(f.shortName ?? '');
    setPrimaryColor(f.colors?.primary ?? '#1f2937'); setSecondaryColor(f.colors?.secondary ?? '#111827');
    setLogoPreview(f.logo ?? null);
    setError(null);
  };

  return (
    <AdminLayout title="Admin — Faculties">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — Faculties</h2>
        </div>

        <AdminCard className="mb-6">
          <div className="mb-2 text-lg font-semibold text-white">{editing ? 'Edit Faculty (partial)' : 'Create Faculty'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-gray-300">ID (slug)</label>
                  <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={id} onChange={(e) => setId(e.target.value)} disabled={!!editing} placeholder="e.g. foa" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Name</label>
                  <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Faculty of Arts" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Short code</label>
                  <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. FOA" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm text-gray-300">Primary color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
                    <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300">Secondary color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
                    <Input className="text-white placeholder:text-white/60 bg-transparent border border-white/20" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-sm text-gray-300 block mb-2">Logo (optional)</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="text-white bg-gray-800 border border-white/20 rounded px-2 py-1" />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="preview" className="w-24 h-24 object-contain rounded-md border border-white/20" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {error && <div className="text-sm text-red-400">{error}</div>}
            {!editing ? (
              <Button variant="outline" onClick={handleCreate}><PlusSquare className="mr-2" /> Create faculty</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { /* TODO: implement update */ }}><Edit className="mr-2" /> Save changes</Button>
                <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              </>
            )}
          </div>
        </AdminCard>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Existing Faculties</h3>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="text-gray-400">Loading…</div>
              ) : (
                faculties.map((f) => (
                  <AdminCard key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
                          {f.logo ? <img src={f.logo} alt={f.name} className="w-full h-full object-contain" /> : <div className="text-gray-400">No</div>}
                        </div>
                        <div>
                          <div className="text-white font-medium">{f.name}</div>
                          <div className="text-sm text-gray-400">{f.id} • {f.shortName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => startEdit(f)}><Edit /></Button>
                        <Button variant="destructive" onClick={() => handleDelete(f.id)}><Trash2 /></Button>
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
