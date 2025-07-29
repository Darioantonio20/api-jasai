import express, { Express } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middlewares/errorHandler';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();

// Body parser
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT as string;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('🔴 Error:', err.message);
  server.close(() => process.exit(1));
});