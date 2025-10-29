import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Home, Settings, Users, Trophy, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function AdminHeader() {
  const navigate = useNavigate();

  return (
  <header className="w-full border-b border-red-500/30 bg-black/80 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logos/uoc-logo.png" alt="logo" className="h-10 w-10 object-contain" />
          <div>
            <div className="text-xs text-gray-400">Admin Console</div>
            <div className="text-lg font-bold text-white">Freshers' Meet — Admin</div>
          </div>
        </div>

        <nav className="hidden sm:flex items-center gap-2">
          <Link to="/admin" className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1 rounded-md">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/faculties" className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1 rounded-md">
            <Users className="w-4 h-4" />
            <span>Faculties</span>
          </Link>
          <Link to="/admin/sports" className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1 rounded-md">
            <Trophy className="w-4 h-4" />
            <span>Sports</span>
          </Link>
          <Link to="/admin/lineup" className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1 rounded-md">
            <Calendar className="w-4 h-4" />
            <span>Lineup</span>
          </Link>
          <Link to="/admin/settings" className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1 rounded-md">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Badge className="bg-red-600/20 text-red-400">Admin</Badge>
          <Button variant="ghost" onClick={() => navigate('/')}>Back to site</Button>
          <Button variant="outline" onClick={() => { /* stub logout */ navigate('/'); }}>
            <LogOut className="w-4 h-4" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
