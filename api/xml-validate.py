"""Vercel serverless function for validating XML structure."""

from __future__ import annotations

import os
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
            if "xml" not in body:
                self.send_json(400, {"success": False, "error": "Missing required field: xml"})
                return

            xml_content = body["xml"]
            options = body.get("options", {}) or {}
            format_output = options.get("format", False)

            try:
                root = ET.fromstring(xml_content)

                formatted_xml = None
                if format_output:
                    formatted_xml = self._format_xml(root)

                structure_info = self._get_structure_info(root)

                self.send_json(
                    200,
                    {
                        "success": True,
                        "isValid": True,
                        "formatted": formatted_xml,
                        "structure": structure_info,
                        "metadata": {"validatedAt": datetime.now().isoformat()},
                    },
                )

            except ExpatError as e:
                error_info = {
                    "code": e.code,
                    "message": str(e),
                    "line": getattr(e, "lineno", None),
                    "column": getattr(e, "offset", None),
                }
                self.send_json(
                    200,
                    {
                        "success": True,
                        "isValid": False,
                        "error": error_info,
                        "metadata": {"validatedAt": datetime.now().isoformat()},
                    },
                )

            except ET.ParseError as e:
                error_info = {
                    "message": str(e),
                    "position": getattr(e, "position", None),
                }
                self.send_json(
                    200,
                    {
                        "success": True,
                        "isValid": False,
                        "error": error_info,
                        "metadata": {"validatedAt": datetime.now().isoformat()},
                    },
                )

        except Exception as e:
            self.send_error_json(500, "Internal server error", e)

    def _format_xml(self, element, level=0):
        """Format XML element with indentation."""
        indent = "  " * level
        tag = element.tag
        text = element.text.strip() if element.text and element.text.strip() else ""

        attrs = ""
        if element.attrib:
            attrs = " " + " ".join(f'{k}="{v}"' for k, v in element.attrib.items())

        if len(element) > 0 or text:
            result = f"{indent}<{tag}{attrs}>"
            if text:
                result += text
            if len(element) > 0:
                result += "\n"
                for child in element:
                    result += self._format_xml(child, level + 1) + "\n"
                result += indent
            result += f"</{tag}>"
        else:
            result = f"{indent}<{tag}{attrs} />"

        return result

    def _get_structure_info(self, element):
        """Get basic structure information about the XML."""
        info = {
            "rootTag": element.tag,
            "attributes": element.attrib,
            "childCount": len(element),
            "hasText": bool(element.text and element.text.strip()),
        }

        child_tags = {}
        for child in element:
            child_tags[child.tag] = child_tags.get(child.tag, 0) + 1

        info["childTags"] = child_tags
        return info
