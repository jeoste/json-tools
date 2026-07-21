"""Vercel serverless function for anonymizing JSON data."""

from __future__ import annotations

import os
import sys
from datetime import datetime

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

            options = body.get("options", {}) or {}
            anonymizer = DataAnonymizer(locale=options.get("locale", "en_US"))
            result = anonymizer.anonymize_json(body["data"])

            self.send_json(
                200,
                {
                    "success": True,
                    "data": result,
                    "metadata": {"processedAt": datetime.now().isoformat()},
                },
            )
        except Exception as e:
            self.send_error_json(500, "Internal server error", e)
