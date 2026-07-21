"""Smoke tests for shared Python lib."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "lib"))

from data_anonymizer import DataAnonymizer
from data_generator import DataGenerator
from http_handler import MAX_BODY_BYTES
from json_processor import JSONProcessor


def test_max_body_limit_is_positive():
    assert MAX_BODY_BYTES >= 1024


def test_generator_produces_string():
    gen = DataGenerator(locale="en_US")
    gen.set_seed(42)
    value = gen.generate_by_type("string", "email", {})
    assert isinstance(value, str)
    assert "@" in value


def test_processor_passthrough_literal():
    gen = DataGenerator(locale="en_US")
    gen.set_seed(1)
    processor = JSONProcessor()
    result = processor.process_json({"hello": "world"}, None, gen)
    assert result == {"hello": "world"}


def test_anonymizer_detects_email_field():
    anonymizer = DataAnonymizer()
    fields = anonymizer.get_sensitive_fields({"user": {"email": "a@b.com"}})
    assert any("email" in f.lower() for f in fields)
