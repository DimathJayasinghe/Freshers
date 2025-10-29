// Tournament helpers (no dependency on local datasets)

// Heuristic: build an acronym from words (e.g., "Faculty of Science" -> "FoS").
export function getShortFacultyName(fullName: string): string {
	if (!fullName) return '';
	const words = fullName.trim().split(/\s+/);
	if (words.length === 1) return words[0].slice(0, 3);
	const acronym = words
		.map((w) => (/[A-Za-z]/.test(w[0]) ? w[0] : ''))
		.join('')
		.slice(0, 4);
	return acronym || fullName.slice(0, 4);
}

