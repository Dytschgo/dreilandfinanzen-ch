"""Create a reviewable static release, including generated public application assets only."""
import importlib.util
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from shutil import copy2, copytree

ROOT = Path(__file__).resolve().parents[1]

def main():
    subprocess.run([sys.executable, str(ROOT / 'tools/build_application.py')], check=True)
    sys.path.insert(0, str(ROOT / 'credit-core/tools'))
    spec = importlib.util.spec_from_file_location('consumer', ROOT / 'credit-core/tools/consumer.py')
    consumer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(consumer)
    files = consumer.generated_files(ROOT)
    # A new directory for every package prevents stale runtime assets from surviving a release.
    from datetime import datetime, timezone
    destination = ROOT / 'dist/releases' / datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f')
    destination.mkdir(parents=True)
    for name in ['index.html', 'antrag.html', 'app.js', 'header.js', 'application.js', 'application.css', 'style.css', '.htaccess', 'robots.txt']:
        copy2(ROOT / name, destination / name)
    for name in ['assets', 'img', 'brand-kit']:
        copytree(ROOT / name, destination / name)
    for name, data in files.items():
        if not name.startswith('credit-runtime/') or name.startswith('credit-runtime/api/'):
            continue
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    metadata = {
        'consumer': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'sourceHasChanges': bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=ROOT, text=True).strip()),
        'core': subprocess.check_output(['git', '-C', str(ROOT / 'credit-core'), 'rev-parse', 'HEAD'], text=True).strip(),
        'mode': 'prepare',
        'sha256': {file.relative_to(destination).as_posix(): hashlib.sha256(file.read_bytes()).hexdigest() for file in sorted(destination.rglob('*')) if file.is_file()},
    }
    (destination / 'release.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(destination)

if __name__ == '__main__':
    main()
