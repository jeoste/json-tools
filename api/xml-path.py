"""Vercel serverless function for evaluating XPath expressions on XML."""

from __future__ import annotations

import os
import sys
from datetime import datetime

from lxml import etree

lib_path = os.path.join(os.path.dirname(__file__), "..", "lib")
if lib_path not in sys.path:
    sys.path.insert(0, lib_path)

from http_handler import ApiHandler  # noqa: E402

_SAFE_PARSER = etree.XMLParser(
    resolve_entities=False,
    no_network=True,
    dtd_validation=False,
    load_dtd=False,
)


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

            if "xpath" not in body:
                self.send_json(400, {"success": False, "error": "Missing required field: xpath"})
                return

            xml_content = body["xml"]
            xpath_expr = body["xpath"]
            options = body.get("options", {}) or {}
            return_format = options.get("format", "json")

            try:
                root = etree.fromstring(
                    xml_content.encode("utf-8") if isinstance(xml_content, str) else xml_content,
                    _SAFE_PARSER,
                )
            except etree.XMLSyntaxError as e:
                self.send_json(
                    400,
                    {"success": False, "error": "Invalid XML", "details": str(e)},
                )
                return

            try:
                results = root.xpath(xpath_expr)

                if return_format == "xml":
                    formatted_results = self._format_results_as_xml(results)
                else:
                    formatted_results = self._format_results_as_json(results)

                self.send_json(
                    200,
                    {
                        "success": True,
                        "results": formatted_results,
                        "count": len(results),
                        "metadata": {
                            "evaluatedAt": datetime.now().isoformat(),
                            "xpath": xpath_expr,
                        },
                    },
                )

            except etree.XPathEvalError as e:
                self.send_json(
                    400,
                    {"success": False, "error": "XPath evaluation error", "details": str(e)},
                )

        except Exception as e:
            self.send_error_json(500, "Internal server error", e)

    def _format_results_as_json(self, results):
        """Format XPath results as JSON."""
        formatted = []
        for result in results:
            if etree.iselement(result):
                formatted.append(
                    {
                        "tag": result.tag,
                        "attributes": dict(result.attrib),
                        "text": result.text.strip() if result.text else "",
                        "children": [child.tag for child in result],
                    }
                )
            elif isinstance(result, (bool, int, float)):
                formatted.append(result)
            else:
                formatted.append(str(result))
        return formatted

    def _format_results_as_xml(self, results):
        """Format XPath results as XML string."""
        xml_parts = []
        for result in results:
            if etree.iselement(result):
                xml_parts.append(etree.tostring(result, encoding="unicode"))
            else:
                xml_parts.append(str(result))
        return "\n".join(xml_parts)
