import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { authRoutes, userRoutes, delegationRoutes } from './api/index.js';
import { runSeeds } from './infrastructure/database/index.js';

const app = express();
const PORT = process.env.PORT || 3030;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/users_db';

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'users-service'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/delegations', delegationRoutes);

startServer();

// Start server
async function startServer() {
    await connectDB();
    await runSeeds();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
        console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
        console.log(`🤝 Delegations API: http://localhost:${PORT}/api/delegations`);
    });
}

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\n⚠️  Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});