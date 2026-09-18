"""
Red Team Automation CLI.
Runs all red-team adversarial tests against the live system.
"""
import sys
import subprocess

def main():
    print("==================================================")
    print("      SDMS Red Team Adversarial Test Suite        ")
    print("==================================================")
    cmd = [sys.executable, "-m", "pytest", "backend/tests/redteam", "-v"]
    res = subprocess.run(cmd)
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
