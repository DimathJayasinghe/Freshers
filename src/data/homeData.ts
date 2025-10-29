// Home page fallback data and types

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

export const liveMatches: LiveMatch[] = [
	{
		id: 1,
		sport: 'Cricket (Men\'s)',
		venue: '-',
		team1: '-',
		team2: '-',
		status: '-',
		statusColor: 'text-green-400',
	},
];

export const todaySchedule: ScheduleMatch[] = [
	{ id: 1, time: '09:00 AM', sport: '-', match: 'Track Events', team1: '', team2: '', venue: '-' },
];

