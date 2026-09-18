class SDMSException(Exception):
    def __init__(self, message: str, code: str = "SDMS_ERROR", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class AccessDeniedError(SDMSException):
    def __init__(self, reason: str = "Access denied"):
        super().__init__(reason, "ACCESS_DENIED", 403)


class DocumentNotFoundError(SDMSException):
    def __init__(self, doc_id: str):
        super().__init__(f"Document {doc_id} not found", "DOC_NOT_FOUND", 404)


class IntegrityError(SDMSException):
    def __init__(self, failing_check: str):
        super().__init__(f"Integrity check failed: {failing_check}", "INTEGRITY_FAIL", 409)


class LedgerCommitError(SDMSException):
    def __init__(self, detail: str):
        super().__init__(f"Ledger commit failed: {detail}", "LEDGER_ERROR", 502)
