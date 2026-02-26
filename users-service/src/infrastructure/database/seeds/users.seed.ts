import crypto from 'crypto';

interface UserSeed {
    userId: string;
    fiscalCode: string;
    password: string;
    name: string;
    lastName: string;
    dateOfBirth: string;
    doctor?: {
        medicalLicenseNumber: string;
        specializations: string[];
    };
}

// Hardcoded UUIDs for consistency across services
export const USER_IDS = {
    MARIO_ROSSI: 'c5d33946-678f-4f3a-a0d6-b3d40eee4a97',
    GIULIA_BIANCHI: '3ba5e003-a3d6-4c9c-9b67-db1388b9b5f9',
    ELENA_FERRARI: 'ccce3cb4-8c3f-467c-9814-7a9076f60ae1',
    LUCA_ROMANO: '61f38542-ccd6-44ee-acbb-eb72d6824b05',
    ALESSANDRO_RICCI: 'a5ca3979-1359-4a17-b81f-eac3e36064bc',
    MARIA_CONTI: 'aeb4d41d-c6d1-4784-997e-b06cc62df64b',
    ANNA_MARINO: '8f2b4d7e-9c3a-4e1b-a5d6-7c8e9f0a1b2c',
    CHIARA_BRUNO: '7a1c3e5f-8d4b-4a2c-9e6f-1b3d5a7c9e0b',
    ROBERTO_GALLO: '6b2d4a8c-7e5f-4c3d-8a9e-2c4e6b8d0a1f',
    VALENTINA_MANCINI: '9c3e5a7b-6f4d-4e2a-7c9b-3e5a7c9b1d3f',
    GIORGIO_COSTA: 'c225b306-63de-4e82-af11-76e8ed3f5926',
    STEFANO_LOMBARDI: '1cac71a0-c761-4ea8-b378-8eab4731c524',
    PAOLO_GRECO: '417bf5ac-9fd3-43ca-a160-775b6463eebc',
    FRANCESCO_VERDI: 'f0aa4140-8d57-425d-b880-e8cf2008f265',
    SARA_COLOMBO: '5eab37f0-1d7b-4ded-a7bd-6676b195231a',
};

export const userSeeds: UserSeed[] = [
    // PAZIENTI (NON DOTTORI)
    {
        userId: USER_IDS.MARIO_ROSSI,
        fiscalCode: 'RSSMRA85M01H501Z',
        password: 'Password123!',
        name: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1985-08-01',
    },
    {
        userId: USER_IDS.ELENA_FERRARI,
        fiscalCode: 'FRRLNE88R62D612W',
        password: 'Elena2024!',
        name: 'Elena',
        lastName: 'Ferrari',
        dateOfBirth: '1988-10-22',
    },
    {
        userId: USER_IDS.GIULIA_BIANCHI,
        fiscalCode: 'BNCGLI90D45F205X',
        password: 'Secure456!',
        name: 'Giulia',
        lastName: 'Bianchi',
        dateOfBirth: '1990-04-05',
    },
    {
        userId: USER_IDS.LUCA_ROMANO,
        fiscalCode: 'RMNLCU92L18H501V',
        password: 'Luca!Pass1',
        name: 'Luca',
        lastName: 'Romano',
        dateOfBirth: '1992-07-18',
    },
    {
        userId: USER_IDS.ALESSANDRO_RICCI,
        fiscalCode: 'RCCLSN55H21L219T',
        password: 'Alessandro1955!',
        name: 'Alessandro',
        lastName: 'Ricci',
        dateOfBirth: '1955-06-21',
    },
    {
        userId: USER_IDS.MARIA_CONTI,
        fiscalCode: 'CNTMRA60T70D612O',
        password: 'Maria1960#Secure',
        name: 'Maria',
        lastName: 'Conti',
        dateOfBirth: '1960-12-30',
    },
    {
        userId: USER_IDS.ANNA_MARINO,
        fiscalCode: 'MRNNNA95E47D612S',
        password: 'Anna@Secure95',
        name: 'Anna',
        lastName: 'Marino',
        dateOfBirth: '1995-05-07',
    },
    {
        userId: USER_IDS.CHIARA_BRUNO,
        fiscalCode: 'BRNCHR91M48F205Q',
        password: 'Chiara2024#',
        name: 'Chiara',
        lastName: 'Bruno',
        dateOfBirth: '1991-08-08',
    },
    {
        userId: USER_IDS.ROBERTO_GALLO,
        fiscalCode: 'GLLRRT87D23L219P',
        password: 'Roberto!87Pass',
        name: 'Roberto',
        lastName: 'Gallo',
        dateOfBirth: '1987-04-23',
    },
    {
        userId: USER_IDS.VALENTINA_MANCINI,
        fiscalCode: 'MNCVNT93S52F205M',
        password: 'Valentina@2024',
        name: 'Valentina',
        lastName: 'Mancini',
        dateOfBirth: '1993-11-12',
    },
    
    // DOTTORI
    {
        userId: USER_IDS.FRANCESCO_VERDI,
        fiscalCode: 'VRDFNC78C15L219Y',
        password: 'Doctor789!',
        name: 'Francesco',
        lastName: 'Verdi',
        dateOfBirth: '1978-03-15',
        doctor: {
            medicalLicenseNumber: 'MED-2003-001234',
            specializations: ['Cardiologia', 'Medicina Interna'],
        },
    },
    {
        userId: USER_IDS.PAOLO_GRECO,
        fiscalCode: 'GRCPLA75B12H501R',
        password: 'Paolo!Doctor75',
        name: 'Paolo',
        lastName: 'Greco',
        dateOfBirth: '1975-02-12',
        doctor: {
            medicalLicenseNumber: 'MED-2001-009012',
            specializations: ['Ortopedia', 'Traumatologia'],
        },
    },
    {
        userId: USER_IDS.GIORGIO_COSTA,
        fiscalCode: 'CSTGRG80A15H501N',
        password: 'Giorgio!Neuro80',
        name: 'Giorgio',
        lastName: 'Costa',
        dateOfBirth: '1980-01-15',
        doctor: {
            medicalLicenseNumber: 'MED-2006-003456',
            specializations: ['Neurologia'],
        },
    },
    {
        userId: USER_IDS.STEFANO_LOMBARDI,
        fiscalCode: 'LMBSTF82P09L219L',
        password: 'Stefano#Derm82',
        name: 'Stefano',
        lastName: 'Lombardi',
        dateOfBirth: '1982-09-09',
        doctor: {
            medicalLicenseNumber: 'MED-2009-007890',
            specializations: ['Dermatologia', 'Venereologia'],
        },
    },
    {
        userId: USER_IDS.SARA_COLOMBO,
        fiscalCode: 'CLMSRA83T49F205U',
        password: 'Sara#Med2024',
        name: 'Sara',
        lastName: 'Colombo',
        dateOfBirth: '1983-12-09',
        doctor: {
            medicalLicenseNumber: 'MED-2008-005678',
            specializations: ['Pediatria'],
        },
    },
];
