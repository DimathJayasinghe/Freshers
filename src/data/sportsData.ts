// Sports list fallback and types

export type Sport = {
	id: string; // slug or unique id used in routing
	name: string;
	category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
};

export const sportsData: Sport[] = [
	{ id: '-', name: '-', category: 'Team Sport' },
];

