export interface BSACertificatePayload {
  statute: string;
  section: string;
  certificateId: string;
  certifiedAt: string;
}

export interface IEA65BFormAPayload {
  act: string;
  deviceIdentifier: string;
  hashDigest: string;
  attestationDate: string;
}
