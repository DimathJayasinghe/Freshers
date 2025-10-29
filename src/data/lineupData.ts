// Lineup (schedule calendar) types only (no fallback data)

export type ScheduleDay = {
	date: string; // human-readable date like "January 5, 2025"
	events: { sport: string; time: string; venue: string }[];
};

