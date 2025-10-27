import { useState } from "react";
import {
  Trophy,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SportDetailsView } from "./SportDetailsView";

interface LiveMatch {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: "live" | "upcoming";
  time: string;
  venue: string;
  category: "men" | "women" | "mixed";
  sportId: string;
}

const liveMatches: LiveMatch[] = [
  {
    id: 1,
    sport: "Cricket",
    team1: "Faculty of Engineering",
    team2: "Faculty of Science",
    score1: 185,
    score2: 142,
    status: "live",
    time: "Live Now",
    venue: "Main Cricket Ground",
    category: "men",
    sportId: "cricket-men",
  },
  {
    id: 2,
    sport: "Basketball",
    team1: "Faculty of Medicine",
    team2: "Faculty of Arts",
    score1: 45,
    score2: 38,
    status: "live",
    time: "3rd Quarter",
    venue: "Indoor Stadium",
    category: "men",
    sportId: "basketball-men",
  },
];

interface TodayMatch {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  time: string;
  venue: string;
  round: string;
  category: "men" | "women" | "mixed";
  sportId: string;
}

const todaySchedule: TodayMatch[] = [
  {
    id: 1,
    sport: "Cricket",
    team1: "Faculty of Engineering",
    team2: "Faculty of Science",
    time: "9:00 AM",
    venue: "Main Cricket Ground",
    round: "Semi-Final",
    category: "men",
    sportId: "cricket-men",
  },
  {
    id: 2,
    sport: "Basketball",
    team1: "Faculty of Medicine",
    team2: "Faculty of Arts",
    time: "11:00 AM",
    venue: "Indoor Stadium Court 1",
    round: "Quarter-Final",
    category: "men",
    sportId: "basketball-men",
  },
  {
    id: 3,
    sport: "Football",
    team1: "Faculty of Management",
    team2: "Faculty of Engineering",
    time: "2:00 PM",
    venue: "Main Football Field",
    round: "Final",
    category: "men",
    sportId: "football-men",
  },
  {
    id: 4,
    sport: "Volleyball",
    team1: "Faculty of Science",
    team2: "Faculty of Medicine",
    time: "4:00 PM",
    venue: "Volleyball Court A",
    round: "Semi-Final",
    category: "women",
    sportId: "volleyball-women",
  },
];

export function HomePage() {
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [selectedScheduleMatch, setSelectedScheduleMatch] = useState<TodayMatch | null>(null);

  // Helper function to get sport icon
  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      "Cricket": "🏏",
      "Basketball": "🏀",
      "Football": "⚽",
      "Volleyball": "🏐",
    };
    return icons[sport] || "🏆";
  };

  // If a live match is selected, show the sport details view
  if (selectedMatch) {
    const sportData = {
      id: selectedMatch.sportId,
      name: selectedMatch.sport,
      category: selectedMatch.category,
      venue: selectedMatch.venue,
      totalMatches: 15,
      completed: 10,
      status: "ongoing" as const,
      icon: getSportIcon(selectedMatch.sport),
    };

    return (
      <SportDetailsView 
        sport={sportData} 
        onBack={() => setSelectedMatch(null)} 
      />
    );
  }

  // If a scheduled match is selected, show the sport details view
  if (selectedScheduleMatch) {
    const sportData = {
      id: selectedScheduleMatch.sportId,
      name: selectedScheduleMatch.sport,
      category: selectedScheduleMatch.category,
      venue: selectedScheduleMatch.venue,
      totalMatches: 15,
      completed: 8,
      status: "ongoing" as const,
      icon: getSportIcon(selectedScheduleMatch.sport),
    };

    return (
      <SportDetailsView 
        sport={sportData} 
        onBack={() => setSelectedScheduleMatch(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Live Scoreboard Section */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-white">
              Live Matches
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="glass-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group"
            >
              <div className="bg-gradient-to-r from-[var(--brand-dark)] to-[var(--brand-primary)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm">
                    {match.sport}
                  </p>
                  {match.status === "live" ? (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                      LIVE
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500 text-white">
                      Upcoming
                    </Badge>
                  )}
                </div>
                <p className="text-yellow-200 text-xs">
                  {match.venue}
                </p>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="font-mono px-3 py-1 bg-gray-100 rounded-lg flex items-center justify-center">
                        {match.status === "live" ? match.score1 : "-"}
                      </div>
                      <p className="text-[#f5f5f7] text-left">
                        {match.team1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-[#e6e6e6] text-xs">
                      VS
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="font-mono px-3 py-1 bg-gray-100 rounded-lg flex items-center justify-center">
                        {match.status === "live" ? match.score2 : "-"}
                      </div>
                      <p className="text-[#f5f5f7] text-left">
                        {match.team2}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--brand-accent)] font-medium">
                        {match.time}
                      </p>
                      <div className="flex items-center gap-2 text-[var(--brand-accent)] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4" />
                        <span>View Draw</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-[#e6e6e6] mt-4 animate-fade-in">
          💡 Click on any live match to view the tournament draw and bracket
        </p>
      </div>

      {/* Today's Draw / Schedule */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-[var(--brand-accent)]" />
          <h2 className="text-white">Today's Schedule</h2>
        </div>

        <div className="glass-effect rounded-2xl border border-white/30 shadow-xl overflow-hidden">
          <div className="divide-y divide-gray-200/50">
            {todaySchedule.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedScheduleMatch(match)}
                className="p-6 hover:bg-white/40 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Time & Sport */}
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--brand-accent)] text-black px-4 py-3 rounded-xl shadow-md min-w-[100px] text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-black" />
                      <p className="text-sm font-medium">{match.time}</p>
                    </div>
                    <div>
                      <Badge className="bg-yellow-100 text-[var(--brand-primary)] mb-2">
                        {match.sport}
                      </Badge>
                      <p className="text-xs text-[#f5f5f7]">{match.round}</p>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center justify-center gap-4">
                    <p className="text-[#f5f5f7] text-sm md:text-base text-right">
                      {match.team1}
                    </p>
                    <div className="text-gray-400 text-xs px-3 py-1 bg-gray-100 rounded-full">
                      VS
                    </div>
                    <p className="text-[#f5f5f7] text-sm md:text-base text-left">
                      {match.team2}
                    </p>
                  </div>

                  {/* Venue & View Draw Button */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#f5f5f7] text-sm">
                        <MapPin className="w-4 h-4 text-[#f5f5f7]" />
                        <span className="hidden md:inline">{match.venue}</span>
                      </div>
                    <div className="flex items-center gap-2 text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View Draw</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip removed as requested */}
      </div>
    </div>
  );
}