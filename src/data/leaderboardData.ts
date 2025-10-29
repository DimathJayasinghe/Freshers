// Leaderboard data types only (no fallback data)

export type TeamData = {
	rank: number;
	name: string; // Full faculty name
	code: string; // Short code (e.g., FoS)
	mensPoints: number;
	womensPoints: number;
	totalPoints: number;
};

