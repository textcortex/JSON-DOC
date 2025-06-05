import os
import sys

import pytest


# This collects tests that aren't standard pytest tests
def pytest_collect_file(parent, file_path):
    # Special handling for test_validation.py
    if file_path.name == "test_validation.py":
        return ValidationTestFile.from_parent(parent, path=file_path)
    return None


class ValidationTestFile(pytest.File):
    def collect(self):
        # Create a special test item for test_validation.py
        yield ValidationTestItem.from_parent(self, name="test_validation")


class ValidationTestItem(pytest.Item):
    def runtest(self):
        # Run the test_validation.py script with "schema" as the argument
        import subprocess

        print(f"\n{'-' * 80}\nRunning test_validation.py with 'schema' argument...")

        result = subprocess.run(
            [sys.executable, str(self.fspath), "schema"],
            capture_output=True,
            text=True,
        )

        # Always print the stdout for visibility
        if result.stdout:
            print(f"\nOutput from test_validation.py:")
            print(result.stdout)

        if result.returncode != 0:
            raise ValidationTestFailure(result.stdout, result.stderr)

        print(f"test_validation.py completed successfully.\n{'-' * 80}")

    def reportinfo(self):
        return self.fspath, 0, f"test_validation.py schema"


class ValidationTestFailure(Exception):
    def __init__(self, stdout, stderr):
        self.stdout = stdout
        self.stderr = stderr
        super().__init__(f"test_validation.py failed")


@pytest.hookimpl(tryfirst=True)
def pytest_exception_interact(node, call, report):
    if isinstance(call.excinfo.value, ValidationTestFailure):
        failure = call.excinfo.value
        print(f"test_validation.py failed!")
        if failure.stderr:
            print(f"STDERR:\n{failure.stderr}")
        print(f"{'-' * 80}")
