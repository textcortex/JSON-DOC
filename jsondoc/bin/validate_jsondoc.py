import argparse

from jsondoc.validate import validate_json


def main():
    parser = argparse.ArgumentParser(description="Validate JSON against a JSON schema")
    parser.add_argument("schema", help="Path to the JSON schema file")
    parser.add_argument("data", help="Path to the JSON data file")
    parser.add_argument("--root", help="Root of the schema", default=None)

    args = parser.parse_args()

    validate_json(args.schema, args.data, root=args.root)


if __name__ == "__main__":
    main()
