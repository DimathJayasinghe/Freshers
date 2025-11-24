import { Home, LineChart, Trophy, Target, Menu, Dumbbell, Users } from "lucide-react";
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
    { path: "/faculties", icon: Users, label: "Faculties" },
    { path: "/sports", icon: Dumbbell, label: "Sports" },
    { path: "/lineup", icon: LineChart, label: "Lineup" },
    { path: "/results", icon: Target, label: "Results" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <header className="w-full border-b border-red-500/30 shadow-lg shadow-red-900/20">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-2 lg:py-3">
        {/* Logo and Event info - Left Side */}
        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
          {/* UOC Logo */}
          <div className="flex items-center justify-center">
            <img 
              src="/logos/uoc-logo.png" 
              alt="University of Colombo" 
              className="h-10 w-10 lg:h-14 lg:w-14 object-contain"
            />
          </div>
          
          <div className="text-left">
            <div className="text-[10px] lg:text-xs text-gray-400 font-semibold tracking-wider uppercase">
              University of Colombo
            </div>
            <div className="text-xs lg:text-base font-bold bg-gradient-to-r from-red-400 via-red-300 to-yellow-400 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Freshers' Meet 2025</span>
              <span className="sm:hidden">Freshers' 2025</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Right Side */}
        <div className="lg:hidden flex-shrink-0">
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
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation Menu - Right Side */}
        <div className="hidden lg:block flex-shrink-0">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavigationMenuItem key={path}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2 transition-colors duration-200 h-9 flex flex-row items-center justify-center px-4 min-w-[100px]",
                      isActive(path)
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-900/50 border border-red-500/50"
                        : "text-gray-300 hover:text-white hover:bg-red-900/40 bg-transparent"
                    )}
                  >
                    <Link to={path} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{label}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
