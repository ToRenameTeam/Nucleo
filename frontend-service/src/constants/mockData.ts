import type { WidgetOption } from '../types/widget'
import type { Document } from '../types/document'
import type { Appointment } from '../types/appointment'
import type { HealthParameter, HealthAlert, HealthMetricHistory } from '../types/health'
import type { SymptomSuggestion } from '../types/symptom-suggestion'

// Intelligent search: symptom to visit mapping
export const SYMPTOM_SUGGESTIONS: SymptomSuggestion[] = [
  {
    id: 'back-pain',
    symptom: 'mal di schiena',
    keywords: ['schiena', 'lombare', 'dorsale', 'vertebrale', 'colonna'],
    suggestedVisit: 'Visita Ortopedica',
    visitType: 'Ortopedia',
    visitTypeId: 'orthopedics',
    description: 'Valutazione specialistica per dolore alla schiena e problemi vertebrali',
    urgency: 'medium',
    icon: '🦴'
  },
  {
    id: 'chest-pain',
    symptom: 'dolore al petto',
    keywords: ['petto', 'torace', 'cuore', 'cardiaco', 'oppressione'],
    suggestedVisit: 'Visita Cardiologica',
    visitType: 'Cardiologia',
    visitTypeId: 'cardiology',
    description: 'Controllo cardiologico per dolore toracico e problemi cardiaci',
    urgency: 'high',
    icon: '❤️'
  },
  {
    id: 'headache',
    symptom: 'mal di testa',
    keywords: ['testa', 'cefalea', 'emicrania', 'cranio'],
    suggestedVisit: 'Visita Neurologica',
    visitType: 'Neurologia',
    visitTypeId: 'neurology',
    description: 'Valutazione neurologica per mal di testa ricorrenti',
    urgency: 'medium',
    icon: '🧠'
  },
  {
    id: 'vision-problems',
    symptom: 'problemi di vista',
    keywords: ['vista', 'occhi', 'vedere', 'visione', 'oculare', 'miopia'],
    suggestedVisit: 'Visita Oculistica',
    visitType: 'Oculistica',
    visitTypeId: 'ophthalmology',
    description: 'Controllo della vista e valutazione oftalmologica',
    urgency: 'low',
    icon: '👁️'
  },
  {
    id: 'skin-issues',
    symptom: 'problemi alla pelle',
    keywords: ['pelle', 'derma', 'eruzione', 'prurito', 'macchie', 'nei'],
    suggestedVisit: 'Visita Dermatologica',
    visitType: 'Dermatologia',
    visitTypeId: 'dermatology',
    description: 'Controllo dermatologico per problemi cutanei',
    urgency: 'low',
    icon: '🔬'
  },
  {
    id: 'joint-pain',
    symptom: 'dolore alle articolazioni',
    keywords: ['articolazioni', 'ginocchio', 'anca', 'spalla', 'gomito', 'caviglia'],
    suggestedVisit: 'Visita Ortopedica',
    visitType: 'Ortopedia',
    visitTypeId: 'orthopedics',
    description: 'Valutazione ortopedica per dolori articolari',
    urgency: 'medium',
    icon: '🦴'
  },
  {
    id: 'breathing-issues',
    symptom: 'difficoltà respiratorie',
    keywords: ['respiro', 'respirare', 'polmoni', 'tosse', 'asma', 'affanno'],
    suggestedVisit: 'Visita Pneumologica',
    visitType: 'Pneumologia',
    visitTypeId: 'general',
    description: 'Valutazione pneumologica per problemi respiratori',
    urgency: 'high',
    icon: '🫁'
  },
  {
    id: 'stomach-pain',
    symptom: 'dolore allo stomaco',
    keywords: ['stomaco', 'pancia', 'addome', 'gastrico', 'digestione'],
    suggestedVisit: 'Visita Gastroenterologica',
    visitType: 'Gastroenterologia',    visitTypeId: 'general',    description: 'Consulto gastroenterologico per problemi digestivi',
    urgency: 'medium',
    icon: '🩺'
  }
]

