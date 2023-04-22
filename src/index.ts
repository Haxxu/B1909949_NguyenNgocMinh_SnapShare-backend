import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import errorHandler from './middlewares/errorHandler';
import routes from './routes';
import database from './config/database';

console.log('\n\n--------------------------------------');

// console.log(new Date());
console.log('\n\n--------------------------------------');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

database.connect(process.env.DATABASE_URL);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Apply Router
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

// Listen
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
