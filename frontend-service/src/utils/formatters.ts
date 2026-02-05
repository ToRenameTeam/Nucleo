export function formatCategory(category: string | undefined): string {
  if (!category) return ''
  
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