// Documenti centralizzati
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Referto ECG - Controllo cardiologico',
    description: 'Elettrocardiogramma completo con esito nella norma. Ritmo sinusale regolare, frequenza cardiaca 72 bpm. Nessuna alterazione significativa riscontrata.',
    tags: ['Cardiologia', 'Esami'],
    date: '7 Gen 2026',
    doctor: 'Dr. Mario Rossi',
    hospital: 'Ospedale San Raffaele'
  },
  {
    id: '2',
    title: 'Esami del sangue - Emocromo completo',
    description: 'Analisi ematochimiche complete. Valori nella norma per globuli rossi, bianchi e piastrine. Glicemia 92 mg/dL, colesterolo totale 185 mg/dL.',
    tags: ['Analisi', 'Laboratorio'],
    date: '29 Dic 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon'
  },
  {
    id: 'prescription-1',
    title: 'Prescrizione farmaci - Pressione sanguigna',
    description: 'Prescrizione medica per terapia antibiotica. Amoxicillina 1g, 3 volte al giorno per 7 giorni. Ritirare in farmacia.',
    tags: ['Prescrizione', 'Farmaci'],
    date: '27 Dic 2025',
    doctor: 'Dr. Mario Rossi',
    hospital: 'Ospedale San Raffaele',
    isPrescription: true,
    prescriptionCode: '8234567890123',
    expirationDays: 20,
  },
  {
    id: '3',
    title: 'Visita oculistica - Controllo vista',
    description: 'Esame della vista completo con valutazione del fondo oculare. Visus 10/10 occhio destro, 9/10 occhio sinistro. Prescrizione nuovi occhiali da vista.',
    tags: ['Oculistica', 'Visita'],
    date: '5 Nov 2025',
    doctor: 'Dr. Giuseppe Verdi',
    hospital: 'Centro Oculistico Vista Chiara'
  },
  {
    id: 'prescription-2',
    title: 'Prescrizione visita specialistica - Cardiologia',
    description: 'Richiesta visita cardiologica specialistica con ECG sotto sforzo. Prenotare entro 30 giorni.',
    tags: ['Prescrizione', 'Cardiologia'],
    date: '1 Nov 2025',
    doctor: 'Dr. Antonio Ferrari',
    hospital: 'Poliambulatorio Salute',
    isPrescription: true,
    prescriptionCode: '8234567890123',
    expirationDays: 20,
    usedDate : '10 Nov 2025'
  },
  {
    id: '4',
    title: 'Ecografia addominale completa',
    description: 'Esame ecografico dell\'addome superiore e inferiore. Fegato, milza, reni e vescica nella norma. Nessuna formazione patologica evidenziata.',
    tags: ['Diagnostica', 'Ecografia'],
    date: '28 Ott 2025',
    doctor: 'Dr. Antonio Ferrari',
    hospital: 'Centro Diagnostico San Marco'
  },
  {
    id: '5',
    title: 'Radiografia torace - RX standard',
    description: 'Radiografia del torace in 2 proiezioni. Polmoni ben espansi, non addensamenti parenchimali. Cuore di normali dimensioni. Esito negativo.',
    tags: ['Radiologia', 'Esami'],
    date: '20 Ott 2025',
    doctor: 'Dr.ssa Maria Colombo',
    hospital: 'Ospedale San Raffaele'
  },
  {
    id: 'prescription-3',
    title: 'Prescrizione esami del sangue',
    description: 'Richiesta esami ematochimici: emocromo, glicemia, profilo lipidico, funzionalità epatica e renale. Presentarsi a digiuno.',
    tags: ['Prescrizione', 'Analisi'],
    date: '20 Ott 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon',
    isPrescription: true,
    prescriptionCode: '8234567890123',
    expirationDays: 20
  },
  {
    id: '6',
    title: 'Visita dermatologica - Controllo nei',
    description: 'Mappatura completa dei nei con dermatoscopio digitale. Tutti i nevi esaminati presentano caratteristiche benigne. Consigliato controllo annuale.',
    tags: ['Dermatologia', 'Visita'],
    date: '12 Ott 2025',
    doctor: 'Dr. Francesco Russo',
    hospital: 'Centro Dermatologico Milano'
  },
  {
    id: '7',
    title: 'Esami funzionalità tiroidea - TSH, FT3, FT4',
    description: 'Dosaggio ormoni tiroidei. TSH 2.1 mU/L, FT3 3.2 pg/mL, FT4 1.1 ng/dL. Funzionalità tiroidea nella norma.',
    tags: ['Analisi', 'Endocrinologia'],
    date: '8 Ott 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon'
  },
  {
    id: '8',
    title: 'Visita ortopedica - Dolore ginocchio',
    description: 'Valutazione clinica del ginocchio destro. Lieve condropatia rotulea. Consigliata fisioterapia e rinforzo muscolare quadricipite.',
    tags: ['Ortopedia', 'Visita'],
    date: '1 Ott 2025',
    doctor: 'Dr. Luca Moretti',
    hospital: 'Poliambulatorio Salute'
  },
  {
    id: '9',
    title: 'Emoglobina glicata (HbA1c) - Controllo diabete',
    description: 'Dosaggio emoglobina glicata per monitoraggio diabete mellito tipo 2. Valore HbA1c 6.8%. Controllo glicemico accettabile, mantenere terapia in atto.',
    tags: ['Diabete', 'Analisi', 'Endocrinologia'],
    date: '15 Dic 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon'
  },
  {
    id: '10',
    title: 'Visita diabetologica - Controllo trimestrale',
    description: 'Controllo diabete mellito tipo 2. Glicemia a digiuno 128 mg/dL. Pressione arteriosa 135/85 mmHg. Peso 78 kg. Confermata terapia con metformina 1000mg x2/die.',
    tags: ['Diabete', 'Endocrinologia', 'Visita'],
    date: '10 Dic 2025',
    doctor: 'Dr. Paolo Santini',
    hospital: 'Centro Diabetologico Milano'
  },
  {
    id: '11',
    title: 'Profilo glicemico - Curva da carico',
    description: 'Test da carico orale di glucosio (OGTT). Glicemia basale 115 mg/dL, dopo 60min 185 mg/dL, dopo 120min 162 mg/dL. Intolleranza glucidica confermata.',
    tags: ['Diabete', 'Analisi'],
    date: '5 Dic 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon'
  },
  {
    id: '12',
    title: 'Fundus oculi - Screening retinopatia diabetica',
    description: 'Esame del fondo oculare per screening complicanze diabetiche. Non evidenza di retinopatia diabetica. Vasi retinici nella norma. Controllo consigliato tra 12 mesi.',
    tags: ['Diabete', 'Oculistica', 'Diagnostica'],
    date: '28 Nov 2025',
    doctor: 'Dr. Giuseppe Verdi',
    hospital: 'Centro Oculistico Vista Chiara'
  },
  {
    id: '13',
    title: 'Esame urine completo - Microalbuminuria',
    description: 'Analisi delle urine con ricerca microalbuminuria. Microalbuminuria 45 mg/24h (lievemente elevata). Funzionalità renale da monitorare. Creatinina 1.1 mg/dL.',
    tags: ['Diabete', 'Analisi', 'Nefrologia'],
    date: '20 Nov 2025',
    doctor: 'Dr.ssa Laura Bianchi',
    hospital: 'Laboratorio Analisi Medicon'
  },
  {
    id: '14',
    title: 'ECG + Visita cardiologica - Screening cardiovascolare',
    description: 'Elettrocardiogramma e visita cardiologica per paziente diabetico. ECG nella norma. Lieve ipertrofia ventricolare sinistra. Consigliato controllo annuale.',
    tags: ['Diabete', 'Cardiologia', 'Esami'],
    date: '8 Nov 2025',
    doctor: 'Dr. Mario Rossi',
    hospital: 'Ospedale San Raffaele'
  },
  {
    id: 'prescription-4',
    title: 'Prescrizione farmaci - Terapia diabete',
    description: 'Prescrizione terapia antidiabetica. Metformina 1000mg x2/die ai pasti. Validità 6 mesi con possibilità di ripetizione.',
    tags: ['Prescrizione', 'Diabete', 'Farmaci'],
    date: '10 Set 2025',
    doctor: 'Dr. Paolo Santini',
    hospital: 'Centro Diabetologico Milano',
    isPrescription: true,
    prescriptionCode: '8234567890456',
    expirationDays: 180
  },
  {
    id: '15',
    title: 'Ecocolordoppler arti inferiori - Screening vascolare',
    description: 'Esame ecocolordoppler degli arti inferiori per screening complicanze vascolari diabete. Flusso arterioso conservato bilateralmente. Nessuna stenosi significativa.',
    tags: ['Diabete', 'Diagnostica', 'Vascolare'],
    date: '25 Gen 2025',
    doctor: 'Dr. Antonio Ferrari',
    hospital: 'Centro Diagnostico San Marco'
  }
]

