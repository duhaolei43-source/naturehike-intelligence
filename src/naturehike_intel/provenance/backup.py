import io
import os
import tarfile
import uuid
from datetime import UTC, datetime

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt

from naturehike_intel.provenance.audit import audit_root


def create_backup(repo, passphrase: str):
    if len(passphrase) < 16:
        raise ValueError("use a passphrase of at least 16 characters")
    root = audit_root(repo)
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
        for path in sorted(root.rglob("*")):
            if (
                path.is_file()
                and not path.is_relative_to(root / "backups")
                and not path.is_symlink()
            ):
                archive.add(path, arcname=str(path.relative_to(root)))
    salt, nonce = os.urandom(16), os.urandom(12)
    key = Scrypt(salt=salt, length=32, n=2**15, r=8, p=1).derive(passphrase.encode())
    encrypted = AESGCM(key).encrypt(nonce, buffer.getvalue(), b"naturehike-audit-v1")
    name = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ") + "-" + str(uuid.uuid4()) + ".nhvault"
    path = root / "backups" / name
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(b"NHVAULT1" + salt + nonce + encrypted)
    return path


def decrypt_backup(path, passphrase):
    data = path.read_bytes()
    if not data.startswith(b"NHVAULT1"):
        raise ValueError("unknown backup format")
    salt, nonce, encrypted = data[8:24], data[24:36], data[36:]
    key = Scrypt(salt=salt, length=32, n=2**15, r=8, p=1).derive(passphrase.encode())
    return AESGCM(key).decrypt(nonce, encrypted, b"naturehike-audit-v1")
