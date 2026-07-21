"""Vercel serverless function for generating XML data from skeleton."""

from __future__ import annotations

import os
import random
import string
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from xml.parsers.expat import ExpatError

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
            if "skeleton" not in body:
                self.send_json(400, {"success": False, "error": "Missing required field: skeleton"})
                return

            skeleton_xml = body["skeleton"]
            options = body.get("options", {}) or {}

            if "seed" in options:
                try:
                    random.seed(int(options["seed"]))
                except (ValueError, TypeError):
                    pass

            try:
                root = ET.fromstring(skeleton_xml)
            except ExpatError as e:
                self.send_json(
                    400,
                    {"success": False, "error": "Invalid XML skeleton", "details": str(e)},
                )
                return

            generated_root = self._generate_xml_data(root, options.get("count", 1))
            formatted_xml = self._format_xml(generated_root)

            item_count = 1
            if isinstance(generated_root, list):
                item_count = len(generated_root)
            elif len(generated_root) > 0:
                item_count = len(list(generated_root))

            self.send_json(
                200,
                {
                    "success": True,
                    "data": formatted_xml,
                    "metadata": {
                        "generatedAt": datetime.now().isoformat(),
                        "itemCount": item_count,
                    },
                },
            )

        except Exception as e:
            self.send_error_json(500, "Internal server error", e)

    def _generate_xml_data(self, element, count=1):
        """Generate XML data from skeleton element."""
        if count > 1 and element.tag:
            return [self._clone_and_fill_element(element) for _ in range(count)]
        return self._clone_and_fill_element(element)

    def _clone_and_fill_element(self, element):
        """Clone element and fill with generated data."""
        new_elem = ET.Element(element.tag, element.attrib)

        if element.text and element.text.strip():
            new_elem.text = self._generate_value(element.text.strip())

        for child in element:
            new_elem.append(self._clone_and_fill_element(child))

        if element.tail and element.tail.strip():
            new_elem.tail = element.tail

        return new_elem

    def _generate_value(self, template):
        """Generate a value based on template patterns."""
        template_lower = template.lower()

        if "name" in template_lower or "nom" in template_lower:
            return self._random_name()
        if "email" in template_lower or "mail" in template_lower:
            return self._random_email()
        if "phone" in template_lower or "tel" in template_lower:
            return self._random_phone()
        if "id" in template_lower:
            return str(random.randint(1, 10000))
        if "age" in template_lower:
            return str(random.randint(18, 80))
        if "date" in template_lower:
            return self._random_date()
        if template.isdigit():
            return str(random.randint(1, int(template) * 2))
        return self._random_string()

    def _random_name(self):
        first_names = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Eve", "Frank"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"

    def _random_email(self):
        domains = ["example.com", "test.com", "demo.org", "sample.net"]
        username = "".join(random.choices(string.ascii_lowercase, k=8))
        return f"{username}@{random.choice(domains)}"

    def _random_phone(self):
        return f"+33{random.randint(100000000, 999999999)}"

    def _random_date(self):
        year = random.randint(2020, 2024)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        return f"{year}-{month:02d}-{day:02d}"

    def _random_string(self, length=10):
        return "".join(random.choices(string.ascii_letters + string.digits, k=length))

    def _format_xml(self, element):
        """Format XML element with proper indentation."""
        if isinstance(element, list):
            return "\n".join(ET.tostring(elem, encoding="unicode") for elem in element)
        return ET.tostring(element, encoding="unicode")
