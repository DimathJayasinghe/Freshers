import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Users, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { FacultyDetails } from './FacultyDetails';

interface FacultyScore {
  id: number;
  name: string;
  totalScore: number;
  gold: number;
  silver: number;
  bronze: number;
  color: string;
}

// Men's Leaderboard Data
const mensScores: FacultyScore[] = [
  {
    id: 1,
    name: 'Faculty of Engineering',
    totalScore: 285,
    gold: 5,
    silver: 3,
    bronze: 2,
    color: '#3b82f6'
  },
  {
    id: 2,
    name: 'Faculty of Science',
    totalScore: 245,
    gold: 4,
    silver: 4,
    bronze: 2,
    color: '#10b981'
  },
  {
    id: 3,
    name: 'Faculty of Medicine',
    totalScore: 220,
    gold: 3,
    silver: 3,
    bronze: 3,
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Faculty of Arts',
    totalScore: 195,
    gold: 2,
    silver: 3,
    bronze: 4,
    color: '#8b5cf6'
  },
  {
    id: 5,
    name: 'Faculty of Management',
    totalScore: 165,
    gold: 2,
    silver: 2,
    bronze: 3,
    color: '#ec4899'
  }
];

// Women's Leaderboard Data
const womensScores: FacultyScore[] = [
  {
    id: 1,
    name: 'Faculty of Science',
    totalScore: 265,
    gold: 5,
    silver: 3,
    bronze: 1,
    color: '#10b981'
  },
  {
    id: 2,
    name: 'Faculty of Engineering',
    totalScore: 240,
    gold: 4,
    silver: 3,
    bronze: 2,
    color: '#3b82f6'
  },
  {
    id: 3,
    name: 'Faculty of Medicine',
    totalScore: 230,
    gold: 3,
    silver: 4,
    bronze: 2,
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Faculty of Arts',
    totalScore: 210,
    gold: 3,
    silver: 2,
    bronze: 3,
    color: '#8b5cf6'
  },
  {
    id: 5,
    name: 'Faculty of Management',
    totalScore: 180,
    gold: 2,
    silver: 2,
    bronze: 3,
    color: '#ec4899'
  }
];

// Overall Leaderboard Data (Combined)
const overallScores: FacultyScore[] = [
  {
    id: 1,
    name: 'Faculty of Engineering',
    totalScore: 525,
    gold: 9,
    silver: 6,
    bronze: 4,
    color: '#3b82f6'
  },
  {
    id: 2,
    name: 'Faculty of Science',
    totalScore: 510,
    gold: 9,
    silver: 7,
    bronze: 3,
    color: '#10b981'
  },
  {
    id: 3,
    name: 'Faculty of Medicine',
    totalScore: 450,
    gold: 6,
    silver: 7,
    bronze: 5,
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Faculty of Arts',
    totalScore: 405,
    gold: 5,
    silver: 5,
    bronze: 7,
    color: '#8b5cf6'
  },
  {
    id: 5,
    name: 'Faculty of Management',
    totalScore: 345,
    gold: 4,
    silver: 4,
    bronze: 6,
    color: '#ec4899'
  }
];

interface LeaderboardProps {
  scores: FacultyScore[];
  title: string;
  onFacultyClick: (faculty: FacultyScore) => void;
}

