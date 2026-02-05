import type { IMedicine } from '../../../domains/medicine/index.js';
import { MedicineCategory } from '../../../domains/medicine/index.js';

type MedicineSeed = Omit<IMedicine, 'createdAt' | 'updatedAt'>;

export const medicineSeeds: MedicineSeed[] = [
    // Analgesici
    {
        _id: 'medicine-001',
        code: 'medicine-001',
        name: 'Tachipirina',
        description: 'Farmaco antipiretico e analgesico a base di paracetamolo',
        category: MedicineCategory.ANALGESICO,
        activeIngredient: 'Paracetamolo',
        dosageForm: 'Compresse',
        strength: '1000mg',
        manufacturer: 'Angelini Pharma',
        isActive: true
    },
    {
        _id: 'medicine-002',
        code: 'medicine-002',
        name: 'Efferalgan',
        description: 'Paracetamolo effervescente per il trattamento del dolore e della febbre',
        category: MedicineCategory.ANALGESICO,
        activeIngredient: 'Paracetamolo',
        dosageForm: 'Compresse effervescenti',
        strength: '500mg',
        manufacturer: 'UPSA',
        isActive: true
    },
    {
        _id: 'medicine-003',
        code: 'medicine-003',
        name: 'Brufen',
        description: 'Antinfiammatorio non steroideo per dolori e infiammazioni',
        category: MedicineCategory.ANTINFIAMMATORIO,
        activeIngredient: 'Ibuprofene',
        dosageForm: 'Compresse rivestite',
        strength: '400mg',
        manufacturer: 'Mylan',
        isActive: true
    },

    // Antibiotici
    {
        _id: 'medicine-004',
        code: 'medicine-004',
        name: 'Augmentin',
        description: 'Antibiotico ad ampio spettro per infezioni batteriche',
        category: MedicineCategory.ANTIBIOTICO,
        activeIngredient: 'Amoxicillina + Acido clavulanico',
        dosageForm: 'Compresse rivestite',
        strength: '875mg/125mg',
        manufacturer: 'GlaxoSmithKline',
        isActive: true
    },
    {
        _id: 'medicine-005',
        code: 'medicine-005',
        name: 'Ciproxin',
        description: 'Antibiotico fluorochinolonico per infezioni batteriche',
        category: MedicineCategory.ANTIBIOTICO,
        activeIngredient: 'Ciprofloxacina',
        dosageForm: 'Compresse rivestite',
        strength: '500mg',
        manufacturer: 'Bayer',
        isActive: true
    },
    {
        _id: 'medicine-006',
        code: 'medicine-006',
        name: 'Zimox',
        description: 'Antibiotico per infezioni delle vie respiratorie e urinarie',
        category: MedicineCategory.ANTIBIOTICO,
        activeIngredient: 'Amoxicillina',
        dosageForm: 'Capsule',
        strength: '500mg',
        manufacturer: 'Pfizer',
        isActive: true
    },

    // Cardiovascolari
    {
        _id: 'medicine-007',
        code: 'medicine-007',
        name: 'Cardioaspirin',
        description: 'Aspirina a basso dosaggio per prevenzione cardiovascolare',
        category: MedicineCategory.CARDIOVASCOLARE,
        activeIngredient: 'Acido acetilsalicilico',
        dosageForm: 'Compresse gastroresistenti',
        strength: '100mg',
        manufacturer: 'Bayer',
        isActive: true
    },
    {
        _id: 'medicine-008',
        code: 'medicine-008',
        name: 'Triatec',
        description: 'ACE inibitore per il trattamento dell\'ipertensione',
        category: MedicineCategory.CARDIOVASCOLARE,
        activeIngredient: 'Ramipril',
        dosageForm: 'Compresse',
        strength: '5mg',
        manufacturer: 'Sanofi',
        isActive: true
    },
    {
        _id: 'medicine-009',
        code: 'medicine-009',
        name: 'Norvasc',
        description: 'Calcio antagonista per ipertensione e angina',
        category: MedicineCategory.CARDIOVASCOLARE,
        activeIngredient: 'Amlodipina',
        dosageForm: 'Compresse',
        strength: '10mg',
        manufacturer: 'Pfizer',
        isActive: true
    },

    // Gastrointestinali
    {
        _id: 'medicine-010',
        code: 'medicine-010',
        name: 'Lucen',
        description: 'Inibitore di pompa protonica per reflusso gastroesofageo',
        category: MedicineCategory.GASTROINTESTINALE,
        activeIngredient: 'Esomeprazolo',
        dosageForm: 'Capsule gastroresistenti',
        strength: '20mg',
        manufacturer: 'AstraZeneca',
        isActive: true
    },
    {
        _id: 'medicine-011',
        code: 'medicine-011',
        name: 'Pantorc',
        description: 'Inibitore di pompa protonica per ulcere e gastrite',
        category: MedicineCategory.GASTROINTESTINALE,
        activeIngredient: 'Pantoprazolo',
        dosageForm: 'Compresse gastroresistenti',
        strength: '40mg',
        manufacturer: 'Takeda',
        isActive: true
    },
    {
        _id: 'medicine-012',
        code: 'medicine-012',
        name: 'Imodium',
        description: 'Antidiarroico per il trattamento della diarrea acuta',
        category: MedicineCategory.GASTROINTESTINALE,
        activeIngredient: 'Loperamide',
        dosageForm: 'Capsule',
        strength: '2mg',
        manufacturer: 'Johnson & Johnson',
        isActive: true
    },

    // Respiratori
    {
        _id: 'medicine-013',
        code: 'medicine-013',
        name: 'Ventolin',
        description: 'Broncodilatatore per asma e bronchite',
        category: MedicineCategory.RESPIRATORIO,
        activeIngredient: 'Salbutamolo',
        dosageForm: 'Spray per inalazione',
        strength: '100mcg/dose',
        manufacturer: 'GlaxoSmithKline',
        isActive: true
    },
    {
        _id: 'medicine-014',
        code: 'medicine-014',
        name: 'Fluimucil',
        description: 'Mucolitico per affezioni delle vie respiratorie',
        category: MedicineCategory.RESPIRATORIO,
        activeIngredient: 'Acetilcisteina',
        dosageForm: 'Bustine granulato',
        strength: '600mg',
        manufacturer: 'Zambon',
        isActive: true
    },
    {
        _id: 'medicine-015',
        code: 'medicine-015',
        name: 'Seretide',
        description: 'Combinazione corticosteroide e broncodilatatore per asma',
        category: MedicineCategory.RESPIRATORIO,
        activeIngredient: 'Fluticasone + Salmeterolo',
        dosageForm: 'Diskus inalatore',
        strength: '250/50mcg',
        manufacturer: 'GlaxoSmithKline',
        isActive: true
    },

    // Neurologici
    {
        _id: 'medicine-016',
        code: 'medicine-016',
        name: 'Xanax',
        description: 'Ansiolitico benzodiazepinico per disturbi d\'ansia',
        category: MedicineCategory.NEUROLOGICO,
        activeIngredient: 'Alprazolam',
        dosageForm: 'Compresse',
        strength: '0.5mg',
        manufacturer: 'Pfizer',
        isActive: true
    },
    {
        _id: 'medicine-017',
        code: 'medicine-017',
        name: 'Lexotan',
        description: 'Ansiolitico per stati di ansia e tensione',
        category: MedicineCategory.NEUROLOGICO,
        activeIngredient: 'Bromazepam',
        dosageForm: 'Compresse',
        strength: '3mg',
        manufacturer: 'Roche',
        isActive: true
    },
    {
        _id: 'medicine-018',
        code: 'medicine-018',
        name: 'Depakin',
        description: 'Antiepilettico per il trattamento dell\'epilessia',
        category: MedicineCategory.NEUROLOGICO,
        activeIngredient: 'Acido valproico',
        dosageForm: 'Compresse a rilascio prolungato',
        strength: '500mg',
        manufacturer: 'Sanofi',
        isActive: true
    },

    // Vitamine
    {
        _id: 'medicine-019',
        code: 'medicine-019',
        name: 'Dibase',
        description: 'Integratore di vitamina D per carenze vitaminiche',
        category: MedicineCategory.VITAMINE,
        activeIngredient: 'Colecalciferolo',
        dosageForm: 'Gocce orali',
        strength: '10000 UI/ml',
        manufacturer: 'Abiogen Pharma',
        isActive: true
    },
    {
        _id: 'medicine-020',
        code: 'medicine-020',
        name: 'Dobetin',
        description: 'Vitamina B12 per anemia e carenze vitaminiche',
        category: MedicineCategory.VITAMINE,
        activeIngredient: 'Cianocobalamina',
        dosageForm: 'Fiale iniettabili',
        strength: '5000mcg',
        manufacturer: 'Teofarma',
        isActive: true
    },
    {
        _id: 'medicine-021',
        code: 'medicine-021',
        name: 'Cebion',
        description: 'Vitamina C per rafforzare le difese immunitarie',
        category: MedicineCategory.VITAMINE,
        activeIngredient: 'Acido ascorbico',
        dosageForm: 'Compresse masticabili',
        strength: '500mg',
        manufacturer: 'Bracco',
        isActive: true
    },

    // Dermatologici
    {
        _id: 'medicine-022',
        code: 'medicine-022',
        name: 'Gentalyn Beta',
        description: 'Crema antibiotica e corticosteroide per infezioni cutanee',
        category: MedicineCategory.DERMATOLOGICO,
        activeIngredient: 'Gentamicina + Betametasone',
        dosageForm: 'Crema',
        strength: '0.1% + 0.1%',
        manufacturer: 'MSD',
        isActive: true
    },
    {
        _id: 'medicine-023',
        code: 'medicine-023',
        name: 'Canesten',
        description: 'Antimicotico per infezioni fungine della pelle',
        category: MedicineCategory.DERMATOLOGICO,
        activeIngredient: 'Clotrimazolo',
        dosageForm: 'Crema',
        strength: '1%',
        manufacturer: 'Bayer',
        isActive: true
    },
    {
        _id: 'medicine-024',
        code: 'medicine-024',
        name: 'Dermovate',
        description: 'Corticosteroide potente per dermatiti severe',
        category: MedicineCategory.DERMATOLOGICO,
        activeIngredient: 'Clobetasolo',
        dosageForm: 'Crema',
        strength: '0.05%',
        manufacturer: 'GlaxoSmithKline',
        isActive: true
    },

    // Antivirali
    {
        _id: 'medicine-025',
        code: 'medicine-025',
        name: 'Zovirax',
        description: 'Antivirale per herpes simplex e varicella',
        category: MedicineCategory.ANTIVIRALE,
        activeIngredient: 'Aciclovir',
        dosageForm: 'Compresse',
        strength: '400mg',
        manufacturer: 'GlaxoSmithKline',
        isActive: true
    },
    {
        _id: 'medicine-026',
        code: 'medicine-026',
        name: 'Tamiflu',
        description: 'Antivirale per il trattamento dell\'influenza',
        category: MedicineCategory.ANTIVIRALE,
        activeIngredient: 'Oseltamivir',
        dosageForm: 'Capsule',
        strength: '75mg',
        manufacturer: 'Roche',
        isActive: true
    },

    // Antinfiammatori
    {
        _id: 'medicine-027',
        code: 'medicine-027',
        name: 'Voltaren',
        description: 'Antinfiammatorio non steroideo per dolori articolari',
        category: MedicineCategory.ANTINFIAMMATORIO,
        activeIngredient: 'Diclofenac',
        dosageForm: 'Compresse gastroresistenti',
        strength: '50mg',
        manufacturer: 'Novartis',
        isActive: true
    },
    {
        _id: 'medicine-028',
        code: 'medicine-028',
        name: 'Oki',
        description: 'Antinfiammatorio per dolori di varia natura',
        category: MedicineCategory.ANTINFIAMMATORIO,
        activeIngredient: 'Ketoprofene',
        dosageForm: 'Bustine granulato',
        strength: '80mg',
        manufacturer: 'Dompé',
        isActive: true
    },
    {
        _id: 'medicine-029',
        code: 'medicine-029',
        name: 'Deltacortene',
        description: 'Corticosteroide per infiammazioni e allergie',
        category: MedicineCategory.ANTINFIAMMATORIO,
        activeIngredient: 'Prednisone',
        dosageForm: 'Compresse',
        strength: '25mg',
        manufacturer: 'Bruno Farmaceutici',
        isActive: true
    },

    // Altro
    {
        _id: 'medicine-030',
        code: 'medicine-030',
        name: 'Enterogermina',
        description: 'Probiotico per il ripristino della flora intestinale',
        category: MedicineCategory.ALTRO,
        activeIngredient: 'Bacillus clausii',
        dosageForm: 'Flaconcini',
        strength: '2 miliardi di spore',
        manufacturer: 'Sanofi',
        isActive: true
    }
];
