import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminCard from "@/components/AdminCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Settings, Image } from "lucide-react";
import { fetchSports } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSports()
      .then((data) => { if (mounted && data) setSports(data); })
      .catch((e) => console.error('[AdminDashboard] fetchSports error', e))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <AdminLayout title="Admin Dashboard">
        <div className="text-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/')} variant="ghost">Back to site</Button>
              <Badge className="bg-red-600/20 text-red-400">Admin</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <AdminCard>
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-white" />
                  <div className="text-white font-medium">Manage Sports</div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-4">Configure sport types and categories.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/sports')}>Open</Button>
                </div>
              </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-white" />
                <div className="text-white font-medium">Manage Faculties</div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Configure participating teams and details.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/faculties')}>Open</Button>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-white" />
                <div className="text-white font-medium">Manage Lineup</div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Schedule daily matches and update times.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/lineup')}>Open</Button>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-white" />
                <div className="text-white font-medium">Points System</div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Adjust scoring rules and weights.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/points')}>Open</Button>
              </div>
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <AdminCard>
              <div className="flex items-center gap-3 mb-2"><Image className="w-5 h-5" /><div className="text-white font-medium">Media Management</div></div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Upload banners, covers and promotional assets.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/media')}>Open</Button>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2"><Settings className="w-5 h-5" /><div className="text-white font-medium">System Settings</div></div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Global configuration and feature toggles.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')}>Open</Button>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="flex items-center gap-3 mb-2"><Image className="w-5 h-5" /><div className="text-white font-medium">Media Library</div></div>
              <div>
                <p className="text-sm text-gray-400 mb-4">Browse uploaded assets.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/media-library')}>Open</Button>
              </div>
            </AdminCard>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Individual Sports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <AdminCard key={`sk-${i}`} className="animate-pulse"><div className="h-24" /></AdminCard>
                ))
              ) : (
                sports.map((s) => (
                  <AdminCard key={s.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-white font-medium">{s.name}</div>
                        <Badge className="bg-white/5 text-white text-xs">{s.category}</Badge>
                      </div>
                      <div className="text-sm text-gray-400">Max: {s.maxTeams ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-3">Venue: {s.venue ?? 'TBD'}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Manage {s.name}</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </AdminCard>
                ))
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default AdminDashboard;
