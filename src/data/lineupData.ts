// Lineup (schedule calendar) fallback

export type ScheduleDay = {
	date: string; // human-readable date like "January 5, 2025"
	events: { sport: string; time: string; venue: string }[];
};

export const scheduleData: ScheduleDay[] = [
	{
		date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
		events: [
			{ sport: 'Cricket (Men\'s)', time: '12:00 AM', venue: '-' },
		],
	},
	{
		date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
		events: [
			{ sport: 'Athletics Heats', time: '12:00 AM', venue: '-' },
		],
	},
];