// Appuntamenti centralizzati
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    title: 'Visita cardiologica di controllo',
    description: 'Controllo annuale con ECG e misurazione pressione arteriosa',
    tags: ['Cardiologia', 'Controllo'],
    date: '13 Gen 2026',
    time: '15:30',
    user: 'Sofia',
    location: 'Ospedale San Raffaele'
  },
  {
    id: '2',
    title: 'Visita geriatrica generale',
    description: 'Valutazione periodica dello stato di salute generale e piano terapeutico',
    tags: ['Geriatria', 'Check-up'],
    date: '15 Gen 2026',
    time: '09:30',
    user: 'Nonno Giulio',
    location: 'Clinica Sant\'Ambrogio'
  },
  {
    id: '3',
    title: 'Prelievo esami del sangue',
    description: 'Emocromo completo, glicemia, colesterolo e funzionalità epatica',
    tags: ['Analisi', 'Laboratorio'],
    date: '20 Gen 2026',
    time: '08:00',
    user: 'Marco',
    location: 'Laboratorio Analisi Medicon'
  },
  {
    id: '4',
    title: 'Seduta di fisioterapia',
    description: 'Trattamento riabilitativo ginocchio destro - 5° seduta',
    tags: ['Riabilitazione', 'Fisioterapia'],
    date: '27 Gen 2026',
    time: '16:30',
    user: 'Marco',
    location: 'Centro Fisioterapia Riabilita'
  },
  {
    id: '5',
    title: 'Visita pediatrica',
    description: 'Controllo di crescita e sviluppo con valutazione peso e altezza',
    tags: ['Pediatria', 'Controllo'],
    date: '1 Feb 2026',
    time: '10:00',
    user: 'Sofia',
    location: 'Ospedale Pediatrico Buzzi'
  },
  {
    id: '6',
    title: 'Ecografia addominale',
    description: 'Ecografia addome completo prescritto dal medico curante',
    tags: ['Diagnostica', 'Ecografia'],
    date: '5 Feb 2026',
    time: '14:00',
    user: 'Laura',
    location: 'Centro Diagnostico San Marco'
  },
  {
    id: '7',
    title: 'Visita oculistica - Controllo vista',
    description: 'Esame della vista completo con misurazione della pressione oculare',
    tags: ['Oculistica', 'Visita'],
    date: '10 Feb 2026',
    time: '11:00',
    user: 'Laura',
    location: 'Centro Oculistico Vista Chiara'
  }
]

