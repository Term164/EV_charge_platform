import express from 'express';
import middleware from './utils/middleware';

// * ====================== IMPORT ALL ROUTES =======================
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import buildingsRoutes from './routes/building';
import stationRoutes from './routes/station';
import reservationRoutes from './routes/reservation';

const app = express();
app.use(express.json());

app.use(middleware.requestLogger);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/building', buildingsRoutes);
app.use('/api/v1/station', stationRoutes);
app.use('/api/v1/reservation', reservationRoutes);

app.use(middleware.unknownEndpoints);
app.use(middleware.errorHandler);

export default app;

// const result = await connection.query(
//     'SELECT * FROM public.accounts'
// );
// console.log(result.rows);