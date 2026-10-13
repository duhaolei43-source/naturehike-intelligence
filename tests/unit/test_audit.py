import io
import json
import tarfile

import pytest
from cryptography.exceptions import InvalidTag

from naturehike_intel.provenance.audit import audit_root, record_event, verify_events
from naturehike_intel.provenance.backup import create_backup, decrypt_backup


def test_chain_detects_edits(tmp_path, monkeypatch):
    monkeypatch.setenv("AUDIT_ROOT", str(tmp_path / "vault"))
    repo = tmp_path / "repo"
    repo.mkdir()
    record_event(repo, stage="validation", action="first", status="success")
    record_event(repo, stage="validation", action="second", status="success")
    ledger = tmp_path / "vault/events/ledger.jsonl"
    assert verify_events(ledger)
    records = ledger.read_text().splitlines()
    row = json.loads(records[0])
    row["status"] = "failure"
    records[0] = json.dumps(row)
    ledger.write_text("\n".join(records) + "\n")
    with pytest.raises(ValueError, match="chain"):
        verify_events(ledger)
    with pytest.raises(ValueError, match="chain"):
        record_event(repo, stage="validation", action="third", status="success")
    assert ledger.stat().st_mode & 0o777 == 0o600


def test_external_archive_and_symlink(tmp_path, monkeypatch):
    repo = tmp_path / "repo"
    repo.mkdir()
    internal = repo / "vault"
    monkeypatch.setenv("AUDIT_ROOT", str(internal))
    with pytest.raises(ValueError, match="outside"):
        audit_root(repo)
    internal.mkdir()
    external_link = tmp_path / "link"
    external_link.symlink_to(internal)
    monkeypatch.setenv("AUDIT_ROOT", str(external_link))
    with pytest.raises(ValueError, match="outside"):
        audit_root(repo)


def test_encrypted_backup_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setenv("AUDIT_ROOT", str(tmp_path / "vault"))
    repo = tmp_path / "repo"
    repo.mkdir()
    record_event(repo, stage="validation", action="backup fixture", status="success")
    secret = "synthetic fixture passphrase only"
    a, b = create_backup(repo, secret), create_backup(repo, secret)
    assert a != b and a.stat().st_mode & 0o777 == 0o600
    with tarfile.open(fileobj=io.BytesIO(decrypt_backup(a, secret)), mode="r:gz") as archive:
        assert "events/ledger.jsonl" in archive.getnames()
    with pytest.raises(InvalidTag):
        decrypt_backup(a, "incorrect fixture passphrase")
