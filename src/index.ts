import express from 'express';
import { PORT } from './config';
import { router } from './routes';

const app = express();
app.use(express.json());

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Las Vegas Concierge Agent running on port ${PORT}`);
});
