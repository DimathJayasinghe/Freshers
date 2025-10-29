import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Users, Calendar, Settings, Image, Lock, LogIn, LogOut } from "lucide-react";
import { fetchSports } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin login state (simple local mock)
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSports()
      .then((data) => { if (mounted && data) setSports(data); })
      .catch((e) => console.error('[AdminDashboard] fetchSports error', e))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleLogin = () => {
    // simple mock credentials — replace with real auth
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setLoginError(null);
      setPassword('');
      setIsOpen(false);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/')} variant="ghost">Back to site</Button>
              <Badge className="bg-red-600/20 text-red-400">Admin</Badge>
            </div>
          </div>

          {/* Top configuration cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-white" />
                  <CardTitle className="text-white">Manage Sports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Configure sport types and categories.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white" />
                  <CardTitle className="text-white">Manage Faculties</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Configure participating teams and details.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-white" />
                  <CardTitle className="text-white">Manage Lineup</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Schedule daily matches and update times.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-white" />
                  <CardTitle className="text-white">Points System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Adjust scoring rules and weights.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>
          </div>

          {/* Media and other management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3"><Image className="w-5 h-5" /><CardTitle className="text-white">Media Management</CardTitle></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Upload banners, covers and promotional assets.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3"><Settings className="w-5 h-5" /><CardTitle className="text-white">System Settings</CardTitle></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Global configuration and feature toggles.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3"><Image className="w-5 h-5" /><CardTitle className="text-white">Media Library</CardTitle></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">Browse uploaded assets.</p>
                <Button size="sm">Open</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sports management grid */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Individual Sports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={`sk-${i}`} className="animate-pulse" />
                ))
              ) : (
                sports.map((s) => (
                  <Card key={s.id} className="bg-gradient-to-br from-gray-900 to-black border-white/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-white">{s.name}</CardTitle>
                          <Badge className="bg-white/5 text-white text-xs">{s.category}</Badge>
                        </div>
                        <div className="text-sm text-gray-400">Max: {s.maxTeams ?? '-'}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-400 mb-3">Venue: {s.venue ?? 'TBD'}</div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">Manage {s.name}</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom-anchored Admin Login Panel */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        {!isAdmin ? (
          <div className="bg-black/80 border border-white/10 rounded-lg p-4 w-96 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                <div className="text-white font-semibold">Admin Login</div>
              </div>
              <Button size="sm" onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Close' : 'Open'}</Button>
            </div>

            {isOpen && (
              <div className="space-y-3">
                <Input placeholder="Username" value={username} onChange={(e) => setUsername((e.target as HTMLInputElement).value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
                {loginError && <div className="text-sm text-red-400">{loginError}</div>}
                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" onClick={handleLogin}><LogIn className="w-4 h-4 mr-2" />Login</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-black/80 border border-white/10 rounded-lg p-4 w-80 backdrop-blur-md shadow-lg flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-300">Signed in as</div>
              <div className="text-white font-semibold">{username || 'admin'}</div>
            </div>
            <div className="ml-auto">
              <Button size="sm" variant="outline" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
