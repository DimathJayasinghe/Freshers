import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { leaderboardData } from "@/data/leaderboardData";

export function Leaderboard() {

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return <span className="text-xl font-bold text-gray-500">#{rank}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Leaderboard</h1>
      <p className="text-gray-400 mb-6">Top performing faculties in the competition</p>

      <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-xl md:text-2xl">Faculty Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Row */}
          <div className="hidden md:grid md:grid-cols-9 gap-4 p-4 bg-red-900/20 rounded-lg mb-4 font-semibold text-gray-300 text-sm">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Faculty</div>
            <div className="col-span-3 grid grid-cols-3 gap-2 text-center items-center">
              <div>Men's Points</div>
              <div>Women's Points</div>
              <div className="text-lg  text-white">Total Points</div>
            </div>
          </div>

          {/* Team Rows */}
          <div className="space-y-3">
            {leaderboardData.map((team) => (
              <div
                key={team.rank}
                className={`grid grid-cols-1 md:grid-cols-9 gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                  team.rank <= 3
                    ? "bg-white/5 backdrop-blur-sm border-red-500/30 hover:border-red-500/60"
                    : "bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20"
                }`}
              >
                {/* Rank */}
                <div className="md:col-span-1 flex md:justify-center items-center">
                  <div className="flex items-center gap-3 md:block md:text-center">
                    <div className="flex justify-center">{getMedalIcon(team.rank)}</div>
                    <div className="md:hidden">
                      <span className="text-white font-semibold text-base block">
                        {team.name}
                      </span>
                      <span className="text-gray-400 text-xs">{team.code}</span>
                    </div>
                  </div>
                </div>

                {/* Faculty Name (Desktop only) */}
                <div className="hidden md:flex md:col-span-5 items-center">
                  <div>
                    <h3 className="text-white font-semibold text-base lg:text-lg">
                      {team.name}
                    </h3>
                    <p className="text-gray-400 text-xs">{team.code}</p>
                  </div>
                </div>

                {/* Points */}
                <div className="md:col-span-3 grid grid-cols-3 gap-2 text-center">
                    <div className="text-gray-200  text-lg lg:text-xl">
                      {team.mensPoints}
                  </div>
                    <div className="text-gray-200  text-lg lg:text-xl">
                      {team.womensPoints}
                  </div>
                    <div className="text-white text-xl lg:text-2xl">
                    {team.totalPoints}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
