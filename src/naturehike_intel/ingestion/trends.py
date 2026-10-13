import csv
import io
import json
from datetime import date
from pathlib import Path

import polars as pl

from naturehike_intel.validation.models import TrendsMetadata

TREND_SCHEMA = {
    "batch_id": pl.String,
    "term_id": pl.String,
    "term": pl.String,
    "semantics": pl.String,
    "geography": pl.String,
    "date": pl.String,
    "period_end": pl.String,
    "interest_index": pl.Float64,
    "censored_below_one": pl.Boolean,
    "category": pl.Int64,
    "search_type": pl.String,
    "source_id": pl.String,
    "is_test_data": pl.Boolean,
}


def read_trends(csv_path: Path, metadata_path: Path, *, allow_test_data=False):
    meta = TrendsMetadata.model_validate(json.loads(metadata_path.read_text()))
    if meta.is_test_data and not allow_test_data:
        raise ValueError("TEST DATA cannot enter demand analysis")
    lines = csv_path.read_text(encoding="utf-8-sig").splitlines()
    start = next(
        (i for i, line in enumerate(lines) if line.split(",")[0] in {"Week", "Month", "Day"}), None
    )
    if start is None:
        raise ValueError("Google Trends export has no time header")
    reader = csv.DictReader(io.StringIO("\n".join(lines[start:])))
    if set(reader.fieldnames[1:]) != set(meta.terms.values()):
        raise ValueError("CSV columns and documented term scope differ")
    rows, keys = [], set()
    for row in reader:
        if not any(row.values()):
            continue
        period = row[reader.fieldnames[0]]
        d, _, end = period.partition(" - ")
        if len(d) == 7:
            import calendar

            year, month = map(int, d.split("-"))
            end = f"{d}-{calendar.monthrange(year, month)[1]:02d}"
            d += "-01"
        date.fromisoformat(d)
        end = end or d
        date.fromisoformat(end)
        if not meta.date_start <= d <= end <= meta.date_end:
            raise ValueError("Trends observation outside documented period")
        for term, column in meta.terms.items():
            value = row[column].strip()
            censored = value == "<1"
            index = None if value in {"", "<1"} else float(value)
            if index is not None and not 0 <= index <= 100:
                raise ValueError("Trends index outside 0–100")
            key = (d, term)
            if key in keys:
                raise ValueError("duplicate Trends observation")
            keys.add(key)
            rows.append(
                {
                    "batch_id": meta.batch_id,
                    "term_id": f"{meta.batch_id}:{term}",
                    "term": term,
                    "semantics": meta.semantics[term],
                    "geography": meta.geography,
                    "date": d,
                    "period_end": end,
                    "interest_index": index,
                    "censored_below_one": censored,
                    "category": meta.category,
                    "search_type": meta.search_type,
                    "source_id": meta.source_id,
                    "is_test_data": meta.is_test_data,
                }
            )
    if not rows:
        raise ValueError("empty Trends export")
    return pl.DataFrame(rows, schema=TREND_SCHEMA), meta
