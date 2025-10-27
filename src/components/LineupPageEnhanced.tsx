import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Filter,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface SportEvent {
  sport: string;
  date: string;
  time: string;
  venue: string;
  category?: string;
}

const sportsSchedule: SportEvent[] = [
  {
    sport: "Athletics",
    date: "21st of November (Friday)",
    time: "8.00 am - 12.00 Noon",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Athletics",
    date: "22nd of November (Saturday)",
    time: "8.00 am - 12.00 Noon",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Carrom",
    date: "22nd of November (Saturday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Scrabble",
    date: "22nd of November (Saturday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Wrestling",
    date: "23rd of November (Sunday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M",
  },
  {
    sport: "Swimming",
    date: "23rd of November (Sunday)",
    time: "8.00 am Onwards",
    venue: "Thurstan Pool",
    category: "M & W",
  },
  {
    sport: "Netball",
    date: "24th of November (Monday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "W",
  },
  {
    sport: "Boxing",
    date: "24th of November (Monday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M",
  },
  {
    sport: "Tennis",
    date: "25th of November (Tuesday)",
    time: "8.00 am Onwards",
    venue: "UOC Tennis Court",
    category: "M & W",
  },
  {
    sport: "Basketball",
    date: "25th of November (Tuesday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Table Tennis",
    date: "26th of November (Wednesday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Baseball",
    date: "26th of November (Wednesday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M",
  },
  {
    sport: "Elle",
    date: "27th of November (Thursday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Indoor Rowing",
    date: "27th of November (Thursday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Weightlifting",
    date: "28th of November (Friday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Beach Volleyball",
    date: "28th of November (Friday)",
    time: "7.30 am Onwards",
    venue: "NYSC Training Centre, Heyiathuduwa",
    category: "M",
  },
  {
    sport: "Beach Volleyball",
    date: "29th of November (Saturday)",
    time: "7.30 am Onwards",
    venue: "NYSC Training Centre, Heyiathuduwa",
    category: "W",
  },
  {
    sport: "Football",
    date: "29th of November (Saturday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Chess",
    date: "29th of November (Saturday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Taekwondo",
    date: "30th of November (Sunday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Road Race",
    date: "30th of November (Sunday)",
    time: "5.30 am Onwards",
    venue: "University Ground Premises",
    category: "M",
  },
  {
    sport: "Hockey",
    date: "01st of December (Monday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Karate",
    date: "01st of December (Monday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Kabaddi",
    date: "02nd of December (Tuesday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Cricket",
    date: "02nd of December (Tuesday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Rugby",
    date: "03rd of December (Wednesday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
  {
    sport: "Volleyball",
    date: "03rd of December (Wednesday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Badminton",
    date: "04th of December (Thursday)",
    time: "8.00 am Onwards",
    venue: "Indoor Gymnasium",
    category: "M & W",
  },
  {
    sport: "Cricket (Extra day)",
    date: "05th of December (Friday)",
    time: "8.00 am Onwards",
    venue: "University Ground",
    category: "M & W",
  },
];

export function LineupPageEnhanced() {
  const [selectedVenue, setSelectedVenue] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const venues = [
    ...new Set(sportsSchedule.map((event) => event.venue)),
  ];

  const filteredSchedule = sportsSchedule.filter((event) => {
    const matchesVenue =
      selectedVenue === "all" || event.venue === selectedVenue;
    const matchesCategory =
      selectedCategory === "all" ||
      event.category?.includes(selectedCategory);
    const matchesSearch =
      event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesVenue && matchesCategory && matchesSearch;
  });

  const getSportIcon = (sport: string) => {
    const sportName = sport.toLowerCase();
    if (sportName.includes("cricket")) return "🏏";
    if (sportName.includes("basketball")) return "🏀";
    if (sportName.includes("football")) return "⚽";
    if (sportName.includes("volleyball")) return "🏐";
    if (sportName.includes("swimming")) return "🏊";
    if (sportName.includes("athletics")) return "🏃";
    if (sportName.includes("tennis")) return "🎾";
    if (sportName.includes("badminton")) return "🏸";
    if (sportName.includes("boxing")) return "🥊";
    if (sportName.includes("wrestling")) return "🤼";
    if (sportName.includes("rugby")) return "🏉";
    if (sportName.includes("hockey")) return "🏑";
    if (sportName.includes("chess")) return "♟️";
    return "🏆";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-effect rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-gray-900 mb-2">Sports Event Schedule</h1>
          <p className="text-gray-600">
            Complete lineup of all sports events at UOC Freshers' Sports Meet 2025
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search sports or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80"
            />
          </div>

          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-[220px] bg-white/80">
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue} value={venue}>
                  {venue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white/80">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="M">Men</SelectItem>
              <SelectItem value="W">Women</SelectItem>
              <SelectItem value="M & W">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            {filteredSchedule.length} Events
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            {venues.length} Venues
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            Nov 21 - Dec 5
          </Badge>
        </div>
      </div>

      {/* Schedule Table */}
      <Card className="glass-card border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Complete Event Schedule
          </CardTitle>
          <CardDescription>
            All sports events with dates, times, and venues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedule.map((event, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-center text-2xl">
                      {getSportIcon(event.sport)}
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-900">{event.sport}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {event.date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {event.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {event.venue}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          event.category === "M & W"
                            ? "bg-purple-100 text-purple-900 border-purple-300"
                            : event.category === "M"
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "bg-pink-100 text-pink-900 border-pink-300"
                        }
                      >
                        {event.category}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSchedule.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No events found matching your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closing Ceremony Card */}
      <Card className="glass-card border-white/30 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Closing Ceremony
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Date</p>
                <p className="text-gray-900">09th of December (Tuesday)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Time</p>
                <p className="text-gray-900">From 3.00 p.m.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Venue</p>
                <p className="text-gray-900">NAT - UOC</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
