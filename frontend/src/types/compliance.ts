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

export interface ForensicExhibitsSummary {
  exhibitNumber: string;
  seizureLocation: string;
  officerName: string;
}

export interface ISO27037Checklist {
  isSeizureDocumented: boolean;
  isWriteBlockerUsed: boolean;
  isBitstreamVerified: boolean;
}
