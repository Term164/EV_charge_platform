import express from 'express';
import middleware from './utils/middleware';
import cors from 'cors';

// * ====================== IMPORT ALL ROUTES =======================
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import buildingsRoutes from './routes/building';
import stationRoutes from './routes/station';
import reservationRoutes from './routes/reservation';
import devRoutes from './routes/dev';
import fileUpload from 'express-fileupload';


// !IMPORTANT: The sequence of middleware and api endpoints is important
// ! Do not change the sequence unless you know what you are doing.

const app = express();
app.use(fileUpload());
app.use(express.json());

app.use(cors());

app.use(middleware.requestLogger);

app.use('/api/v1/auth', authRoutes);
app.use(middleware.sessionChecker);
app.use(middleware.authorizationChecker);
app.use('/api/v1/dev', devRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/building', buildingsRoutes);
app.use('/api/v1/station', stationRoutes);
app.use('/api/v1/reservation', reservationRoutes);

app.use(middleware.unknownEndpoints);
app.use(middleware.errorHandler);

export default app;