import express from 'express';
import { Connection } from 'postgresql-client';
import config from './utils/config';
import middleware from './utils/middleware';

// * ====================== IMPORT ALL ROUTES =======================
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import buildingsRoutes from './routes/building';
import stationRoutes from './routes/station';
import reservationRoutes from './routes/reservation';

async function test () {
    const connection = new Connection({
        host: config.SQL_HOST,
        user: config.SQL_USER,
        password: config.SQL_PASS,
        database: config.SQL_DB,
        ssl: {}
    });
    await connection.connect();

    const result = await connection.query(
        'SELECT * FROM public.accounts'
    );
    console.log(result.rows);

    await connection.close();
}

void test();




const app = express();
app.use(express.json());

app.get('/ping', (_req, res) => {
    console.log("someone pinged");
    res.send('pong');
});

//app.use(middleware.requestLogger);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/building', buildingsRoutes);
app.use('/api/v1/station', stationRoutes);
app.use('/api/v1/reservation', reservationRoutes);

export default app;