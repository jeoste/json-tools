"""Vercel serverless function for generating random XML structure with random data."""

from __future__ import annotations

import os
import random
import string
import sys
import xml.etree.ElementTree as ET
from datetime import datetime

lib_path = os.path.join(os.path.dirname(__file__), "..", "lib")
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

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
            max_children = options.get("maxChildren", 5)
            max_items = options.get("maxItems", 5)
            seed = options.get("seed")
            root_tag = options.get("rootTag", "root")

            if seed is not None:
                try:
                    random.seed(int(seed))
                except (ValueError, TypeError):
                    pass

            root = self._generate_random_xml(root_tag, depth, max_children, max_items)
            formatted_xml = self._format_xml(root)
            item_count = len(list(root))

            self.send_json(
                200,
                {
                    "success": True,
                    "data": formatted_xml,
                    "metadata": {
                        "generatedAt": datetime.now().isoformat(),
                        "itemCount": item_count,
                        "depth": depth,
                        "maxChildren": max_children,
                    },
                },
            )

        except Exception as e:
            self.send_error_json(500, "Internal server error", e)

    def _generate_random_xml(self, tag_name, depth, max_children, max_items):
        """Generate a random XML element."""
        element = ET.Element(tag_name)

        if random.random() < 0.5:
            num_attrs = random.randint(0, 3)
            attr_names = ["id", "name", "type", "status", "value", "count", "date"]
            for _ in range(num_attrs):
                attr_name = random.choice(attr_names)
                if attr_name not in element.attrib:
                    element.attrib[attr_name] = self._random_attr_value(attr_name)

        if depth <= 0:
            element.text = self._random_text_value()
            return element

        if random.random() < 0.7:
            num_children = random.randint(1, max_children)

            if random.random() < 0.4 and num_children > 1:
                child_tag = self._random_tag_name()
                for _ in range(min(num_children, max_items)):
                    element.append(self._generate_random_xml(child_tag, depth - 1, max_children, max_items))
            else:
                for _ in range(num_children):
                    child_tag = self._random_tag_name()
                    element.append(self._generate_random_xml(child_tag, depth - 1, max_children, max_items))
        else:
            element.text = self._random_text_value()

        return element

    def _random_tag_name(self):
        """Generate a random tag name."""
        tag_types = [
            lambda: "".join(random.choices(string.ascii_lowercase, k=random.randint(3, 10))),
            lambda: random.choice(
                [
                    "item",
                    "element",
                    "node",
                    "entry",
                    "record",
                    "data",
                    "field",
                    "property",
                    "attribute",
                    "value",
                    "name",
                    "id",
                    "type",
                    "status",
                    "user",
                    "product",
                    "order",
                    "category",
                ]
            ),
            lambda: f"{random.choice(['item', 'element', 'node'])}{random.randint(1, 100)}",
        ]
        return random.choice(tag_types)()

    def _random_attr_value(self, attr_name):
        """Generate a random attribute value based on attribute name."""
        if attr_name == "id":
            return str(random.randint(1, 10000))
        if attr_name == "type":
            return random.choice(["string", "number", "boolean", "date", "object", "array"])
        if attr_name == "status":
            return random.choice(["active", "inactive", "pending", "completed", "failed"])
        if attr_name == "date":
            year = random.randint(2020, 2024)
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            return f"{year}-{month:02d}-{day:02d}"
        return "".join(random.choices(string.ascii_letters + string.digits, k=random.randint(3, 15)))

    def _random_text_value(self):
        """Generate a random text value."""
        value_types = [
            lambda: "".join(random.choices(string.ascii_letters + string.digits + " ", k=random.randint(5, 30))).strip(),
            lambda: str(random.randint(1, 1000)),
            lambda: f"{random.random() * 100:.2f}",
            lambda: random.choice(["true", "false"]),
            lambda: f"{random.randint(2020, 2024)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            lambda: f"user{random.randint(1, 1000)}@example.com",
            lambda: f"+33{random.randint(100000000, 999999999)}",
        ]
        return random.choice(value_types)()

    def _format_xml(self, element):
        """Format XML element with proper declaration."""
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(element, encoding="unicode")
