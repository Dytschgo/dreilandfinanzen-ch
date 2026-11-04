"""Build the application runtime from the pinned private core; delivery stays disabled."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    brand = ROOT / 'credit-core.brand.json'
    if not brand.is_file():
        raise SystemExit('Application setup incomplete: confirm the operator and add credit-core.brand.json. See README.md.')
    config = json.loads((ROOT / 'credit-core.consumer.json').read_text(encoding='utf-8'))
    if config['mode'] != 'prepare':
        raise SystemExit('This integration is preparation-only. Live delivery requires a separate reviewed setup.')
    subprocess.run([sys.executable, str(ROOT / 'credit-core/tools/consumer.py'), 'build', '--consumer', str(ROOT)], check=True)
    subprocess.run([sys.executable, str(ROOT / 'credit-core/tools/consumer.py'), 'check', '--consumer', str(ROOT)], check=True)

if __name__ == '__main__':
    main()
