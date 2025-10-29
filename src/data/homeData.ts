// Home page data types only (no fallback data)

export type LiveMatch = {
	id: number;
	sport: string;
	venue: string;
	team1: string;
	team2: string;
	status: string;
	statusColor: string; // Tailwind text color class (e.g., text-green-400)
};

export type ScheduleMatch = {
	id: number;
	time: string;
	sport: string;
	match: string;
	team1: string;
	team2: string;
	venue: string;
};

