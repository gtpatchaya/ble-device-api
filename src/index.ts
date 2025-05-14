import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import './config/passport'; // Import passport config
import authRoutes from './routes/auth.route';
import deviceRoutes from './routes/device.route';
import deviceUserRoutes from './routes/deviceUserRoutes';
import userRoutes from './routes/user.route';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/device-user', deviceUserRoutes);

export default app;
