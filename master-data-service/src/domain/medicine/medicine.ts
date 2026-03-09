export interface Medicine {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: MedicineCategory;
  readonly activeIngredient: string;
  readonly dosageForm: string;
  readonly strength: string;
  readonly manufacturer: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export enum MedicineCategory {
  ANALGESICO = 'analgesico',
  ANTIBIOTICO = 'antibiotico',
  ANTINFIAMMATORIO = 'antinfiammatorio',
  ANTIVIRALE = 'antivirale',
  CARDIOVASCOLARE = 'cardiovascolare',
  DERMATOLOGICO = 'dermatologico',
  GASTROINTESTINALE = 'gastrointestinale',
  NEUROLOGICO = 'neurologico',
  ONCOLOGICO = 'oncologico',
  RESPIRATORIO = 'respiratorio',
  VITAMINE = 'vitamine',
  ALTRO = 'altro',
}
