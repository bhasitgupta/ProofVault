import express from 'express';
import cors from 'cors';
import { config } from './config';
import { fabricService } from './fabric';
import { dochashRouter } from './routes/dochash';
import { accessRouter } from './routes/access';
import { healthRouter } from './routes/health';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/dochash', dochashRouter);
app.use('/access', accessRouter);

async function bootstrap() {
  await fabricService.init();
  app.listen(config.port, () => {
    console.log(`[✓] Ledger Gateway listening on port ${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('[!] Failed to bootstrap ledger gateway:', err);
});
