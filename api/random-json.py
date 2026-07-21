"""Vercel serverless function for generating random JSON structure with random data."""

from __future__ import annotations

import os
import random
import string
import sys
from datetime import datetime

lib_path = os.path.join(os.path.dirname(__file__), "..", "lib")
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from data_generator import DataGenerator  # noqa: E402
from http_handler import ApiHandler  # noqa: E402


class handler(ApiHandler):
    def do_POST(self):
        body, err = self.read_json_body()
        if err:
            self.send_json(400, err)
            return

        try:
            options = body.get("options", {}) or {}

            depth = options.get("depth", 3)
            max_keys = options.get("maxKeys", 5)
            max_items = options.get("maxItems", 5)
            seed = options.get("seed")
            locale = options.get("locale", "en_US")

            if seed is not None:
                try:
                    random.seed(int(seed))
                except (ValueError, TypeError):
                    pass

            generator = DataGenerator(locale=locale)
            if seed is not None:
                try:
                    generator.set_seed(int(seed))
                except (ValueError, TypeError):
                    pass

            result = self._generate_random_json(depth, max_keys, max_items, generator)

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
                        "depth": depth,
                        "maxKeys": max_keys,
                    },
                },
            )

        except Exception as e:
            self.send_error_json(500, "Internal server error", e)

    def _generate_random_json(self, depth, max_keys, max_items, generator):
        """Generate a random JSON structure."""
        if depth <= 0:
            return self._random_leaf_value(generator)

        structure_type = random.choice(["object", "array", "mixed"])

        if structure_type == "array" or (structure_type == "mixed" and random.random() < 0.3):
            array_length = random.randint(1, max_items)
            return [
                self._generate_random_json(depth - 1, max_keys, max_items, generator)
                for _ in range(array_length)
            ]

        num_keys = random.randint(1, max_keys)
        result = {}

        for _ in range(num_keys):
            key = self._random_key_name()
            while key in result:
                key = self._random_key_name()

            if depth > 1 and random.random() < 0.4:
                result[key] = self._generate_random_json(depth - 1, max_keys, max_items, generator)
            else:
                result[key] = self._random_leaf_value(generator)

        return result

    def _random_key_name(self):
        """Generate a random key name."""
        key_types = [
            lambda: "".join(random.choices(string.ascii_lowercase, k=random.randint(3, 10))),
            lambda: random.choice(
                [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "address",
                    "city",
                    "country",
                    "date",
                    "time",
                    "status",
                    "type",
                    "value",
                    "count",
                    "price",
                    "amount",
                ]
            ),
            lambda: f"{random.choice(['user', 'item', 'product', 'order', 'customer', 'product', 'category'])}{random.randint(1, 100)}",
        ]
        return random.choice(key_types)()

    def _random_leaf_value(self, generator):
        """Generate a random leaf value."""
        value_types = [
            lambda: generator.generate_by_type("string", "random", {}),
            lambda: generator.generate_by_type("integer", "random", {}),
            lambda: generator.generate_by_type("number", "random", {}),
            lambda: generator.generate_by_type("boolean", "random", {}),
            lambda: generator.generate_by_type("string", "email", {}),
            lambda: generator.generate_by_type("string", "phone", {}),
            lambda: generator.generate_by_type("string", "date", {}),
            lambda: generator.generate_by_type("string", "datetime", {}),
        ]
        return random.choice(value_types)()
