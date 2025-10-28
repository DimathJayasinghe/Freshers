// Faculty logo utility functions

export const facultyLogos: Record<string, string> = {
  FOA: '/logos/faculties/foa.png',
  FOM: '/logos/faculties/fom.png',
  FOS: '/logos/faculties/fos.png',
  UCSC: '/logos/faculties/ucsc.png',
  FMF: '/logos/faculties/fmf.png',
  FOL: '/logos/faculties/fol.png',
  FOE: '/logos/faculties/foe.png',
  FOT: '/logos/faculties/fot.png',
  FON: '/logos/faculties/fon.png',
  FIM: '/logos/faculties/fim.png',
  SPC: '/logos/faculties/spc.png',
};

/**
 * Get the logo path for a faculty by its code
 * @param code - Faculty code (e.g., 'FOA', 'UCSC')
 * @returns Logo path or undefined if not found
 */
export const getFacultyLogo = (code: string): string | undefined => {
  return facultyLogos[code.toUpperCase()];
};

/**
 * Get the logo path with fallback to UOC logo
 * @param code - Faculty code
 * @param fallback - Fallback image path (optional, defaults to UOC logo)
 * @returns Logo path or fallback
 */
export const getFacultyLogoWithFallback = (
  code: string,
  fallback: string = '/logos/uoc-logo.png'
): string => {
  return facultyLogos[code.toUpperCase()] || fallback;
};

/**
 * Check if a faculty logo exists
 * @param code - Faculty code
 * @returns boolean
 */
export const hasFacultyLogo = (code: string): boolean => {
  return code.toUpperCase() in facultyLogos;
};