function Leaderboard({ scores, title, onFacultyClick }: LeaderboardProps) {
  return (
    <div className="space-y-6">
      {/* Glass Container */}
      <div className="glass-leaderboard-container rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md border-b border-white/10">
          <div className="col-span-1 text-center">
            <p className="text-white/90 uppercase tracking-wider text-xs">Rank</p>
          </div>
          <div className="col-span-5 sm:col-span-6">
            <p className="text-white/90 uppercase tracking-wider text-xs">Faculty</p>
          </div>
          <div className="col-span-2 text-center">
            <p className="text-white/90 uppercase tracking-wider text-xs">Medals</p>
          </div>
          <div className="col-span-2 text-center">
            <p className="text-white/90 uppercase tracking-wider text-xs">Points</p>
          </div>
          <div className="col-span-2 sm:col-span-1 text-center">
            <p className="text-white/90 uppercase tracking-wider text-xs">View</p>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200/50">
          {scores.map((faculty, index) => (
            <div
              key={faculty.id}
              className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/40 transition-all duration-300 cursor-pointer group animate-fade-in ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50/80 to-yellow-100/60' :
                index === 1 ? 'bg-gradient-to-r from-gray-50/80 to-gray-100/60' :
                index === 2 ? 'bg-gradient-to-r from-orange-50/80 to-orange-100/60' :
                'bg-white/20'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onFacultyClick(faculty)}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center justify-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-lg' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-lg' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900 shadow-lg' :
                  'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900'
                }`}>
                  {index === 0 && <span className="text-lg">🥇</span>}
                  {index === 1 && <span className="text-lg">🥈</span>}
                  {index === 2 && <span className="text-lg">🥉</span>}
                  {index > 2 && <span className="font-semibold text-sm">#{index + 1}</span>}
                </div>
              </div>

              {/* Faculty Name */}
              <div className="col-span-5 sm:col-span-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-1 h-10 rounded-full" 
                    style={{ backgroundColor: faculty.color }}
                  ></div>
                  <div>
                    <p className="text-gray-900 font-medium group-hover:text-blue-900 transition-colors">
                      {faculty.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(faculty.gold)].map((_, i) => (
                          <div key={`gold-${i}`} className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        ))}
                        {[...Array(faculty.silver)].map((_, i) => (
                          <div key={`silver-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        ))}
                        {[...Array(faculty.bronze)].map((_, i) => (
                          <div key={`bronze-${i}`} className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medals */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-yellow-50/80 text-yellow-700 border-yellow-300 text-xs px-2 py-0.5">
                    {faculty.gold}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50/80 text-gray-700 border-gray-300 text-xs px-2 py-0.5">
                    {faculty.silver}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50/80 text-orange-700 border-orange-300 text-xs px-2 py-0.5">
                    {faculty.bronze}
                  </Badge>
                </div>
              </div>

              {/* Total Points */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md">
                  <p className="font-semibold">{faculty.totalScore}</p>
                </div>
              </div>

              {/* View Button */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* End Leaderboard */}
    </div>
  );
}

export function SummaryPage() {
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyScore | null>(null);

  const handleFacultyClick = (faculty: FacultyScore) => {
    setSelectedFaculty(faculty);
  };

  const handleCloseFacultyDetails = () => {
    setSelectedFaculty(null);
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Minimal UI: Tabs + Tables only */}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-12">
          <TabsList className="glass-effect shadow-xl rounded-2xl p-2 border border-white/20 backdrop-blur-xl bg-white/60">
            <TabsTrigger 
              value="overall" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Trophy className="w-4 h-4" />
              <span>Overall Standings</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="mens" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span>Men's</span>
            </TabsTrigger>

            <TabsTrigger 
              value="womens" 
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all duration-300 data-[state=active]:shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span>Women's</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overall" className="mt-0">
          <Leaderboard 
            scores={overallScores}
            title="UCSC Freshers' Sports Meet 2025"
            onFacultyClick={handleFacultyClick}
          />
        </TabsContent>

        <TabsContent value="mens" className="mt-0">
          <Leaderboard 
            scores={mensScores}
            title="Men's Category - UCSC 2025"
            onFacultyClick={handleFacultyClick}
          />
        </TabsContent>

        <TabsContent value="womens" className="mt-0">
          <Leaderboard 
            scores={womensScores}
            title="Women's Category - UCSC 2025"
            onFacultyClick={handleFacultyClick}
          />
        </TabsContent>
      </Tabs>

      {/* Faculty Details Modal */}
      {selectedFaculty && (
        <FacultyDetails
          facultyName={selectedFaculty.name}
          facultyColor={selectedFaculty.color}
          totalScore={selectedFaculty.totalScore}
          gold={selectedFaculty.gold}
          silver={selectedFaculty.silver}
          bronze={selectedFaculty.bronze}
          onClose={handleCloseFacultyDetails}
        />
      )}
    </div>
  );
}
