"""Baut site/ und veröffentlicht es als Branch `site` auf GitHub.

Hostinger (Git-Deployment) zieht den Branch `site` ins Web-Root von dreilandfinanzen.ch.
Ersatz für den GitHub-Workflow, solange GitHub Actions im Konto gesperrt ist.

Aufruf: python tools/publish_site.py
"""
from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

import build_site

ROOT = Path(__file__).resolve().parent.parent


def git(*args: str, cwd: Path) -> str:
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


def main() -> None:
    build_site.main()
    remote = git("remote", "get-url", "origin", cwd=ROOT)
    sha = git("rev-parse", "--short", "HEAD", cwd=ROOT)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp) / "site"
        shutil.copytree(ROOT / "site", work)
        git("init", "-q", "-b", "site", cwd=work)
        git("config", "core.autocrlf", "false", cwd=work)
        git("add", "-A", cwd=work)
        name = git("config", "user.name", cwd=ROOT)
        email = git("config", "user.email", cwd=ROOT)
        git("-c", f"user.name={name}", "-c", f"user.email={email}",
            "commit", "-q", "-m", f"Website aus {sha}", cwd=work)
        git("push", "-q", "-f", remote, "site:site", cwd=work)
    print(f"Branch `site` aktualisiert (aus {sha}). In Hostinger ggf. «Deploy» auslösen.")


if __name__ == "__main__":
    main()
