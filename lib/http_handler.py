"""Shared BaseHTTPRequestHandler helpers for Vercel Python functions."""

from __future__ import annotations

import json
import logging
import os
from http.server import BaseHTTPRequestHandler
from typing import Any, Optional, Tuple

logger = logging.getLogger(__name__)

# 2 MiB default — enough for typical JSON/XML payloads, blocks abuse
MAX_BODY_BYTES = int(os.environ.get("MAX_BODY_BYTES", str(2 * 1024 * 1024)))
DEBUG = os.environ.get("DEBUG", "").lower() in ("1", "true", "yes")
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    if o.strip()
]


class ApiHandler(BaseHTTPRequestHandler):
    """Base handler: body limits, CORS, JSON responses, safe errors."""

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        logger.info("%s - %s", self.address_string(), format % args)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def read_json_body(self) -> Tuple[Optional[dict], Optional[dict]]:
        """
        Read and parse JSON body.
        Returns (body, error_payload). On success error_payload is None.
        """
        try:
            content_length = int(self.headers.get("Content-Length", 0))
        except (TypeError, ValueError):
            return None, {"success": False, "error": "Invalid Content-Length"}

        if content_length < 0:
            return None, {"success": False, "error": "Invalid Content-Length"}

        if content_length > MAX_BODY_BYTES:
            return None, {
                "success": False,
                "error": f"Request body too large (max {MAX_BODY_BYTES} bytes)",
            }

        raw = self.rfile.read(content_length).decode("utf-8") if content_length else ""
        try:
            body = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            return None, {"success": False, "error": "Invalid JSON in request body"}

        if not isinstance(body, dict):
            return None, {"success": False, "error": "Request body must be a JSON object"}

        return body, None

    def send_json(self, status_code: int, data: dict) -> None:
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def send_error_json(
        self,
        status_code: int,
        error: str,
        exc: Optional[BaseException] = None,
        *,
        extra: Optional[dict] = None,
    ) -> None:
        payload: dict = {"success": False, "error": error}
        if extra:
            payload.update(extra)
        if exc is not None:
            logger.exception("%s: %s", error, exc)
            if DEBUG:
                payload["details"] = str(exc)
        self.send_json(status_code, payload)

    def _send_cors_headers(self) -> None:
        origin = self.headers.get("Origin", "")
        if "*" in ALLOWED_ORIGINS:
            allow = "*"
        elif origin and origin in ALLOWED_ORIGINS:
            allow = origin
        elif ALLOWED_ORIGINS:
            allow = ALLOWED_ORIGINS[0]
        else:
            allow = "*"

        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if allow != "*":
            self.send_header("Vary", "Origin")
