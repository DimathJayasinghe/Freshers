// Faculties helpers and types only (no fallback data)

export type Faculty = {
	id: string;
	name: string;
	shortName: string;
	colors: { primary: string; secondary: string };
	logo: string;
	totalPoints: number;
	position?: number; // optional rank
	sportsParticipated: string[];
	achievements: { sport: string; position: string; year?: number }[];
};

export function getFacultyById(_id: string): Faculty | undefined {
	// Mark param as used to satisfy linters
	void _id;
	// No local cache available; without DB mapping we can't resolve reliably.
	return undefined;
}

export function getFacultyIdByName(_name: string): string | undefined {
	// Mark param as used to satisfy linters
	void _name;
	// No local cache available; return undefined to skip navigation when unknown.
	return undefined;
}

