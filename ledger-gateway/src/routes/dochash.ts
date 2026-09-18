import { Router, Request, Response } from 'express';
import { fabricService } from '../fabric';

export const dochashRouter = Router();

dochashRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const contract = fabricService.getDochashContract();
    if (!contract) {
      // Mock txId for airgap / demo mode
      const mockTx = `tx_gw_${Date.now()}`;
      return res.json({ txId: mockTx, status: 'MOCK_REGISTERED' });
    }
    const result = await contract.submitTransaction('RegisterDocument', JSON.stringify(req.body));
    return res.json({ txId: Buffer.from(result).toString('utf8'), status: 'COMMITTED' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

dochashRouter.get('/:docId', async (req: Request, res: Response) => {
  try {
    const contract = fabricService.getDochashContract();
    if (!contract) {
      return res.status(404).json({ error: 'Gateway in dev mode; use local DevLedger' });
    }
    const result = await contract.evaluateTransaction('GetDocument', req.params.docId);
    return res.json(JSON.parse(Buffer.from(result).toString('utf8')));
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});
