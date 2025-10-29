// Tournament helpers

import { faculties } from './facultiesData';

// Returns a short label for a faculty given its full name
export function getShortFacultyName(fullName: string): string {
	const match = faculties.find(f => f.name.toLowerCase() === fullName.toLowerCase());
	return match?.shortName ?? fullName;
}

