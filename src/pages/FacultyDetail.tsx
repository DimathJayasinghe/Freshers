import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFacultyById } from "@/data/facultiesData";
import { useEffect, useMemo, useState } from "react";
import { fetchFacultyDetail, fetchFacultiesOverview, type FacultyDetailData } from "@/lib/api";
import { 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  TrendingUp, 
  ArrowLeft,
  Flag,
  Star,
  Sparkles
} from "lucide-react";

export function FacultyDetail() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const fallback = facultyId ? getFacultyById(facultyId) : undefined;
  const [detail, setDetail] = useState<FacultyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!facultyId) return;
        const d = await fetchFacultyDetail(facultyId);
        if (mounted) setDetail(d);
      } catch (e) {
        console.error('[FacultyDetail] fetchFacultyDetail error', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [facultyId]);

  // Fetch rank for this faculty from overview/leaderboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!facultyId) return;
        const overview = await fetchFacultiesOverview();
        const me = overview.find(o => o.id === facultyId);
        if (mounted) setRank(me?.rank ?? null);
      } catch (e) {
        console.error('[FacultyDetail] fetch rank error', e);
      }
    })();
    return () => { mounted = false; };
  }, [facultyId]);

  // Normalize a view-model to keep existing JSX mostly intact
  const faculty = useMemo(() => {
    if (detail) {
      return {
        id: detail.id,
        name: detail.name,
        shortName: detail.shortName,
        colors: detail.colors,
        logo: detail.logo,
        totalPoints: detail.points.total,
        position: undefined as number | undefined, // rank not included in detail; could be added later
        sportsParticipated: detail.sports,
        achievements: detail.achievements.map(a => ({ sport: a.sport ?? 'Event', position: a.position, year: a.year ?? undefined })),
      } as {
        id: string;
        name: string;
        shortName: string;
        colors: { primary: string; secondary: string };
        logo: string;
        totalPoints: number;
        position?: number;
        sportsParticipated: string[];
        achievements: { sport: string; position: string; year?: number }[];
      };
    }
    return fallback;
  }, [detail, fallback]);

  // Show loading state before deciding Not Found
  if (!faculty && isLoading) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-to-br from-red-950 via-black to-gray-900 py-12 md:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-pulse">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10" />
              <div className="flex-1 space-y-4 w-full">
                <div className="h-10 w-64 bg-white/10 rounded" />
                <div className="h-6 w-80 bg-white/10 rounded" />
                <div className="flex gap-4">
                  <div className="h-16 w-32 bg-white/10 rounded" />
                  <div className="h-16 w-32 bg-white/10 rounded" />
                  <div className="h-16 w-32 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={`fd-skel-${i}`} className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-white/10">
                <CardHeader className="pb-3">
                  <div className="h-6 w-40 bg-white/10 rounded mb-2" />
                  <div className="h-5 w-24 bg-white/10 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-28 bg-white/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-red-800/50 p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Faculty Not Found</h2>
            <Button onClick={() => navigate("/faculties")}>
              Back to Faculties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to format ordinal suffixes (1st, 2nd, 3rd, 4th, ...)
  const ordinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Map textual positions to a numeric rank; unknown becomes 99 (Participation)
  const toRank = (pos: string): number => {
    const p = pos.toLowerCase();
    // Handle common labels explicitly
    if (/(^|\b)(second\s*runner|second\s*runner-up)(\b|$)/.test(p)) return 3; // Second runner-up == 3rd
    if (/(^|\b)(third\s*runner|third\s*runner-up)(\b|$)/.test(p)) return 4;  // Third runner-up == 4th
    if (/(^|\b)(1st|champ|champion|gold|winner)(\b|$)/.test(p)) return 1;
    if (/(^|\b)(2nd|runner\b|runner-up|silver)(\b|$)/.test(p)) return 2;
    if (/(^|\b)(3rd|third|bronze)(\b|$)/.test(p)) return 3;
    if (/(^|\b)(4th|fourth)(\b|$)/.test(p)) return 4;
    // Try to extract an explicit number like 5th, 6th, etc.
    const numMatch = p.match(/\b(\d+)\b/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (!Number.isNaN(n)) return n;
    }
    return 99; // participation/other
  };

  // Build achievements list from either DB detail or fallback
  const facultyAchievements = (faculty.achievements || []).map(a => {
    // Prefer explicit year; else try to parse a 4-digit year from text
    let yearText = a.year ? String(a.year) : "";
    if (!yearText) {
      const yearMatch = (a.position + " " + a.sport).match(/\b(19|20)\d{2}\b/);
      if (yearMatch) yearText = yearMatch[0];
    }
    return {
      sport: a.sport,
      position: toRank(a.position),
      positionText: a.position,
      date: yearText,
    };
  });

  // Categorize achievements
  const firstPlaces = facultyAchievements.filter(a => a.position === 1);
  const secondPlaces = facultyAchievements.filter(a => a.position === 2);
  const thirdPlaces = facultyAchievements.filter(a => a.position === 3);
  // We only show up to second runner-up in sections; positions > 3 are omitted from sections

  // Get medal config
  const getMedalConfig = (position: number) => {
    switch (position) {
      case 1:
        return {
          icon: Trophy,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/50",
          label: "Champion",
        };
      case 2:
        return {
          icon: Medal,
          color: "text-gray-400",
          bgColor: "bg-gray-400/10",
          borderColor: "border-gray-400/50",
          label: "Runner-up",
        };
      case 3:
        return {
          icon: Award,
          color: "text-orange-600",
          bgColor: "bg-orange-600/10",
          borderColor: "border-orange-600/50",
          label: "3rd Place",
        };
      case 4:
        return {
          icon: Star,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/50",
          label: "4th Place",
        };
      default:
        return {
          icon: Flag,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/50",
          // If position is our sentinel (99), show Participation; else show proper ordinal place
          label: position === 99 ? "Participation" : `${ordinal(position)} Place`,
        };
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section
        className="bg-gradient-to-br from-red-950 via-black to-gray-900 py-12 md:py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${faculty.colors.primary}20 0%, #000000 50%, #1a1a1a 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl"
            style={{ backgroundColor: faculty.colors.primary }}
          />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: faculty.colors.primary }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <Button
            onClick={() => navigate("/faculties")}
            variant="outline"
            className="mb-6 border-gray-700 hover:border-gray-500 text-white hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Faculties
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Faculty Logo/Icon */}
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
              style={{
                backgroundColor: faculty.colors.primary + "20",
                border: `3px solid ${faculty.colors.primary}`,
              }}
            >
              <div
                className="w-20 h-20 md:w-28 md:h-28 rounded-xl flex items-center justify-center text-white font-bold text-4xl md:text-5xl"
                style={{ backgroundColor: faculty.colors.primary }}
              >
                {faculty.shortName.charAt(0)}
              </div>
            </div>

            {/* Faculty Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-bold text-white">
                  {faculty.shortName}
                </h1>
                <Badge
                  className="text-lg px-4 py-1"
                  style={{
                    backgroundColor: faculty.colors.primary + "30",
                    border: `2px solid ${faculty.colors.primary}`,
                    color: faculty.colors.primary,
                  }}
                >
                  #{rank ?? "-"}
                </Badge>
              </div>
              <p className="text-xl text-gray-300">{faculty.name}</p>

              {/* Key Stats Overview */}
              <div className="flex flex-wrap gap-4 mt-6">
                {/* Total Points */}
                <div className="bg-black/50 border border-gray-700 rounded-lg px-6 py-3">
                  <div className="text-3xl font-bold text-white">{faculty.totalPoints}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
                {/* Championships */}
                <div className="bg-black/50 border border-gray-700 rounded-lg px-6 py-3">
                  <div className="text-3xl font-bold text-yellow-500">{firstPlaces.length}</div>
                  <div className="text-sm text-gray-400">Championships</div>
                </div>
                {/* Runner-ups */}
                <div className="bg-black/50 border border-gray-700 rounded-lg px-6 py-3">
                  <div className="text-3xl font-bold text-gray-400">{secondPlaces.length}</div>
                  <div className="text-sm text-gray-400">Runner-ups</div>
                </div>
                {/* Second runner-ups (Third place) */}
                <div className="bg-black/50 border border-gray-700 rounded-lg px-6 py-3">
                  <div className="text-3xl font-bold text-orange-500">{thirdPlaces.length}</div>
                  <div className="text-sm text-gray-400">Second runner-ups</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Championships Section */}
        {firstPlaces.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-white">Championships</h2>
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                {firstPlaces.length} Gold{firstPlaces.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {firstPlaces.map((achievement, index) => {
                const config = getMedalConfig(1);
                const Icon = config.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 ${config.borderColor} border-2 hover:scale-105 transition-transform duration-300`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            {achievement.sport}
                          </CardTitle>
                          <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
                            {config.label}
                          </Badge>
                        </div>
                        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">{achievement.date}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Runner-up Section */}
        {secondPlaces.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Medal className="w-8 h-8 text-gray-400" />
              <h2 className="text-3xl font-bold text-white">Runner-up Positions</h2>
              <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/50">
                {secondPlaces.length} Silver{secondPlaces.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-400/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {secondPlaces.map((achievement, index) => {
                const config = getMedalConfig(2);
                const Icon = config.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 ${config.borderColor} border-2 hover:scale-105 transition-transform duration-300`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            {achievement.sport}
                          </CardTitle>
                          <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">{achievement.date}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Second Runner-up Section (Third place) */}
        {thirdPlaces.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-white">Second Runner-up Positions</h2>
              <Badge className="bg-orange-600/20 text-orange-600 border-orange-600/50">
                {thirdPlaces.length} Second runner-up{thirdPlaces.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-600/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thirdPlaces.map((achievement, index) => {
                const config = getMedalConfig(3);
                const Icon = config.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 ${config.borderColor} border-2 hover:scale-105 transition-transform duration-300`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            {achievement.sport}
                          </CardTitle>
                          <Badge className={`${config.bgColor} ${config.color} ${config.borderColor} border`}>
                            Second runner-up
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">{achievement.date}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* No Achievements Message */}
        {facultyAchievements.length === 0 && (
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Results Yet</h3>
              <p className="text-gray-400">
                Results for {faculty.shortName} will appear here as events are completed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sports Participated */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-white">Sports Participated</h2>
            <Badge className="bg-red-500/20 text-red-500 border-red-500/50">
              {faculty.sportsParticipated.length} Sport{faculty.sportsParticipated.length !== 1 ? 's' : ''}
            </Badge>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/50 to-transparent"></div>
          </div>

          <div className="flex flex-wrap gap-3">
            {faculty.sportsParticipated.map((sport) => (
              <Badge
                key={sport}
                className="px-4 py-2 text-base"
                style={{
                  backgroundColor: faculty.colors.primary + "20",
                  border: `2px solid ${faculty.colors.primary}50`,
                  color: faculty.colors.primary,
                }}
              >
                {sport}
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
