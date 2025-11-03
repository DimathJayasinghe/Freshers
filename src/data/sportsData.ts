// Sports data types only (no fallback data)

export type Sport = {
	id: string; // slug or unique id used in routing
	name: string;
	category: 'Team Sport' | 'Individual Sport' | 'Athletics' | 'Swimming';
	gender?: 'Mens' | 'Womens' | 'Both';
};

