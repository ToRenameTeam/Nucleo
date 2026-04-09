import { normalizeToSpecialization } from './specialization';

export function formatCategory(category: string | undefined): string {
  if (!category) return '';

  return normalizeToSpecialization(category);
}
