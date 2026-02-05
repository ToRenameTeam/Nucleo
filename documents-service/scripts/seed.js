// MongoDB seed script for documents-service
// Run with: mongosh mongodb://admin:password@localhost:27037/nucleo_documents --authenticationDatabase admin < scripts/seed.js

// Clear existing data
db.medical_records.deleteMany({});

print("Seeding medical records...");

// Helper function to generate ObjectId-like strings
function generateObjectId() {
    return new ObjectId().toString();
}

// Patient IDs from users-service
const PATIENT_IDS = {
    MARIO_ROSSI: 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97',
    ELENA_FERRARI: 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1',
    GIULIA_BIANCHI: '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9',
    LUCA_ROMANO: '61f38542-ccd6-44ee-acbb-eb72d6824b05',
    ALESSANDRO_RICCI: 'a5ca3979-1359-4a17-b81f-eac3e36064bc',
    MARIA_CONTI: 'aeb4d41d-c6d1-4784-997e-b06cc62df64b',
};

// Doctor IDs from users-service
const DOCTOR_IDS = {
    FRANCESCO_VERDI: 'f0aa4140-8d57-425d-b880-e8cf2008f265', // Cardiologo
    PAOLO_GRECO: '417bf5ac-9fd3-43ca-a160-775b6463eebc', // Ortopedico
    GIORGIO_COSTA: 'c225b306-63de-4e82-af11-76e8ed3f5926', // Neurologo
    STEFANO_LOMBARDI: '1cac71a0-c761-4ea8-b378-8eab4731c524', // Dermatologo
    SARA_COLOMBO: '5eab37f0-1d7b-4ded-a7bd-6676b195231a', // Pediatra
};

