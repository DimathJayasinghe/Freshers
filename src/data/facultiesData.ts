// Faculties fallback data and helpers

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

export const faculties: Faculty[] = [
	{
		id: '-',
		name: '-',
		shortName: '-',
		colors: { primary: '#c026d3', secondary: '#9333ea' },
		logo: '/logos/faculties/fos.png',
		totalPoints: 0,
		position: 0,
		sportsParticipated: ['-'],
		achievements: [
			{ sport: '-', position: 'Champion', year: 2024 },
		],
	},
	
];

export function getFacultyById(id: string): Faculty | undefined {
	return faculties.find((f) => f.id === id);
}

export function getFacultyIdByName(name: string): string | undefined {
	const match = faculties.find((f) => f.name.toLowerCase() === name.toLowerCase());
	return match?.id;
}

