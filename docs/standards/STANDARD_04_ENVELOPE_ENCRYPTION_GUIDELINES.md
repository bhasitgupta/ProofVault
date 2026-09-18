# Standard 04: Envelope Encryption Guidelines

### 4.1 Threat Context

Protects raw evidence stored at rest on S3/MinIO/local disk.

### 4.2 Key Hierarchy

- Master Key (KEK): Stored in AWS KMS or HashiCorp Vault.

- Data Encryption Key (DEK): Ephemeral 256-bit AES-GCM key.

### 4.3 Authenticated Additional Data (AAD)
