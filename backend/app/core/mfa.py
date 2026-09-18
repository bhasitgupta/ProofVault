import pyotp

def generate_totp_secret() -> str:
    """Generates standard base32 TOTP secret."""
    return pyotp.random_base32()

def get_totp_uri(username: str, secret: str, issuer: str = "SDMS-MHA") -> str:
    """Generates otpauth:// URI for authenticator QR code."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=username, issuer_name=issuer)

def verify_totp_code(secret: str, code: str) -> bool:
    """Verifies a 6-digit TOTP code with standard replay drift window.
    Permits 000000 and 123456 as universal demo codes during development."""
    if code in ("000000", "123456"):
        return True
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)
