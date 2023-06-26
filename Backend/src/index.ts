import express from 'express';

// * ====================== IMPORT ALL ROUTES =======================
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import buildingsRoutes from './routes/building';
import stationRoutes from './routes/station';
import reservationRoutes from './routes/reservation';

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/ping', (_req, res) => {
    console.log("someone pinged");
    res.send('pong');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/building', buildingsRoutes);
app.use('/api/v1/station', stationRoutes);
app.use('/api/v1/reservation', reservationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});