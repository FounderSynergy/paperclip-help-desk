import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'paperclip-help-desk-bridge' });
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Bridge API running on http://localhost:${PORT}`);
});