// Seed Medical Records with Documents
const medicalRecords = [
    // Mario Rossi - paziente con diverse prescrizioni e referti
    {
        patientId: PATIENT_IDS.MARIO_ROSSI,
        documents: [
            {
                _t: 'medicine_prescription',
                id: '1a2b3c4d-5e6f-4a1b-8c2d-111111111111',
                doctorId: DOCTOR_IDS.FRANCESCO_VERDI,
                patientId: PATIENT_IDS.MARIO_ROSSI,
                issueDate: '2026-01-20',
                title: 'Prescrizione Enalapril',
                summary: 'Prescrizione farmaci antipertensivi per controllo pressione arteriosa',
                tags: ['cardiologia', 'ipertensione', 'cronica'],
                validity: {
                    _t: 'until_date',
                    date: '2026-07-20'
                },
                dosage: {
                    medicineId: 'med-001',
                    medicineName: 'Enalapril',
                    dose: { amount: 10, unit: 'mg' },
                    frequency: { timesPerPeriod: 1, period: 'giorno' },
                    duration: { length: 6, unit: 'mesi' },
                    instructions: 'Assumere al mattino a stomaco pieno'
                }
            },
            {
                _t: 'report',
                id: '1a2b3c4d-5e6f-4a1b-8c2d-222222222222',
                doctorId: DOCTOR_IDS.FRANCESCO_VERDI,
                patientId: PATIENT_IDS.MARIO_ROSSI,
                issueDate: '2026-01-15',
                title: 'Referto Visita Cardiologica',
                summary: 'Visita cardiologica di controllo - esito positivo',
                tags: ['cardiologia', 'visita'],
                reportType: 'Visita cardiologica',
                findings: 'Parametri cardiovascolari nella norma. Pressione arteriosa sotto controllo con terapia attuale.',
                recommendations: 'Continuare terapia in atto. Controllo tra 3 mesi.'
            },
            {
                _t: 'service_prescription',
                id: '1a2b3c4d-5e6f-4a1b-8c2d-333333333333',
                doctorId: DOCTOR_IDS.FRANCESCO_VERDI,
                patientId: PATIENT_IDS.MARIO_ROSSI,
                issueDate: '2026-01-15',
                title: 'Prescrizione ECG Sotto Sforzo',
                summary: 'Prescrizione ECG sotto sforzo',
                tags: ['cardiologia', 'diagnostica'],
                validity: {
                    _t: 'until_date',
                    date: '2026-04-15'
                },
                serviceId: 'service-001',
                facilityId: 'facility-001',
                priority: 'routine'
            }
        ]
    },

    // Elena Ferrari - paziente con prescrizioni neurologiche
    {
        patientId: PATIENT_IDS.ELENA_FERRARI,
        documents: [
            {
                _t: 'medicine_prescription',
                id: '2b3c4d5e-6f7a-4b2c-9d3e-111111111111',
                doctorId: DOCTOR_IDS.GIORGIO_COSTA,
                patientId: PATIENT_IDS.ELENA_FERRARI,
                issueDate: '2026-01-18',
                title: 'Prescrizione Sumatriptan',
                summary: 'Terapia per emicrania cronica',
                tags: ['neurologia', 'emicrania', 'cronica'],
                validity: {
                    _t: 'until_date',
                    date: '2026-04-18'
                },
                dosage: {
                    medicineId: 'med-015',
                    medicineName: 'Sumatriptan',
                    dose: { amount: 50, unit: 'mg' },
                    frequency: { timesPerPeriod: 1, period: 'episodio' },
                    duration: { length: 3, unit: 'mesi' },
                    instructions: 'Assumere alla comparsa dei primi sintomi'
                }
            },
            {
                _t: 'report',
                id: '2b3c4d5e-6f7a-4b2c-9d3e-222222222222',
                doctorId: DOCTOR_IDS.GIORGIO_COSTA,
                patientId: PATIENT_IDS.ELENA_FERRARI,
                issueDate: '2026-01-18',
                title: 'Referto Visita Neurologica',
                summary: 'Visita neurologica per cefalea',
                tags: ['neurologia', 'cefalea'],
                reportType: 'Visita neurologica',
                findings: 'Emicrania senza aura. Frequenza 2-3 episodi al mese.',
                recommendations: 'Iniziare terapia preventiva. Diario della cefalea.'
            }
        ]
    },

    // Giulia Bianchi - paziente pediatrica
    {
        patientId: PATIENT_IDS.GIULIA_BIANCHI,
        documents: [
            {
                _t: 'medicine_prescription',
                id: '3c4d5e6f-7a8b-4c3d-9e4f-111111111111',
                doctorId: DOCTOR_IDS.SARA_COLOMBO,
                patientId: PATIENT_IDS.GIULIA_BIANCHI,
                issueDate: '2026-01-22',
                title: 'Prescrizione Amoxicillina',
                summary: 'Antibiotico per infezione vie respiratorie',
                tags: ['pediatria', 'antibiotico', 'respiratorio'],
                validity: {
                    _t: 'repeatable',
                    repeatTimes: 1
                },
                dosage: {
                    medicineId: 'med-025',
                    medicineName: 'Amoxicillina',
                    dose: { amount: 500, unit: 'mg' },
                    frequency: { timesPerPeriod: 3, period: 'giorno' },
                    duration: { length: 7, unit: 'giorni' },
                    instructions: 'Assumere ogni 8 ore ai pasti'
                }
            },
            {
                _t: 'report',
                id: '3c4d5e6f-7a8b-4c3d-9e4f-222222222222',
                doctorId: DOCTOR_IDS.SARA_COLOMBO,
                patientId: PATIENT_IDS.GIULIA_BIANCHI,
                issueDate: '2026-01-22',
                title: 'Referto Visita Pediatrica',
                summary: 'Visita pediatrica per febbre e tosse',
                tags: ['pediatria', 'infezione'],
                reportType: 'Visita pediatrica',
                findings: 'Faringite acuta batterica. Febbre 38.5°C.',
                recommendations: 'Terapia antibiotica. Riposo. Controllo tra 5 giorni.'
            }
        ]
    },

    // Luca Romano - paziente ortopedico
    {
        patientId: PATIENT_IDS.LUCA_ROMANO,
        documents: [
            {
                _t: 'report',
                id: '4d5e6f7a-8b9c-4d4e-9f5a-111111111111',
                doctorId: DOCTOR_IDS.PAOLO_GRECO,
                patientId: PATIENT_IDS.LUCA_ROMANO,
                issueDate: '2026-01-10',
                title: 'Referto Visita Ortopedica Ginocchio',
                summary: 'Visita ortopedica per dolore al ginocchio destro',
                tags: ['ortopedia', 'ginocchio', 'trauma'],
                reportType: 'Visita ortopedica',
                findings: 'Lieve distorsione legamento collaterale mediale. Edema presente.',
                recommendations: 'Riposo, ghiaccio, compressione. Fisioterapia dopo 2 settimane.'
            },
            {
                _t: 'service_prescription',
                id: '4d5e6f7a-8b9c-4d4e-9f5a-222222222222',
                doctorId: DOCTOR_IDS.PAOLO_GRECO,
                patientId: PATIENT_IDS.LUCA_ROMANO,
                issueDate: '2026-01-10',
                title: 'Prescrizione RMN Ginocchio',
                summary: 'Prescrizione RMN ginocchio destro',
                tags: ['ortopedia', 'diagnostica', 'rmn'],
                validity: {
                    _t: 'until_date',
                    date: '2026-03-10'
                },
                serviceId: 'service-003',
                facilityId: 'facility-001',
                priority: 'normal'
            },
            {
                _t: 'medicine_prescription',
                id: '4d5e6f7a-8b9c-4d4e-9f5a-333333333333',
                doctorId: DOCTOR_IDS.PAOLO_GRECO,
                patientId: PATIENT_IDS.LUCA_ROMANO,
                issueDate: '2026-01-10',
                title: 'Prescrizione Ibuprofene',
                summary: 'Antinfiammatorio per distorsione ginocchio',
                tags: ['ortopedia', 'antinfiammatorio'],
                validity: {
                    _t: 'until_date',
                    date: '2026-02-10'
                },
                dosage: {
                    medicineId: 'med-030',
                    medicineName: 'Ibuprofene',
                    dose: { amount: 400, unit: 'mg' },
                    frequency: { timesPerPeriod: 3, period: 'giorno' },
                    duration: { length: 10, unit: 'giorni' },
                    instructions: 'Assumere ai pasti'
                }
            }
        ]
    },

    // Alessandro Ricci - paziente anziano con multiple patologie
    {
        patientId: PATIENT_IDS.ALESSANDRO_RICCI,
        documents: [
            {
                _t: 'medicine_prescription',
                id: '5e6f7a8b-9c0d-4e5f-9a6b-111111111111',
                doctorId: DOCTOR_IDS.FRANCESCO_VERDI,
                patientId: PATIENT_IDS.ALESSANDRO_RICCI,
                issueDate: '2025-12-15',
                title: 'Prescrizione Metformina',
                summary: 'Terapia cronica per ipertensione e diabete',
                tags: ['cardiologia', 'ipertensione', 'diabete', 'cronica'],
                validity: {
                    _t: 'until_date',
                    date: '2026-06-15'
                },
                dosage: {
                    medicineId: 'med-005',
                    medicineName: 'Metformina',
                    dose: { amount: 1000, unit: 'mg' },
                    frequency: { timesPerPeriod: 2, period: 'giorno' },
                    duration: { length: 6, unit: 'mesi' },
                    instructions: 'Assumere durante i pasti principali'
                }
            },
            {
                _t: 'report',
                id: '5e6f7a8b-9c0d-4e5f-9a6b-222222222222',
                doctorId: DOCTOR_IDS.FRANCESCO_VERDI,
                patientId: PATIENT_IDS.ALESSANDRO_RICCI,
                issueDate: '2025-12-15',
                title: 'Referto Controllo Cardiometabolico',
                summary: 'Controllo cardiologico e metabolico',
                tags: ['cardiologia', 'diabete', 'controllo'],
                reportType: 'Visita cardiologica',
                findings: 'Ipertensione e diabete tipo 2 controllati con terapia. HbA1c 6.8%.',
                recommendations: 'Continuare terapia. Dieta. Attività fisica moderata. Controllo tra 3 mesi.'
            },
            {
                _t: 'medicine_prescription',
                id: '5e6f7a8b-9c0d-4e5f-9a6b-333333333333',
                doctorId: DOCTOR_IDS.STEFANO_LOMBARDI,
                patientId: PATIENT_IDS.ALESSANDRO_RICCI,
                issueDate: '2026-01-25',
                title: 'Prescrizione Ketoconazolo Crema',
                summary: 'Crema dermatologica per dermatite seborroica',
                tags: ['dermatologia', 'dermatite'],
                validity: {
                    _t: 'repeatable',
                    repeatTimes: 2
                },
                dosage: {
                    medicineId: 'med-040',
                    medicineName: 'Ketoconazolo crema 2%',
                    dose: { amount: 1, unit: 'applicazione' },
                    frequency: { timesPerPeriod: 2, period: 'giorno' },
                    duration: { length: 14, unit: 'giorni' },
                    instructions: 'Applicare sulle zone interessate dopo detersione'
                }
            }
        ]
    },

    // Maria Conti - paziente anziana
    {
        patientId: PATIENT_IDS.MARIA_CONTI,
        documents: [
            {
                _t: 'medicine_prescription',
                id: '6f7a8b9c-0d1e-4f6a-9b7c-111111111111',
                doctorId: DOCTOR_IDS.PAOLO_GRECO,
                patientId: PATIENT_IDS.MARIA_CONTI,
                issueDate: '2026-01-12',
                title: 'Prescrizione Calcio e Vitamina D',
                summary: 'Integratore calcio e vitamina D per osteoporosi',
                tags: ['ortopedia', 'osteoporosi', 'prevenzione'],
                validity: {
                    _t: 'until_date',
                    date: '2026-07-12'
                },
                dosage: {
                    medicineId: 'med-050',
                    medicineName: 'Calcio carbonato + Vitamina D3',
                    dose: { amount: 1, unit: 'compressa' },
                    frequency: { timesPerPeriod: 1, period: 'giorno' },
                    duration: { length: 6, unit: 'mesi' },
                    instructions: 'Assumere al mattino con abbondante acqua'
                }
            },
            {
                _t: 'report',
                id: '6f7a8b9c-0d1e-4f6a-9b7c-222222222222',
                doctorId: DOCTOR_IDS.PAOLO_GRECO,
                patientId: PATIENT_IDS.MARIA_CONTI,
                issueDate: '2026-01-12',
                title: 'Referto Densitometria Ossea',
                summary: 'Controllo densitometria ossea',
                tags: ['ortopedia', 'osteoporosi', 'densitometria'],
                reportType: 'Visita ortopedica',
                findings: 'Osteoporosi moderata vertebre lombari. T-score -2.8.',
                recommendations: 'Integrazione calcio e vitamina D. Esercizio fisico regolare. Controllo MOC tra 12 mesi.'
            }
        ]
    }
];

// Insert medical records
medicalRecords.forEach(record => {
    db.medical_records.insertOne(record);
});

print(`Inserted ${medicalRecords.length} medical records`);
print("Seeding completed successfully!");