export const HEALTH_PARAMETERS: HealthParameter[] = [
  {
    id: 'cholesterol',
    name: 'Colesterolo',
    value: 185,
    unit: 'mg/dL',
    normalRange: { min: 120, max: 200 },
    trend: 'up',
    sourceDocuments: [
      {
        id: '2',
        title: 'Esami del sangue - Emocromo completo',
        date: '29 Dic 2025',
      },
      {
        id: '7',
        title: 'Esami funzionalità tiroidea - TSH, FT3, FT4',
        date: '8 Ott 2025',
      }
    ],
  },
  {
    id: 'blood-pressure-sys',
    name: 'Pressione sistolica',
    value: 120,
    unit: 'mmHg',
    normalRange: { min: 90, max: 120 },
    trend: 'stable',
    sourceDocuments: [
      {
        id: '1',
        title: 'Referto ECG - Controllo cardiologico',
        date: '7 Gen 2026',
      }
    ],
  },
  {
    id: 'blood-pressure-dia',
    name: 'Pressione diastolica',
    value: 80,
    unit: 'mmHg',
    normalRange: { min: 60, max: 80 },
    trend: 'stable',
    sourceDocuments: [
      {
        id: '1',
        title: 'Referto ECG - Controllo cardiologico',
        date: '7 Gen 2026',
      }
    ],
  },
  {
    id: 'heart-rate',
    name: 'Frequenza cardiaca',
    value: 72,
    unit: 'bpm',
    normalRange: { min: 60, max: 100 },
    trend: 'down',
    sourceDocuments: [
      {
        id: '1',
        title: 'Referto ECG - Controllo cardiologico',
        date: '7 Gen 2026',
      }
    ],
  },
  {
    id: 'glucose',
    name: 'Glicemia',
    value: 105,
    unit: 'mg/dL',
    normalRange: { min: 70, max: 100 },
    trend: 'up',
    sourceDocuments: [
      {
        id: '2',
        title: 'Esami del sangue - Emocromo completo',
        date: '29 Dic 2025',
      }
    ],
  },
  {
    id: 'oxygen',
    name: 'Saturazione O₂',
    value: 98,
    unit: '%',
    normalRange: { min: 95, max: 100 },
    trend: 'stable',
    sourceDocuments: [
      {
        id: '1',
        title: 'Referto ECG - Controllo cardiologico',
        date: '7 Gen 2026',
      }
    ],
  }
]

