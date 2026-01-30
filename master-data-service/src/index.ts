import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { serviceCatalogRoutes, facilityRoutes } from './api/index.js';
import { runSeeds } from './infrastructure/database/index.js';

const app = express();
const PORT = process.env.PORT || 3040;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/master_data_db';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'master-data-service'
    });
});

// Routes
app.use('/api/service-catalog', serviceCatalogRoutes);
app.use('/api/facilities', facilityRoutes);

startServer();

// Start server
async function startServer() {
    await connectDB();
    await runSeeds();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Service Catalog API: http://localhost:${PORT}/api/service-catalog`);
        console.log(`Facilities API: http://localhost:${PORT}/api/facilities`);
    });
}

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
