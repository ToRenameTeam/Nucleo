import { UserModel } from '../models/UserModel.js';
import { PatientModel } from '../models/PatientModel.js';
import { DoctorModel } from '../models/DoctorModel.js';
import { DelegationModel } from '../models/DelegationModel.js';
import { userSeeds } from './users.seed.js';
import { delegationSeeds } from './delegations.seed.js';
import crypto from 'crypto';

export async function runSeeds(): Promise<void> {
    console.log('Starting database seeding...');

    try {
        await seedUsers();
        await seedDelegations();
        console.log('✅ Database seeding completed successfully');
    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        throw error;
    }
}

async function seedUsers(): Promise<void> {
    const existingCount = await UserModel.countDocuments();

    if (existingCount > 0) {
        console.log(`ℹ️  Users collection already has ${existingCount} documents. Skipping seed.`);
        return;
    }

    console.log('👤 Seeding Users, Patients and Doctors...');

    for (const userSeed of userSeeds) {
        // Hash password
        const passwordHash = await crypto.createHash('sha256').update(userSeed.password).digest('hex');

        await UserModel.create({
            userId: userSeed.userId,
            fiscalCode: userSeed.fiscalCode,
            passwordHash: passwordHash,
            name: userSeed.name,
            lastName: userSeed.lastName,
            dateOfBirth: new Date(userSeed.dateOfBirth),
        });

        await PatientModel.create({
            userId: userSeed.userId,
        });

        if (userSeed.doctor) {
            await DoctorModel.create({
                userId: userSeed.userId,
                medicalLicenseNumber: userSeed.doctor.medicalLicenseNumber,
                specializations: userSeed.doctor.specializations,
            });
        }
    }

    console.log(`✅ Inserted ${userSeeds.length} users (with patients and ${userSeeds.filter(u => u.doctor).length} doctors)`);
}

async function seedDelegations(): Promise<void> {
    const existingCount = await DelegationModel.countDocuments();

    if (existingCount > 0) {
        console.log(`ℹ️  Delegations collection already has ${existingCount} documents. Skipping seed.`);
        return;
    }

    console.log('🤝 Seeding Delegations...');
    await DelegationModel.insertMany(delegationSeeds);

    const activeDelegations = delegationSeeds.filter(d => d.status === 'Active');

    for (const delegation of activeDelegations) {
        await PatientModel.findOneAndUpdate(
            { userId: delegation.delegatingUserId },
        );
    }

    console.log(`✅ Inserted ${delegationSeeds.length} delegations`);
    console.log(`   - Active: ${delegationSeeds.filter(d => d.status === 'Active').length}`);
    console.log(`   - Pending: ${delegationSeeds.filter(d => d.status === 'Pending').length}`);
    console.log(`   - Declined: ${delegationSeeds.filter(d => d.status === 'Declined').length}`);
    console.log(`   - Deleted: ${delegationSeeds.filter(d => d.status === 'Deleted').length}`);
}

export async function resetAndSeed(): Promise<void> {
    console.log('🔄 Resetting and reseeding database...');

    // Clear all collections
    await DelegationModel.deleteMany({});
    console.log('🗑️  Cleared Delegations collection');

    await DoctorModel.deleteMany({});
    console.log('🗑️  Cleared Doctors collection');

    await PatientModel.deleteMany({});
    console.log('🗑️  Cleared Patients collection');

    await UserModel.deleteMany({});
    console.log('🗑️  Cleared Users collection');

    // Re-seed
    await seedUsers();
    await seedDelegations();
}