export const HEALTH_ALERTS: HealthAlert[] = [
  {
    id: 'alert-1',
    parameterId: 'glucose',
    parameterName: 'Glicemia leggermente elevata',
    severity: 'warning',
    message: 'Il tuo livello di glicemia è di 105 mg/dL, leggermente sopra il range ottimale.',
    recommendation: 'Riduci il consumo di zuccheri e carboidrati raffinati. Aumenta l\'attività fisica.',
  },
]

// Widget storico parametri salute
export const CHOLESTEROL_HISTORY: HealthMetricHistory = {
  parameterId: 'cholesterol',
  data: [
    { date: '15 Gen', value: 160 },
    { date: '20 Apr', value: 168 },
    { date: '18 Giu', value: 172 },
    { date: '8 Ott', value: 182 },
    { date: '29 Dic', value: 185 },
  ],
  sourceDocuments: [
    {
      id: '2',
      title: 'Esami del sangue - Emocromo completo',
      date: '29 Dic 2025',
    },
    {
      id: '7',
      title: 'Esami funzionalità tiroidea - TSH, FT3, FT4',
      date: '8 Ott 2025',
    }
  ],
}

export const BLOOD_PRESSURE_SYS_HISTORY: HealthMetricHistory = {
  parameterId: 'blood-pressure-sys',
  data: [
    { date: '10 Gen', value: 122 },
    { date: '18 Feb', value: 121 },
    { date: '5 Apr', value: 120 },
    { date: '28 Mag', value: 119 },
    { date: '25 Lug', value: 118 },
    { date: '15 Set', value: 122 },
    { date: '20 Ott', value: 119 },
    { date: '7 Dic', value: 120 },
  ],
  sourceDocuments: [
    {
      id: '1',
      title: 'Referto ECG - Controllo cardiologico',
      date: '7 Gen 2026',
    }
  ],
}

export const HEART_RATE_HISTORY: HealthMetricHistory = {
  parameterId: 'heart-rate',
  data: [
    { date: '20 Feb', value: 77 },
    { date: '10 Apr', value: 77 },
    { date: '15 Mag', value: 75 },
    { date: '22 Giu', value: 76 },
    { date: '5 Set', value: 73 },
    { date: '12 Ott', value: 74 },
    { date: '18 Nov', value: 73 },
  ],
  sourceDocuments: [
    {
      id: '1',
      title: 'Referto ECG - Controllo cardiologico',
      date: '7 Gen 2026',
    }
  ],
}

export const GLUCOSE_HISTORY: HealthMetricHistory = {
  parameterId: 'glucose',
  data: [
    { date: '20 Gen', value: 88 },
    { date: '25 Mar', value: 92 },
    { date: '15 Apr', value: 94 },
    { date: '5 Giu', value: 97 },
    { date: '18 Lug', value: 98 },
    { date: '12 Nov', value: 104 },
    { date: '22 Dic', value: 105 },
  ],
  sourceDocuments: [
    {
      id: '2',
      title: 'Esami del sangue - Emocromo completo',
      date: '29 Dic 2025',
    }
  ],
}

