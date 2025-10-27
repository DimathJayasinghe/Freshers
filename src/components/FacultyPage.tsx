"use client";
import { useState } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  Users,
  Award,
  ChevronDown,
  Filter,
  Calendar,
  Target,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FacultyScore {
  id: number;
  name: string;
  shortName: string;
  color: string;
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
    color: "#3b82f6",
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
    color: "#10b981",
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
    color: "#f59e0b",
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

const chartData = facultyData.map((faculty) => ({
  name: faculty.shortName,
  points: faculty.totalPoints,
  gold: faculty.gold,
  silver: faculty.silver,
  bronze: faculty.bronze,
}));

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function FacultyPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [viewType, setViewType] = useState<"table" | "cards">("cards");

  const filteredData =
    selectedFaculty === "all"
      ? facultyData
      : facultyData.filter((f) => f.id.toString() === selectedFaculty);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-effect rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-gray-900 mb-2">Faculty Standings</h1>
            <p className="text-gray-600">
              Overall performance and rankings across all sports events
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-[200px] bg-white/80">
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

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-[180px] bg-white/80">
                <Trophy className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="athletics">Athletics</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 bg-white/80 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewType === "cards" ? "default" : "ghost"}
                onClick={() => setViewType("cards")}
              >
                Cards
              </Button>
              <Button
                size="sm"
                variant={viewType === "table" ? "default" : "ghost"}
                onClick={() => setViewType("table")}
              >
                Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Points Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
            <CardDescription>Total points earned by each faculty</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="points" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle>Points Share</CardTitle>
            <CardDescription>Percentage distribution of total points</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="points"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medal Distribution */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle>Medal Distribution</CardTitle>
            <CardDescription>Gold, Silver, and Bronze medals by faculty</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="gold" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                <Bar dataKey="silver" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="bronze" fill="#fb923c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points Trend */}
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Points progression throughout the meet</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { day: "Day 1", Engineering: 50, Science: 45, Medicine: 40, Arts: 35, Management: 30 },
                  { day: "Day 2", Engineering: 120, Science: 110, Medicine: 95, Arts: 85, Management: 75 },
                  { day: "Day 3", Engineering: 180, Science: 165, Medicine: 145, Arts: 130, Management: 115 },
                  { day: "Day 4", Engineering: 245, Science: 220, Medicine: 195, Arts: 180, Management: 165 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Engineering" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Science" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Medicine" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Arts" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="Management" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Rankings */}
      {viewType === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((faculty, index) => (
            <Card
              key={faculty.id}
              className="glass-card border-white/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, ${faculty.color} 0%, ${faculty.color}99 100%)`,
                }}
              ></div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 mb-2">
                      {faculty.name}
                    </CardTitle>
                    <CardDescription>{faculty.shortName}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: faculty.color }}
                    >
                      <span className="font-bold">#{faculty.rank}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Total Points */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <Trophy className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-gray-900">{faculty.totalPoints}</p>
                </div>

                {/* Medals */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Medal className="w-4 h-4 text-yellow-900" />
                    </div>
                    <p className="text-gray-900">{faculty.gold}</p>
                    <p className="text-xs text-gray-600">Gold</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Medal className="w-4 h-4 text-gray-700" />
                    </div>
                    <p className="text-gray-900">{faculty.silver}</p>
                    <p className="text-xs text-gray-600">Silver</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Medal className="w-4 h-4 text-orange-900" />
                    </div>
                    <p className="text-gray-900">{faculty.bronze}</p>
                    <p className="text-xs text-gray-600">Bronze</p>
                  </div>
                </div>

                {/* Sport Breakdown */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-3">Sport Performance</p>
                  <div className="space-y-2">
                    {faculty.sports.map((sport, sportIndex) => (
                      <div key={sportIndex}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{sport.name}</span>
                          <span className="text-xs text-gray-900">{sport.points} pts</span>
                        </div>
                        <Progress value={(sport.points / 100) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="outline"
                  style={{ borderColor: faculty.color, color: faculty.color }}
                >
                  View Details
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card border-white/30">
          <CardHeader>
            <CardTitle>Faculty Rankings Table</CardTitle>
            <CardDescription>
              Comprehensive standings with medals and points breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-center">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Points
                  </TableHead>
                  <TableHead className="text-center">
                    <Medal className="w-4 h-4 inline mr-1 text-yellow-500" />
                    Gold
                  </TableHead>
                  <TableHead className="text-center">
                    <Medal className="w-4 h-4 inline mr-1 text-gray-400" />
                    Silver
                  </TableHead>
                  <TableHead className="text-center">
                    <Medal className="w-4 h-4 inline mr-1 text-orange-500" />
                    Bronze
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((faculty) => (
                  <TableRow
                    key={faculty.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: faculty.color }}
                      >
                        <span className="font-bold">#{faculty.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{faculty.name}</p>
                        <p className="text-sm text-gray-600">{faculty.shortName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-200">
                        {faculty.totalPoints}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-yellow-100 text-yellow-900 hover:bg-yellow-200">
                        {faculty.gold}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                        {faculty.silver}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-orange-100 text-orange-900 hover:bg-orange-200">
                        {faculty.bronze}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        style={{ borderColor: faculty.color, color: faculty.color }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
