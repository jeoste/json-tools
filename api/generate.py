"""Vercel serverless function for generating JSON data from skeleton."""

from __future__ import annotations

import os
import sys
from datetime import datetime

lib_path = os.path.join(os.path.dirname(__file__), "..", "lib")
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from data_generator import DataGenerator  # noqa: E402
from http_handler import ApiHandler  # noqa: E402
from json_processor import JSONProcessor  # noqa: E402


def _item_skeleton(skeleton, fallback):
    if isinstance(skeleton, list) and skeleton:
        return skeleton[0]
    if isinstance(skeleton, dict):
        for value in skeleton.values():
            if isinstance(value, list) and value:
                return value[0]
    return fallback


def _regenerate_arrays(obj, target_count, skeleton, swagger_spec, processor, generator):
    """Replace arrays with freshly generated unique items (no shared refs)."""
    if isinstance(obj, list) and obj:
        item_skel = _item_skeleton(skeleton, obj[0])
        return [
            processor.process_json(item_skel, swagger_spec, generator)
            for _ in range(target_count)
        ]
    if isinstance(obj, dict):
        return {
            k: _regenerate_arrays(v, target_count, skeleton, swagger_spec, processor, generator)
            for k, v in obj.items()
        }
    return obj


class handler(ApiHandler):
    def do_POST(self):
        body, err = self.read_json_body()
        if err:
            self.send_json(400, err)
            return

        try:
            if "skeleton" not in body:
                self.send_json(400, {"success": False, "error": "Missing required field: skeleton"})
                return

            skeleton = body["skeleton"]
            swagger_spec = body.get("swagger")
            options = body.get("options", {}) or {}

            generator = DataGenerator(locale=options.get("locale", "en_US"))
            if "seed" in options:
                try:
                    generator.set_seed(int(options["seed"]))
                except (ValueError, TypeError):
                    pass

            processor = JSONProcessor()
            result = processor.process_json(skeleton, swagger_spec, generator)

            count = options.get("count")
            if count is not None:
                try:
                    count = int(count)
                    if isinstance(result, list) and result:
                        result = [
                            processor.process_json(skeleton, swagger_spec, generator)
                            for _ in range(count)
                        ]
                    elif isinstance(result, dict):
                        result = _regenerate_arrays(
                            result, count, skeleton, swagger_spec, processor, generator
                        )
                except (ValueError, TypeError):
                    pass

            item_count = 1
            if isinstance(result, list):
                item_count = len(result)
            elif isinstance(result, dict):
                for value in result.values():
                    if isinstance(value, list):
                        item_count = len(value)
                        break

            self.send_json(
                200,
                {
                    "success": True,
                    "data": result,
                    "metadata": {
                        "generatedAt": datetime.now().isoformat(),
                        "itemCount": item_count,
                    },
                },
            )
        except Exception as e:
            self.send_error_json(500, "Internal server error", e)
