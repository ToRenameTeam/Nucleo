import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    // Create and connect to the in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
}, 60000); // 60 seconds timeout for setup, in case MongoDB takes time to start

afterAll(async () => {
    // Disconnect and stop the in-memory MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear all collections after each test to ensure test isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key]!.deleteMany({});
    }
});
