import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { config } from './config';

export async function newIdentity(): Promise<Identity> {
  if (!fs.existsSync(config.certPath)) {
    // Generate dev fallback identity
    return {
      mspId: config.mspId,
      credentials: Buffer.from('MOCK_CERTIFICATE'),
    };
  }
  const credentials = await fs.promises.readFile(config.certPath);
  return { mspId: config.mspId, credentials };
}

export async function newSigner(): Promise<Signer> {
  if (!fs.existsSync(config.keyDirectoryPath)) {
    // Dev fallback signer
    const pair = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
    return signers.newPrivateKeySigner(pair.privateKey);
  }
  const files = await fs.promises.readdir(config.keyDirectoryPath);
  const keyPath = path.resolve(config.keyDirectoryPath, files[0]);
  const privateKeyPem = await fs.promises.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}
