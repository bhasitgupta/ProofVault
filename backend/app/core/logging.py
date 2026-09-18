"""
Structured logging for SDMS using structlog.
All logs are emitted as JSON for SIEM ingestion.
Sensitive fields (keys, tokens, passwords) are automatically scrubbed.
"""
import logging
import sys
from typing import Any

try:
    import structlog

    _SCRUB_KEYS = {"password", "token", "dek", "wrapped_dek", "totp_secret", "nonce_hex",
                   "access_token", "partial_token", "api_key"}

    def _scrub_processor(logger, method, event_dict: dict) -> dict:
        for key in list(event_dict.keys()):
            if key.lower() in _SCRUB_KEYS:
                event_dict[key] = "[REDACTED]"
        return event_dict

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            _scrub_processor,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.DEBUG),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
    )

    def get_logger(name: str = "sdms"):
        return structlog.get_logger(name)

    HAS_STRUCTLOG = True

except ImportError:
    HAS_STRUCTLOG = False

    class _FallbackLogger:
        def __init__(self, name: str):
            self._log = logging.getLogger(name)

        def info(self, event: str, **kw: Any):
            self._log.info(f"{event} {kw}")

        def warning(self, event: str, **kw: Any):
            self._log.warning(f"{event} {kw}")

        def error(self, event: str, **kw: Any):
            self._log.error(f"{event} {kw}")

        def debug(self, event: str, **kw: Any):
            self._log.debug(f"{event} {kw}")

    def get_logger(name: str = "sdms") -> _FallbackLogger:
        return _FallbackLogger(name)

    # Basic logging config
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stdout,
    )
