import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

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
// TODO: Add your routes here

startServer();

// Start server
async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
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