// Helper per ottenere un parametro specifico
export const getHealthParameter = (id: string): HealthParameter | undefined => {
  return HEALTH_PARAMETERS.find(p => p.id === id)
}

// Helper per ottenere lo storico di un parametro
export const getHealthHistory = (id: string): HealthMetricHistory | undefined => {
  const histories: Record<string, HealthMetricHistory> = {
    'cholesterol': CHOLESTEROL_HISTORY,
    'blood-pressure-sys': BLOOD_PRESSURE_SYS_HISTORY,
    'heart-rate': HEART_RATE_HISTORY,
    'glucose': GLUCOSE_HISTORY,
  }
  return histories[id]
}

// Dati widget aggiuntivi
export const WIDGET_DATA = {
  nextMedicationReminder: {
    medication: 'Vitamina D',
    time: '20:00',
    daysLeft: 0, // oggi
  },
  nextVaccine: {
    name: 'Antinfluenzale',
    date: '15 Gen 2025',
    daysLeft: 16,
  },
}

// Tipi di visite disponibili
export const VISIT_TYPES = [
  { id: 'cardiology', key: 'cardiology'},
  { id: 'dermatology', key: 'dermatology'},
  { id: 'general', key: 'general', icon: '⚕️' },
  { id: 'ophthalmology', key: 'ophthalmology'},
  { id: 'orthopedics', key: 'orthopedics'},
  { id: 'pediatrics', key: 'pediatrics'},
  { id: 'gynecology', key: 'gynecology'},
  { id: 'neurology', key: 'neurology'},
  { id: 'psychiatry', key: 'psychiatry'},
  { id: 'physiotherapy', key: 'physiotherapy'},
  { id: 'bloodTest', key: 'bloodTest'},
  { id: 'ecg', key: 'ecg'},
  { id: 'ultrasound', key: 'ultrasound'},
  { id: 'xray', key: 'xray'},
]

// Slot orari disponibili
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

// Dettagli appuntamento per data/ora
export interface AppointmentDetails {
  doctor: string
  location: string
}

// Mock function per ottenere dettagli appuntamento basati su data e ora
export function getAppointmentDetails(date: string, time: string): AppointmentDetails {
  // Array di medici e location disponibili
  const doctors = [
    'Dr.ssa Maria Rossi',
    'Dr. Giuseppe Verdi',
    'Dr. Luca Bianchi',
    'Dr.ssa Laura Ferrari',
    'Dr. Marco Colombo',
    'Dr.ssa Anna Ricci'
  ]
  
  const locations = [
    'Ospedale San Raffaele - Via Olgettina 60, Milano',
    'Poliambulatorio Salute - Via Roma 15, Milano',
    'Centro Medico San Marco - Corso Garibaldi 42, Milano',
    'Clinica Villa Maria - Via Manzoni 8, Milano'
  ]
  
  // Usa data e ora come seed per generare risultati consistenti
  const seed = (date + time).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const doctorIndex = seed % doctors.length
  const locationIndex = (seed * 7) % locations.length
  
  return {
    doctor: doctors[doctorIndex]!,
    location: locations[locationIndex]!
  }
}

