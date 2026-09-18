import { Router, Request, Response } from 'express';
import { fabricService } from '../fabric';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'ledger-gateway',
    fabricConnected: fabricService.getDochashContract() !== null,
    timestamp: new Date().toISOString(),
  });
});
