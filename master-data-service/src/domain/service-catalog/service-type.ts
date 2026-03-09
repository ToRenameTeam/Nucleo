export interface ServiceType {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: ServiceCategory[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export enum ServiceCategory {
  VISITA_SPECIALISTICA = 'visita_specialistica',
  DIAGNOSTICA_IMMAGINI = 'diagnostica_immagini',
  LABORATORIO = 'laboratorio',
  CHIRURGIA = 'chirurgia',
  FISIOTERAPIA = 'fisioterapia',
  PREVENZIONE = 'prevenzione',
  ODONTOIATRIA = 'odontoiatria',
  OCULISTICA = 'oculistica',
  CARDIOLOGIA = 'cardiologia',
  DERMATOLOGIA = 'dermatologia',
  ORTOPEDIA = 'ortopedia',
  NEUROLOGIA = 'neurologia',
  OTORINOLARINGOIATRIA = 'otorinolaringoiatria',
  UROLOGIA = 'urologia',
  ENDOCRINOLOGIA = 'endocrinologia',
  GINECOLOGIA = 'ginecologia',
  PEDIATRIA = 'pediatria',
  ALTRO = 'altro',
}