export function getAvailableWidgets(t: (key: string) => string): WidgetOption[] {
  return [
    {
      id: 'next-visit',
      name: t('widgets.items.nextVisit.name'),
      description: t('widgets.items.nextVisit.description'),
      icon: '📅',
      category: 'quick',
    },
    {
      id: 'new-docs',
      name: t('widgets.items.newDocs.name'),
      description: t('widgets.items.newDocs.description'),
      icon: '🔔',
      category: 'quick',
    },
    {
      id: 'medication-reminder',
      name: t('widgets.items.medicationReminder.name'),
      description: t('widgets.items.medicationReminder.description'),
      icon: '💊',
      category: 'quick',
    },
    {
      id: 'next-vaccine',
      name: t('widgets.items.nextVaccine.name'),
      description: t('widgets.items.nextVaccine.description'),
      icon: '💉',
      category: 'quick',
    },
    {
      id: 'heart-rate',
      name: t('widgets.items.heartRate.name'),
      description: t('widgets.items.heartRate.description'),
      icon: '❤️',
      category: 'health-metric',
    },
    {
      id: 'blood-pressure-sys',
      name: t('widgets.items.bloodPressureSys.name'),
      description: t('widgets.items.bloodPressureSys.description'),
      icon: '🩺',
      category: 'health-metric',
    },
    {
      id: 'blood-pressure-dia',
      name: t('widgets.items.bloodPressureDia.name'),
      description: t('widgets.items.bloodPressureDia.description'),
      icon: '💉',
      category: 'health-metric',
    },
    {
      id: 'glucose',
      name: t('widgets.items.glucose.name'),
      description: t('widgets.items.glucose.description'),
      icon: '🩸',
      category: 'health-metric',
    },
    {
      id: 'oxygen',
      name: t('widgets.items.oxygen.name'),
      description: t('widgets.items.oxygen.description'),
      icon: '🫁',
      category: 'health-metric',
    },
    {
      id: 'cholesterol',
      name: t('widgets.items.cholesterol.name'),
      description: t('widgets.items.cholesterol.description'),
      icon: '🧪',
      category: 'health-metric',
    },
    {
      id: 'heart-rate-chart',
      name: t('widgets.items.heartRateChart.name'),
      description: t('widgets.items.heartRateChart.description'),
      icon: '📊',
      category: 'health-chart',
    },
    {
      id: 'glucose-chart',
      name: t('widgets.items.glucoseChart.name'),
      description: t('widgets.items.glucoseChart.description'),
      icon: '📈',
      category: 'health-chart',
    },
    {
      id: 'blood-pressure-sys-chart',
      name: t('widgets.items.bloodPressureSysChart.name'),
      description: t('widgets.items.bloodPressureSysChart.description'),
      icon: '📉',
      category: 'health-chart',
    },
    {
      id: 'cholesterol-chart',
      name: t('widgets.items.cholesterolChart.name'),
      description: t('widgets.items.cholesterolChart.description'),
      icon: '📈',
      category: 'health-chart',
    },
  ]
}

// Tag to color key mapping
export const TAG_COLOR_MAP: Record<string, string> = {
  'cardiologia': 'cardiologia',
  'diabete': 'diabete',
  'endocrinologia': 'endocrinologia',
  'farmaci': 'farmaci',
  'esami': 'esami',
  'analisi': 'analisi',
  'laboratorio': 'laboratorio',
  'oculistica': 'oculistica',
  'ortopedia': 'ortopedia',
  'dermatologia': 'dermatologia',
  'radiologia': 'radiologia',
  'ecografia': 'ecografia',
  'nefrologia': 'nefrologia',
  'vascolare': 'vascolare',
  'riabilitazione': 'riabilitazione',
  'fisioterapia': 'fisioterapia',
  'pediatria': 'pediatria',
  'controllo': 'controllo',
  'neurologia': 'neurologia',
  'pneumologia': 'pneumologia',
  'gastroenterologia': 'gastroenterologia',
  'prescrizione': 'farmaci',
  'visita': 'controllo',
  'diagnostica': 'esami'
}

// Tag to icon mapping
export const TAG_ICON_MAP: Record<string, string> = {
  'cardiologia': '❤️',
  'diabete': '🩸',
  'endocrinologia': '🧬',
  'farmaci': '💊',
  'esami': '🔬',
  'analisi': '🧪',
  'laboratorio': '🧬',
  'oculistica': '👁️',
  'ortopedia': '🦴',
  'dermatologia': '🔬',
  'radiologia': '📷',
  'ecografia': '📡',
  'nefrologia': '🫘',
  'vascolare': '🩸',
  'riabilitazione': '💪',
  'fisioterapia': '🏃',
  'pediatria': '👶',
  'controllo': '✅',
  'neurologia': '🧠',
  'pneumologia': '🫁',
  'gastroenterologia': '🩺',
  'prescrizione': '💊',
  'visita': '👨‍⚕️',
  'diagnostica': '🔬'
}