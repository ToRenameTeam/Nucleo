import { ServiceCategory, IServiceType } from '../../../domains/service-catalog/index.js';

type ServiceTypeSeed = Omit<IServiceType, 'createdAt' | 'updatedAt' | keyof Document>;

export const serviceTypeSeeds: ServiceTypeSeed[] = [
    // Visite Specialistiche
    {
        _id: 'service-001',
        code: 'service-001',
        name: 'Visita Dermatologica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie della pelle, capelli e unghie.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },
    {
        _id: 'service-002',
        code: 'service-002',
        name: 'Visita Cardiologica',
        description: 'Visita specialistica per la valutazione del sistema cardiovascolare e la prevenzione di patologie cardiache.',
        category: ServiceCategory.CARDIOLOGIA,
        isActive: true
    },
    {
        _id: 'service-003',
        code: 'service-003',
        name: 'Visita Ortopedica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie dell\'apparato muscolo-scheletrico.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },
    {
        _id: 'service-004',
        code: 'service-004',
        name: 'Visita Neurologica',
        description: 'Visita specialistica per la diagnosi di patologie del sistema nervoso centrale e periferico.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },
    {
        _id: 'service-005',
        code: 'service-005',
        name: 'Visita Otorinolaringoiatrica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie di orecchio, naso e gola.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },
    {
        _id: 'service-006',
        code: 'service-006',
        name: 'Visita Ginecologica',
        description: 'Visita specialistica per la prevenzione e il trattamento di patologie dell\'apparato genitale femminile.',
        category: ServiceCategory.GINECOLOGIA,
        isActive: true
    },
    {
        _id: 'service-007',
        code: 'service-007',
        name: 'Visita Urologica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie dell\'apparato urinario e genitale maschile.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },
    {
        _id: 'service-008',
        code: 'service-008',
        name: 'Visita Pediatrica',
        description: 'Visita medica specialistica per la cura e la prevenzione delle malattie dell\'infanzia e dell\'adolescenza.',
        category: ServiceCategory.PEDIATRIA,
        isActive: true
    },
    {
        _id: 'service-009',
        code: 'service-009',
        name: 'Visita Oculistica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie dell\'occhio e della vista.',
        category: ServiceCategory.OCULISTICA,
        isActive: true
    },
    {
        _id: 'service-010',
        code: 'service-010',
        name: 'Visita Endocrinologica',
        description: 'Visita specialistica per la diagnosi e il trattamento di patologie del sistema endocrino e metabolico.',
        category: ServiceCategory.VISITA_SPECIALISTICA,
        isActive: true
    },

    // Diagnostica per Immagini
    {
        _id: 'service-011',
        code: 'service-011',
        name: 'Ecografia Addominale',
        description: 'Esame diagnostico non invasivo per la visualizzazione degli organi addominali (fegato, reni, milza, pancreas).',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-012',
        code: 'service-012',
        name: 'Ecografia Tiroidea',
        description: 'Esame ecografico per la valutazione della ghiandola tiroidea e l\'individuazione di noduli o alterazioni.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-013',
        code: 'service-013',
        name: 'Ecografia Mammaria',
        description: 'Esame diagnostico per la valutazione del tessuto mammario, complementare alla mammografia.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-014',
        code: 'service-014',
        name: 'Radiografia Toracica',
        description: 'Esame radiografico del torace per la valutazione di polmoni, cuore e strutture ossee.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-015',
        code: 'service-015',
        name: 'Risonanza Magnetica',
        description: 'Esame diagnostico avanzato per la visualizzazione dettagliata di tessuti molli, articolazioni e organi.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-016',
        code: 'service-016',
        name: 'TAC (Tomografia Computerizzata)',
        description: 'Esame diagnostico per immagini che fornisce sezioni trasversali dettagliate del corpo.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-017',
        code: 'service-017',
        name: 'Mammografia',
        description: 'Esame radiografico del seno per la diagnosi precoce del tumore mammario.',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },
    {
        _id: 'service-018',
        code: 'service-018',
        name: 'Ecografia Pelvica',
        description: 'Esame ecografico per la valutazione degli organi pelvici (utero, ovaie, prostata, vescica).',
        category: ServiceCategory.DIAGNOSTICA_IMMAGINI,
        isActive: true
    },

    // Cardiologia
    {
        _id: 'service-019',
        code: 'service-019',
        name: 'Elettrocardiogramma (ECG)',
        description: 'Esame diagnostico per la registrazione dell\'attività elettrica del cuore.',
        category: ServiceCategory.CARDIOLOGIA,
        isActive: true
    },
    {
        _id: 'service-020',
        code: 'service-020',
        name: 'Ecocardiogramma',
        description: 'Esame ecografico del cuore per valutare struttura e funzionalità cardiaca.',
        category: ServiceCategory.CARDIOLOGIA,
        isActive: true
    },
    {
        _id: 'service-021',
        code: 'service-021',
        name: 'Holter Cardiaco 24h',
        description: 'Monitoraggio continuo dell\'attività cardiaca per 24 ore tramite dispositivo portatile.',
        category: ServiceCategory.CARDIOLOGIA,
        isActive: true
    },
    {
        _id: 'service-022',
        code: 'service-022',
        name: 'Test da Sforzo',
        description: 'Esame cardiologico per valutare la risposta del cuore durante l\'esercizio fisico.',
        category: ServiceCategory.CARDIOLOGIA,
        isActive: true
    },

    // Laboratorio
    {
        _id: 'service-023',
        code: 'service-023',
        name: 'Esami del Sangue Completi',
        description: 'Pannello completo di analisi del sangue inclusi emocromo, glicemia, funzionalità epatica e renale.',
        category: ServiceCategory.LABORATORIO,
        isActive: true
    },
    {
        _id: 'service-024',
        code: 'service-024',
        name: 'Esame delle Urine',
        description: 'Analisi chimico-fisica e microscopica delle urine per la valutazione della funzionalità renale.',
        category: ServiceCategory.LABORATORIO,
        isActive: true
    },
    {
        _id: 'service-025',
        code: 'service-025',
        name: 'Profilo Lipidico',
        description: 'Analisi dei livelli di colesterolo totale, HDL, LDL e trigliceridi nel sangue.',
        category: ServiceCategory.LABORATORIO,
        isActive: true
    },
    {
        _id: 'service-026',
        code: 'service-026',
        name: 'Profilo Tiroideo',
        description: 'Analisi degli ormoni tiroidei (TSH, T3, T4) per la valutazione della funzionalità tiroidea.',
        category: ServiceCategory.LABORATORIO,
        isActive: true
    },
    {
        _id: 'service-027',
        code: 'service-027',
        name: 'Markers Tumorali',
        description: 'Analisi dei principali markers oncologici per lo screening e il monitoraggio di neoplasie.',
        category: ServiceCategory.LABORATORIO,
        isActive: true
    },

    // Fisioterapia
    {
        _id: 'service-028',
        code: 'service-028',
        name: 'Fisioterapia Riabilitativa',
        description: 'Trattamento riabilitativo per il recupero funzionale post-traumatico o post-operatorio.',
        category: ServiceCategory.FISIOTERAPIA,
        isActive: true
    },
    {
        _id: 'service-029',
        code: 'service-029',
        name: 'Massoterapia',
        description: 'Trattamento manuale per il rilassamento muscolare e il trattamento di contratture.',
        category: ServiceCategory.FISIOTERAPIA,
        isActive: true
    },
    {
        _id: 'service-030',
        code: 'service-030',
        name: 'Terapia Manuale Ortopedica',
        description: 'Trattamento specializzato per disfunzioni articolari e muscolari della colonna e degli arti.',
        category: ServiceCategory.FISIOTERAPIA,
        isActive: true
    },

    // Odontoiatria
    {
        _id: 'service-031',
        code: 'service-031',
        name: 'Visita Odontoiatrica',
        description: 'Controllo dentale completo con valutazione della salute orale e piano di trattamento.',
        category: ServiceCategory.ODONTOIATRIA,
        isActive: true
    },
    {
        _id: 'service-032',
        code: 'service-032',
        name: 'Igiene Dentale Professionale',
        description: 'Pulizia dentale professionale con rimozione di tartaro e placca batterica.',
        category: ServiceCategory.ODONTOIATRIA,
        isActive: true
    },
    {
        _id: 'service-033',
        code: 'service-033',
        name: 'Ortodonzia',
        description: 'Valutazione e trattamento per la correzione di malocclusioni e allineamento dentale.',
        category: ServiceCategory.ODONTOIATRIA,
        isActive: true
    },
    {
        _id: 'service-034',
        code: 'service-034',
        name: 'Implantologia Dentale',
        description: 'Intervento per l\'inserimento di impianti dentali per la sostituzione di denti mancanti.',
        category: ServiceCategory.ODONTOIATRIA,
        isActive: true
    },

    // Oculistica
    {
        _id: 'service-035',
        code: 'service-035',
        name: 'Esame del Fondo Oculare',
        description: 'Esame diagnostico per la valutazione della retina e del nervo ottico.',
        category: ServiceCategory.OCULISTICA,
        isActive: true
    },
    {
        _id: 'service-036',
        code: 'service-036',
        name: 'Tonometria',
        description: 'Misurazione della pressione intraoculare per lo screening del glaucoma.',
        category: ServiceCategory.OCULISTICA,
        isActive: true
    },
    {
        _id: 'service-037',
        code: 'service-037',
        name: 'Campo Visivo',
        description: 'Esame per la valutazione dell\'ampiezza del campo visivo e individuazione di deficit.',
        category: ServiceCategory.OCULISTICA,
        isActive: true
    },

    // Prevenzione
    {
        _id: 'service-038',
        code: 'service-038',
        name: 'Check-up Base',
        description: 'Pacchetto di prevenzione con visita medica, esami del sangue e ECG.',
        category: ServiceCategory.PREVENZIONE,
        isActive: true
    },
    {
        _id: 'service-039',
        code: 'service-039',
        name: 'Check-up Completo',
        description: 'Pacchetto completo di prevenzione con visite specialistiche, esami di laboratorio e diagnostica per immagini.',
        category: ServiceCategory.PREVENZIONE,
        isActive: true
    },
    {
        _id: 'service-040',
        code: 'service-040',
        name: 'Screening Oncologico',
        description: 'Pacchetto di prevenzione oncologica con markers tumorali e esami diagnostici mirati.',
        category: ServiceCategory.PREVENZIONE,
        isActive: true
    },

    // Chirurgia
    {
        _id: 'service-041',
        code: 'service-041',
        name: 'Visita Chirurgica',
        description: 'Visita specialistica per la valutazione pre-operatoria e pianificazione di interventi chirurgici.',
        category: ServiceCategory.CHIRURGIA,
        isActive: true
    },
    {
        _id: 'service-042',
        code: 'service-042',
        name: 'Chirurgia Ambulatoriale Minore',
        description: 'Interventi chirurgici minori eseguibili in ambulatorio senza necessità di ricovero.',
        category: ServiceCategory.CHIRURGIA,
        isActive: true
    },

    // Ginecologia
    {
        _id: 'service-043',
        code: 'service-043',
        name: 'Pap Test',
        description: 'Esame citologico per lo screening del tumore del collo dell\'utero.',
        category: ServiceCategory.GINECOLOGIA,
        isActive: true
    },
    {
        _id: 'service-044',
        code: 'service-044',
        name: 'Ecografia Ostetrica',
        description: 'Esame ecografico per il monitoraggio della gravidanza e lo sviluppo fetale.',
        category: ServiceCategory.GINECOLOGIA,
        isActive: true
    },
    {
        _id: 'service-045',
        code: 'service-045',
        name: 'Colposcopia',
        description: 'Esame diagnostico per la visualizzazione dettagliata del collo dell\'utero.',
        category: ServiceCategory.GINECOLOGIA,
        isActive: true
    }
];
