export interface SymptomSuggestion {
  id: string
  symptom: string
  keywords: string[]
  suggestedVisit: string
  visitType: string
  visitTypeId: string
  description: string
  urgency: 'high' | 'medium' | 'low' | string
  icon: string
}