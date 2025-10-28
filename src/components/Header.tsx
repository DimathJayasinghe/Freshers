import { Home, LineChart, Trophy, Target, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/lineup", icon: LineChart, label: "Lineup" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/results", icon: Target, label: "Results" },
  ];

  return (
    <header className="w-full bg-black border-b border-red-500/30 shadow-lg shadow-red-900/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-2 md:py-3">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-red-900/40"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-black border-r border-red-500/30"
            >
              <SheetHeader>
                <SheetTitle className="text-white text-left">
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 mt-6">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link key={path} to={path} onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive(path) ? "default" : "ghost"}
                      size="lg"
                      className={
                        isActive(path)
                          ? "w-full justify-start bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-3 shadow-lg shadow-red-900/50"
                          : "w-full justify-start text-gray-300 hover:text-white hover:bg-red-900/40 gap-3"
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavigationMenuItem key={path}>
                <Link to={path}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2 transition-all duration-300 h-9 flex flex-row items-center justify-center",
                      isActive(path)
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-900/50 border border-red-500/50"
                        : "text-gray-300 hover:text-white hover:bg-red-900/40 hover:scale-105 bg-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive(path) ? "text-white" : "text-gray-300"
                    )} />
                    <span>{label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side - Event info */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center justify-center gap-2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-black px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-xl shadow-yellow-500/40">
            <Trophy className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="text-[10px] md:text-xs text-gray-400 font-semibold tracking-wider uppercase">
              University of Colombo
            </div>
            <div className="text-xs md:text-base font-bold bg-gradient-to-r from-red-400 via-red-300 to-yellow-400 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Freshers' Meet 2025</span>
              <span className="sm:hidden">Freshers' 2025</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
