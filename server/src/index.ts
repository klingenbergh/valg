import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import publicRoutes from './routes/public.js';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api', publicRoutes);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
