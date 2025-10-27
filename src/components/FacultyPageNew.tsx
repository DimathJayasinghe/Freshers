"use client";
import type { MouseEvent } from "react";
import { useState } from "react";
import {
  Trophy,
  Medal,
  Users,
  Award,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";

export interface FacultyScore {
  id: number;
  name: string;
  shortName: string;
  color: string;
  coverPhoto?: string;
  totalPoints: number;
  gold: number;
  silver: number;
  bronze: number;
  rank: number;
  sports: {
    name: string;
    points: number;
    medals: { gold: number; silver: number; bronze: number };
  }[];
}

const facultyData: FacultyScore[] = [
  {
    id: 1,
    name: "Faculty of Engineering",
    shortName: "Engineering",
    color: "#2563EB",
    totalPoints: 245,
    gold: 12,
    silver: 8,
    bronze: 5,
    rank: 1,
    sports: [
      { name: "Cricket", points: 50, medals: { gold: 1, silver: 0, bronze: 0 } },
      { name: "Basketball", points: 45, medals: { gold: 1, silver: 0, bronze: 0 } },
      { name: "Swimming", points: 80, medals: { gold: 4, silver: 3, bronze: 2 } },
      { name: "Athletics", points: 70, medals: { gold: 6, silver: 5, bronze: 3 } },
    ],
  },
  {
    id: 2,
    name: "Faculty of Science",
    shortName: "Science",
    color: "#00B37E",
    totalPoints: 220,
    gold: 10,
    silver: 10,
    bronze: 8,
    rank: 2,
    sports: [
      { name: "Cricket", points: 40, medals: { gold: 0, silver: 1, bronze: 0 } },
      { name: "Basketball", points: 40, medals: { gold: 0, silver: 1, bronze: 0 } },
      { name: "Swimming", points: 70, medals: { gold: 3, silver: 4, bronze: 3 } },
      { name: "Athletics", points: 70, medals: { gold: 7, silver: 4, bronze: 5 } },
    ],
  },
  {
    id: 3,
    name: "Faculty of Medicine",
    shortName: "Medicine",
    color: "#FACC15",
    totalPoints: 195,
    gold: 8,
    silver: 12,
    bronze: 10,
    rank: 3,
    sports: [
      { name: "Cricket", points: 30, medals: { gold: 0, silver: 0, bronze: 1 } },
      { name: "Basketball", points: 35, medals: { gold: 0, silver: 0, bronze: 1 } },
      { name: "Swimming", points: 65, medals: { gold: 2, silver: 5, bronze: 4 } },
      { name: "Athletics", points: 65, medals: { gold: 6, silver: 7, bronze: 4 } },
    ],
  },
  {
    id: 4,
    name: "Faculty of Arts",
    shortName: "Arts",
    color: "#8b5cf6",
    totalPoints: 180,
    gold: 7,
    silver: 9,
    bronze: 12,
    rank: 4,
    sports: [
      { name: "Cricket", points: 25, medals: { gold: 0, silver: 0, bronze: 0 } },
      { name: "Basketball", points: 30, medals: { gold: 0, silver: 0, bronze: 0 } },
      { name: "Swimming", points: 60, medals: { gold: 3, silver: 4, bronze: 6 } },
      { name: "Athletics", points: 65, medals: { gold: 4, silver: 5, bronze: 6 } },
    ],
  },
  {
    id: 5,
    name: "Faculty of Management",
    shortName: "Management",
    color: "#ec4899",
    totalPoints: 165,
    gold: 6,
    silver: 8,
    bronze: 9,
    rank: 5,
    sports: [
      { name: "Cricket", points: 20, medals: { gold: 0, silver: 0, bronze: 0 } },
      { name: "Basketball", points: 25, medals: { gold: 0, silver: 0, bronze: 0 } },
      { name: "Swimming", points: 55, medals: { gold: 2, silver: 3, bronze: 4 } },
      { name: "Athletics", points: 65, medals: { gold: 4, silver: 5, bronze: 5 } },
    ],
  },
];

interface FacultyPageNewProps {
  onFacultyClick?: (facultyId: number) => void;
}

export function FacultyPageNew({ onFacultyClick }: FacultyPageNewProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");

  const filteredData =
    selectedFaculty === "all"
      ? facultyData
      : facultyData.filter((f) => f.id.toString() === selectedFaculty);

  const handleFacultyClick = (facultyId: number) => {
    if (onFacultyClick) {
      onFacultyClick(facultyId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-effect rounded-3xl p-8 border border-emerald-500/20 shadow-2xl bg-gradient-to-br from-slate-900/90 to-blue-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-white mb-2">Faculty Standings</h1>
            <p className="text-slate-300">
              Overall performance and rankings across all sports events
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-[200px] bg-slate-800/80 border-emerald-500/30 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Faculties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {facultyData.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id.toString()}>
                    {faculty.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-emerald-900/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Faculties</p>
                <p className="text-white">5</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-slate-900/90 to-blue-900/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Points</p>
                <p className="text-white">1005</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20 bg-gradient-to-br from-slate-900/90 to-yellow-900/50 hover:shadow-xl hover:shadow-yellow-500/20 transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Gold Medals</p>
                <p className="text-white">43</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Medal className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20 bg-gradient-to-br from-slate-900/90 to-purple-900/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Events</p>
                <p className="text-white">32</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((faculty, index) => (
          <Card
            key={faculty.id}
            className="glass-card border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer group"
            onClick={() => handleFacultyClick(faculty.id)}
          >
            {/* Cover Photo Area */}
            <div
              className="h-32 relative overflow-hidden"
              style={{
                background: faculty.coverPhoto
                  ? `url(${faculty.coverPhoto})`
                  : `linear-gradient(135deg, ${faculty.color}99 0%, ${faculty.color}66 100%)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              <div className="absolute top-4 right-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/20"
                  style={{ backgroundColor: faculty.color }}
                >
                  <span className="text-2xl font-bold">#{faculty.rank}</span>
                </div>
              </div>
            </div>

            <CardHeader className="relative -mt-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {faculty.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {faculty.shortName}
                  </CardDescription>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Total Points */}
              <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Total Points</span>
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-white">{faculty.totalPoints}</p>
              </div>

              {/* Medals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-lg p-3 text-center border border-yellow-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-yellow-500/30">
                    <Medal className="w-4 h-4 text-yellow-900" />
                  </div>
                  <p className="text-white">{faculty.gold}</p>
                  <p className="text-xs text-slate-400">Gold</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700/20 to-slate-600/20 rounded-lg p-3 text-center border border-slate-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-slate-500/30">
                    <Medal className="w-4 h-4 text-slate-700" />
                  </div>
                  <p className="text-white">{faculty.silver}</p>
                  <p className="text-xs text-slate-400">Silver</p>
                </div>
                <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-lg p-3 text-center border border-orange-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-orange-500/30">
                    <Medal className="w-4 h-4 text-orange-900" />
                  </div>
                  <p className="text-white">{faculty.bronze}</p>
                  <p className="text-xs text-slate-400">Bronze</p>
                </div>
              </div>

              {/* Sport Breakdown */}
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Sport Performance
                </p>
                <div className="space-y-2">
                  {faculty.sports.slice(0, 3).map((sport, sportIndex) => (
                    <div key={sportIndex}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{sport.name}</span>
                        <span className="text-xs text-emerald-400">{sport.points} pts</span>
                      </div>
                      <Progress value={(sport.points / 100) * 100} className="h-1.5 bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-none"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleFacultyClick(faculty.id);
                }}
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { facultyData };
