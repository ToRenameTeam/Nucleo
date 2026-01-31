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

const generateUUID = () => crypto.randomUUID();

// Pre-generated UUIDs for consistency
export const USER_IDS = {
    MARIO_ROSSI: generateUUID(),
    GIULIA_BIANCHI: generateUUID(),
    FRANCESCO_VERDI: generateUUID(),
    ELENA_FERRARI: generateUUID(),
    LUCA_ROMANO: generateUUID(),
    SARA_COLOMBO: generateUUID(),
    ALESSANDRO_RICCI: generateUUID(),
    ANNA_MARINO: generateUUID(),
    PAOLO_GRECO: generateUUID(),
    CHIARA_BRUNO: generateUUID(),
    ROBERTO_GALLO: generateUUID(),
    MARIA_CONTI: generateUUID(),
    GIORGIO_COSTA: generateUUID(),
    VALENTINA_MANCINI: generateUUID(),
    STEFANO_LOMBARDI: generateUUID(),
};

export const userSeeds: UserSeed [] = [
    {
        userId: USER_IDS.MARIO_ROSSI,
        fiscalCode: 'RSSMRA85M01H501Z',
        password: 'Password123!',
        name: 'Mario',
        lastName: 'Rossi',
        dateOfBirth: '1985-08-01',
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
        userId: USER_IDS.ELENA_FERRARI,
        fiscalCode: 'FRRLNE88R62D612W',
        password: 'Elena2024!',
        name: 'Elena',
        lastName: 'Ferrari',
        dateOfBirth: '1988-10-22',
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
        userId: USER_IDS.MARIA_CONTI,
        fiscalCode: 'CNTMRA60T70D612O',
        password: 'Maria1960#Secure',
        name: 'Maria',
        lastName: 'Conti',
        dateOfBirth: '1960-12-30',
    },

    {
        userId: USER_IDS.VALENTINA_MANCINI,
        fiscalCode: 'MNCVNT93S52F205M',
        password: 'Valentina@2024',
        name: 'Valentina',
        lastName: 'Mancini',
        dateOfBirth: '1993-11-12',
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
];
