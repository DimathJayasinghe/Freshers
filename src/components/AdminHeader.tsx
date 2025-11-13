import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const p = location.pathname;
  const isAdminRoot = p === '/admin' || p === '/admin/';
  const isSports = p.startsWith('/admin/sports');
  const isResults = p.startsWith('/admin/results');
  const isLineup = p.startsWith('/admin/lineup');
  const isBugs = p.startsWith('/admin/bugs');
  const [open, setOpen] = useState(false);

  const baseLink = "flex items-center gap-2 px-3 py-1 rounded-md transition-colors";
  const idle = "text-gray-300 hover:text-white hover:bg-white/5";
  const active = "text-white bg-white/10 border border-white/20";

  return (
  <header className="w-full border-b border-red-500/30 bg-black/80 text-white sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logos/uoc-logo.png" alt="logo" className="h-10 w-10 object-contain" />
          <div>
            <div className="text-xs text-gray-400">UOC Freshers' 25</div>
            <div className="text-lg font-bold text-white">Admin Dashboard</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/admin" className={`${baseLink} ${isAdminRoot ? active : idle}`}>
            <span>Update Results</span>
          </Link>
          <Link to="/admin/sports" className={`${baseLink} ${isSports ? active : idle}`}>
            <span>Manage Sports</span>
          </Link>
          <Link to="/admin/results" className={`${baseLink} ${isResults ? active : idle}`}>
            <span>Edit Results</span>
          </Link>
          <Link to="/admin/lineup" className={`${baseLink} ${isLineup ? active : idle}`}>
            <Calendar className="w-4 h-4" />
            <span>Config Lineup</span>
          </Link>
          <Link to="/admin/bugs" className={`${baseLink} ${isBugs ? active : idle}`}>
            <span>Bug Reports</span>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-white/10 text-gray-200">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black border-r border-red-500/30">
              <SheetHeader>
                <SheetTitle className="text-white text-left">Admin Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4">
                <Link to="/admin" onClick={() => setOpen(false)} className={`${baseLink} ${isAdminRoot ? active : idle}`}>
                  <span>Update Results</span>
                </Link>
                <Link to="/admin/sports" onClick={() => setOpen(false)} className={`${baseLink} ${isSports ? active : idle}`}>
                  <span>Manage Sports</span>
                </Link>
                <Link to="/admin/results" onClick={() => setOpen(false)} className={`${baseLink} ${isResults ? active : idle}`}>
                  <span>Edit Results</span>
                </Link>
                <Link to="/admin/lineup" onClick={() => setOpen(false)} className={`${baseLink} ${isLineup ? active : idle}`}>
                  <span>Config Lineup</span>
                </Link>
                <Link to="/admin/bugs" onClick={() => setOpen(false)} className={`${baseLink} ${isBugs ? active : idle}`}>
                  <span>Bug Reports</span>
                </Link>
                <div className="h-px bg-white/10 my-2" />
                <button
                  className={`${baseLink} ${idle} text-left`}
                  onClick={() => { setOpen(false); navigate('/'); }}
                >
                  Back to site
                </button>
                <button
                  className={`${baseLink} ${idle} text-left`}
                  onClick={async () => { try { await supabase?.auth.signOut(); } catch {} setOpen(false); navigate('/admin/login'); }}
                >
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Badge className="bg-red-600/20 text-red-400">Admin</Badge>
          <Button variant="ghost" className="hover:bg-white/10" onClick={() => navigate('/')}>Back to site</Button>
          <Button
            variant="outline"
            className="border-red-500/40 hover:bg-red-500/10"
            onClick={async () => {
              try { await supabase?.auth.signOut(); } catch {}
              navigate('/admin/login');
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
