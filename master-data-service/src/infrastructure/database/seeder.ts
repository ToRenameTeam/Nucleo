import { ServiceTypeModel } from '../../domains/service-catalog/index.js';
import { serviceTypeSeeds } from './seeds/index.js';

export async function runSeeds(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
        await seedServiceTypes();
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

export async function resetAndSeed(): Promise<void> {
    console.log('Resetting and reseeding database...');

    await ServiceTypeModel.deleteMany({});
    console.log('Cleared ServiceTypes collection');

    await seedServiceTypes();
}
