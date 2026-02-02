import type { IFacility } from '../../../domains/facility/index.js';

type FacilitySeed = Omit<IFacility, 'createdAt' | 'updatedAt' | keyof Document>;

export const facilitySeeds: FacilitySeed[] = [
    // Milano
    {
        _id: 'facility-001',
        code: 'facility-001',
        name: 'Poliambulatorio San Marco',
        address: 'Via Montenapoleone 15',
        city: 'Milano',
        isActive: true
    },
    {
        _id: 'facility-002',
        code: 'facility-002',
        name: 'Centro Medico Città Studi',
        address: 'Piazza Leonardo da Vinci 32',
        city: 'Milano',
        isActive: true
    },
    {
        _id: 'facility-003',
        code: 'facility-003',
        name: 'Clinica Santa Chiara',
        address: 'Corso Buenos Aires 78',
        city: 'Milano',
        isActive: true
    },

    // Roma
    {
        _id: 'facility-004',
        code: 'facility-004',
        name: 'Poliambulatorio Villa Adriana',
        address: 'Via del Corso 120',
        city: 'Roma',
        isActive: true
    },
    {
        _id: 'facility-005',
        code: 'facility-005',
        name: 'Centro Diagnostico Parioli',
        address: 'Viale Parioli 45',
        city: 'Roma',
        isActive: true
    },
    {
        _id: 'facility-006',
        code: 'facility-006',
        name: 'Clinica Salus Roma',
        address: 'Via Nomentana 256',
        city: 'Roma',
        isActive: true
    },

    // Torino
    {
        _id: 'facility-007',
        code: 'facility-007',
        name: 'Centro Medico Mole',
        address: 'Via Po 22',
        city: 'Torino',
        isActive: true
    },
    {
        _id: 'facility-008',
        code: 'facility-008',
        name: 'Poliambulatorio Crocetta',
        address: 'Corso Vittorio Emanuele II 88',
        city: 'Torino',
        isActive: true
    },

    // Napoli
    {
        _id: 'facility-009',
        code: 'facility-009',
        name: 'Centro Medico Partenope',
        address: 'Via Toledo 156',
        city: 'Napoli',
        isActive: true
    },
    {
        _id: 'facility-010',
        code: 'facility-010',
        name: 'Clinica Vesuviana',
        address: 'Corso Umberto I 234',
        city: 'Napoli',
        isActive: true
    },

    // Bologna
    {
        _id: 'facility-011',
        code: 'facility-011',
        name: 'Poliambulatorio Due Torri',
        address: 'Via Rizzoli 12',
        city: 'Bologna',
        isActive: true
    },
    {
        _id: 'facility-012',
        code: 'facility-012',
        name: 'Centro Medico Emilia',
        address: 'Via Indipendenza 67',
        city: 'Bologna',
        isActive: true
    },

    // Firenze
    {
        _id: 'facility-013',
        code: 'facility-013',
        name: 'Centro Diagnostico Rinascimento',
        address: 'Via dei Calzaiuoli 34',
        city: 'Firenze',
        isActive: true
    },
    {
        _id: 'facility-014',
        code: 'facility-014',
        name: 'Poliambulatorio Santa Maria Novella',
        address: 'Piazza Santa Maria Novella 8',
        city: 'Firenze',
        isActive: true
    },

    // Verona
    {
        _id: 'facility-015',
        code: 'facility-015',
        name: 'Centro Medico Scaligero',
        address: 'Via Mazzini 45',
        city: 'Verona',
        isActive: true
    },

    // Bari
    {
        _id: 'facility-016',
        code: 'facility-016',
        name: 'Clinica Adriatica',
        address: 'Corso Cavour 78',
        city: 'Bari',
        isActive: true
    },

    // Palermo
    {
        _id: 'facility-017',
        code: 'facility-017',
        name: 'Centro Medico Trinacria',
        address: 'Via Libertà 150',
        city: 'Palermo',
        isActive: true
    },

    // Genova
    {
        _id: 'facility-018',
        code: 'facility-018',
        name: 'Poliambulatorio Liguria',
        address: 'Via XX Settembre 33',
        city: 'Genova',
        isActive: true
    },

    // Padova
    {
        _id: 'facility-019',
        code: 'facility-019',
        name: 'Centro Diagnostico Euganeo',
        address: 'Via Roma 56',
        city: 'Padova',
        isActive: true
    },

    // Catania
    {
        _id: 'facility-020',
        code: 'facility-020',
        name: 'Clinica dell\'Etna',
        address: 'Corso Italia 89',
        city: 'Catania',
        isActive: true
    }
];
