/**
 * Utility functions to convert between specialization names and service categories
 *
 * Specializations: Camel Case with spaces (e.g., "Visita Cardiologica")
 * Categories: lowercase with underscores (e.g., "visita_cardiologica")
 */

/**
 * Normalize a string to lowercase with underscores
 * Converts "Visita Cardiologica" → "visita_cardiologica"
 */
export function normalizeToCategory(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Normalize a string to Camel Case with spaces
 * Converts "visita_cardiologica" → "Visita Cardiologica"
 */
export function normalizeToSpecialization(text: string): string {
  return text
    .trim()
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalize one or more specializations and format them as comma-separated text
 */
export function formatSpecializationsList(
  specializations: string | string[] | null | undefined
): string {
  const rawValues = Array.isArray(specializations) ? specializations : [specializations ?? ''];
  const values = rawValues.flatMap((item) => (typeof item === 'string' ? item.split(',') : []));

  return values
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => normalizeToSpecialization(item))
    .join(', ');
}

/**
 * Check if two strings match after normalization
 */
export function stringsMatch(str1: string, str2: string): boolean {
  return normalizeToCategory(str1) === normalizeToCategory(str2);
}

/**
 * Check if a doctor's specializations match a service category
 */
export function hasMatchingSpecialization(
  doctorSpecializations: string[],
  serviceCategories: string | string[]
): boolean {
  const categories = Array.isArray(serviceCategories) ? serviceCategories : [serviceCategories];

  // Normalize all categories
  const normalizedCategories = categories.map(normalizeToCategory);

  // Check if any specialization matches any category
  return doctorSpecializations.some((spec) => {
    const normalizedSpec = normalizeToCategory(spec);
    return normalizedCategories.includes(normalizedSpec);
  });
}
