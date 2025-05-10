import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import deviceRoutes from './routes/deviceRoutes';

const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use('/api', deviceRoutes);

export default app;
