"""Vercel serverless function for analyzing JSON data for sensitive fields."""

from __future__ import annotations

import os
import sys

lib_path = os.path.join(os.path.dirname(__file__), "..", "lib")
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from data_anonymizer import DataAnonymizer  # noqa: E402
from http_handler import ApiHandler  # noqa: E402


class handler(ApiHandler):
    def do_POST(self):
        body, err = self.read_json_body()
        if err:
            self.send_json(400, err)
            return

        try:
            if "data" not in body:
                self.send_json(400, {"success": False, "error": "Missing required field: data"})
                return

            anonymizer = DataAnonymizer()
            sensitive_fields = anonymizer.get_sensitive_fields(body["data"])

            self.send_json(
                200,
                {
                    "success": True,
                    "sensitiveFields": sensitive_fields,
                    "totalFields": len(sensitive_fields),
                },
            )
        except Exception as e:
            self.send_error_json(500, "Internal server error", e)
