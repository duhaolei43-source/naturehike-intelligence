import fcntl
import hashlib
import json
import os
import subprocess
import uuid
from datetime import UTC, datetime
from pathlib import Path

ARCHIVE_DIRS = "sessions events decisions evidence raw_data experiments test_runs environment git_snapshots critiques manifests backups".split()


def canonical(value):
    return json.dumps(
        value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    ).encode("utf-8")


def sha256(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def audit_root(repo: Path):
    root = (
        Path(
            os.environ.get(
                "AUDIT_ROOT",
                str(Path.home() / "Documents/ResearchVault/naturehike-us-market-intelligence"),
            )
        )
        .expanduser()
        .resolve()
    )
    if root == repo.resolve() or root.is_relative_to(repo.resolve()):
        raise ValueError("AUDIT_ROOT must be outside repository, including symlinks")
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    root.chmod(0o700)
    for name in ARCHIVE_DIRS:
        (root / name).mkdir(exist_ok=True, mode=0o700)
        (root / name).chmod(0o700)
    return root


def verify_events(path: Path):
    previous = None
    if not path.exists():
        return previous
    for line in path.read_text().splitlines():
        record = json.loads(line)
        event_hash = record.pop("event_hash")
        if (
            record["previous_event_hash"] != previous
            or hashlib.sha256(canonical(record)).hexdigest() != event_hash
        ):
            raise ValueError("audit chain verification failed")
        previous = event_hash
    return previous


def record_event(
    repo,
    *,
    stage,
    action,
    status,
    input_hashes=None,
    output_hashes=None,
    limitations=None,
    duration_seconds=None,
):
    root = audit_root(repo)
    path = root / "events/ledger.jsonl"
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=repo, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except subprocess.CalledProcessError:
        commit = None
    fd = os.open(path, os.O_RDWR | os.O_CREAT | os.O_APPEND, 0o600)
    os.chmod(path, 0o600)
    with os.fdopen(fd, "a") as stream:
        fcntl.flock(stream, fcntl.LOCK_EX)
        previous = verify_events(path)
        record = {
            "event_id": str(uuid.uuid4()),
            "timestamp_utc": datetime.now(UTC).isoformat(),
            "run_id": str(uuid.uuid4()),
            "actor": "pipeline",
            "stage": stage,
            "action": action,
            "status": status,
            "input_hashes": input_hashes or {},
            "output_hashes": output_hashes or {},
            "git_commit": commit,
            "limitations": limitations or [],
            "duration_seconds": duration_seconds,
            "previous_event_hash": previous,
        }
        record["event_hash"] = hashlib.sha256(canonical(record)).hexdigest()
        stream.write(canonical(record).decode() + "\n")
        stream.flush()
        os.fsync(stream.fileno())
    return record
