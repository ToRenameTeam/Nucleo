import type { Document } from '../types/document'
import type { Appointment } from '../types/appointment'

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