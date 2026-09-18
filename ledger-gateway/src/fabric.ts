import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Network } from '@hyperledger/fabric-gateway';
import { config } from './config';
import { newIdentity, newSigner } from './identity';

export class FabricGatewayService {
  private gateway: Gateway | null = null;
  private dochashNetwork: Network | null = null;
  private accessNetwork: Network | null = null;

  async init(): Promise<void> {
    try {
      const client = new grpc.Client(
        config.peerEndpoint,
        grpc.credentials.createInsecure()
      );

      this.gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
      });

      this.dochashNetwork = this.gateway.getNetwork(config.dochashChannel);
      this.accessNetwork = this.gateway.getNetwork(config.accessChannel);
    } catch {
      // Offline / dev fallback handled by route controllers
      this.gateway = null;
    }
  }

  getDochashContract(): Contract | null {
    return this.dochashNetwork ? this.dochashNetwork.getContract(config.dochashContract) : null;
  }

  getAccessContract(): Contract | null {
    return this.accessNetwork ? this.accessNetwork.getContract(config.accessContract) : null;
  }
}

export const fabricService = new FabricGatewayService();
