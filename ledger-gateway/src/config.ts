export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  peerEndpoint: process.env.PEER_ENDPOINT || 'localhost:7051',
  peerHostAlias: process.env.PEER_HOST_ALIAS || 'peer0.police.sdms.gov.in',
  tlsCertPath: process.env.TLS_CERT_PATH || './crypto/ca.crt',
  mspId: process.env.MSP_ID || 'PoliceMSP',
  certPath: process.env.CERT_PATH || './crypto/cert.pem',
  keyDirectoryPath: process.env.KEY_DIR_PATH || './crypto/keystore',
  dochashChannel: 'dochash-channel',
  accessChannel: 'access-channel',
  dochashContract: 'dochash-contract',
  accessContract: 'access-contract',
};
