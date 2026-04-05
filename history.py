#!/usr/bin/env python3
"""Print saved translations from the database."""
from database import get_all_translations

rows = get_all_translations()

if not rows:
    print("No translations saved yet.")
else:
    print(f"{'#':<5} {'Date':<22} {'From':<6} {'To':<6} {'Original':<35} Translation")
    print("-" * 100)
    for r in rows:
        date = r["created_at"][:19].replace("T", " ")
        orig = r["original_text"].replace("\n", " ")
        trans = r["translated_text"].replace("\n", " ")
        print(f"{r['id']:<5} {date:<22} {r['source_language']:<6} {r['target_language']:<6} {orig[:35]:<35} {trans}")
