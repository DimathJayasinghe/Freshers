// Leaderboard fallback data and types

export type TeamData = {
	rank: number;
	name: string; // Full faculty name
	code: string; // Short code (e.g., FoS)
	mensPoints: number;
	womensPoints: number;
	totalPoints: number;
};

// Minimal, non-authoritative fallback used before Supabase loads
export const leaderboardData: TeamData[] = [
	{ rank: 1, name: '-', code: '-', mensPoints: 0, womensPoints: 0, totalPoints: 0 },
];

