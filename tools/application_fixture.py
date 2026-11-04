"""Synthetic preparation-only operator for browser verification, never a release input."""
import json
import sys
import subprocess
from shutil import copytree
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'credit-core/tools'))
from consumer import build_payload

out = ROOT / 'dist/qa/application-fixture'
source = out / 'source'
source.mkdir(parents=True, exist_ok=True)
copytree(ROOT / 'credit-core-templates', source / 'credit-core-templates', dirs_exist_ok=True)
subprocess.run(['git', 'init', '-q', str(source)], check=True)
subprocess.run(['git', '-C', str(source), 'add', 'credit-core-templates'], check=True)
(source / 'credit-core.brand.json').write_text(json.dumps({
    'name': 'Dreiland Finanzen', 'domain': 'dreilandfinanzen.ch',
    'operator': 'custom', 'filiale': 'TEST', 'germanTone': 'formal',
}), encoding='utf-8')
(source / 'credit-core.operator.json').write_text(json.dumps({
    'company': 'Dreiland Testfirma', 'street': 'Teststrasse 1', 'town': '4000 Basel',
    'phone': '061 000 00 00', 'phoneLink': '+41610000000', 'whatsapp': '41610000000',
    'email': 'test@example.invalid', 'creditdesk': 'test@example.invalid',
}), encoding='utf-8')
config = json.loads((ROOT / 'credit-core.consumer.json').read_text(encoding='utf-8'))
# Site profile includes local-only synthetic autofill helpers. Production uses runtime profile.
config['profile'] = 'site'
files = build_payload(source, config, 'eeb52f8b29191627867059833b146391046d889a')
for name, data in files.items():
    target = out / 'public' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
print(out / 'public')
