from getpass import getpass
from pathlib import Path

from naturehike_intel.provenance.backup import create_backup

secret = getpass("Encryption passphrase (not recorded): ")
if secret != getpass("Repeat passphrase: "):
    raise SystemExit("Passphrases differ")
print(create_backup(Path(__file__).resolve().parents[2], secret))
