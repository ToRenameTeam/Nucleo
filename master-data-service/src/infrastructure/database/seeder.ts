import { ServiceTypeModel } from '../../domains/service-catalog/index.js';
import { FacilityModel } from '../../domains/facility/index.js';
import { serviceTypeSeeds, facilitySeeds } from './seeds/index.js';

export async function runSeeds(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
        await seedServiceTypes();
        await seedFacilities();
        console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Error during database seeding:', error);
        throw error;
    }
}

async function seedServiceTypes(): Promise<void> {
    const existingCount = await ServiceTypeModel.countDocuments();

    if (existingCount > 0) {
        console.log(`ServiceTypes collection already has ${existingCount} documents. Skipping seed.`);
        return;
    }

    console.log('Seeding ServiceTypes collection...');

    const result = await ServiceTypeModel.insertMany(serviceTypeSeeds);
    console.log(`Inserted ${result.length} service types`);
}

async function seedFacilities(): Promise<void> {
    const existingCount = await FacilityModel.countDocuments();

    if (existingCount > 0) {
        console.log(`Facilities collection already has ${existingCount} documents. Skipping seed.`);
        return;
    }

    console.log('Seeding Facilities collection...');

    const result = await FacilityModel.insertMany(facilitySeeds);
    console.log(`Inserted ${result.length} facilities`);
}

export async function resetAndSeed(): Promise<void> {
    console.log('Resetting and reseeding database...');

    await ServiceTypeModel.deleteMany({});
    console.log('Cleared ServiceTypes collection');

    await FacilityModel.deleteMany({});
    console.log('Cleared Facilities collection');

    await seedServiceTypes();
    await seedFacilities();
}
