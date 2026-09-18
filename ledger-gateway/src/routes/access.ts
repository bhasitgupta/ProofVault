import { Router, Request, Response } from 'express';
import { fabricService } from '../fabric';

export const accessRouter = Router();

accessRouter.post('/events', async (req: Request, res: Response) => {
  try {
    const contract = fabricService.getAccessContract();
    if (!contract) {
      const mockTx = `tx_evt_gw_${Date.now()}`;
      return res.json({ txId: mockTx, status: 'MOCK_COMMITTED' });
    }
    const result = await contract.submitTransaction('AppendEvent', JSON.stringify(req.body));
    return res.json({ txId: Buffer.from(result).toString('utf8'), status: 'COMMITTED' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

accessRouter.get('/timeline/:caseId', async (req: Request, res: Response) => {
  try {
    const contract = fabricService.getAccessContract();
    if (!contract) {
      return res.json([]);
    }
    const result = await contract.evaluateTransaction('GetEventsByCase', req.params.caseId);
    return res.json(JSON.parse(Buffer.from(result).toString('utf8')));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
