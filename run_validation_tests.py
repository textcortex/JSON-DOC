# Usage: python run_validation_tests.py schema/

import os
import subprocess
import sys


def run_validation(schema_path, data_path, root=None):
    cmd = [
        sys.executable,
        "validate_json_schema.py",
        schema_path,
        data_path,
    ]
    if root is not None:
        cmd.extend(["--root", root])

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def process_directory(source_dir):
    failed_tests = []

    for root, dirs, files in os.walk(source_dir):
        dir_name = os.path.basename(root)
        schema_file = f"{dir_name}_schema.json"
        # print(f"Processing {dir_name}, {files}")

        if schema_file in files:
            schema_path = os.path.join(root, schema_file)

            for file in files:
                if file.endswith("_success.json") or file.endswith("_fail.json"):
                    data_path = os.path.join(root, file)
                    expected_success = file.endswith("_success.json")

                    result = run_validation(
                        schema_path,
                        data_path,
                        root=source_dir,
                    )

                    if result == expected_success:
                        print(f"PASS: {data_path}")
                    else:
                        print(f"FAIL: {data_path}")
                        failed_tests.append(data_path)

    return failed_tests


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <source_directory>")
        sys.exit(1)

    source_dir = sys.argv[1]
    failed_tests = process_directory(source_dir)

    print("\nFailed tests:")
    for test in failed_tests:
        print(test)

    print(f"\nTotal failed tests: {len(failed_tests)}")
