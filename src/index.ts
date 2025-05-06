import bodyParser from 'body-parser';
import express from 'express';
import deviceRoutes from './routes/deviceRoutes';

const app = express();
app.use(bodyParser.json());
app.use('/api', deviceRoutes);

export default app;
