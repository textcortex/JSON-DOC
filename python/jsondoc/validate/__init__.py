import os
import sys
import time

from jsonschema import Draft202012Validator, ValidationError, validate
from referencing import Registry, Resource

from jsondoc.utils import load_json_file

# from referencing.jsonschema import DRAFT202012


def resolve_schema(uri: str):
    if uri.startswith("file://"):
        path = uri[7:]
    else:
        path = uri
    contents = load_json_file(path)
    return Resource.from_contents(contents)


def validate_json(schema_path, data_path, root=None):
    schema = load_json_file(schema_path)
    data = load_json_file(data_path)

    # Create a registry that can handle file:// URIs and relative paths
    schema_dir = os.path.dirname(os.path.abspath(schema_path))
    if root is not None:
        root = os.path.abspath(root)

    base_uri = f"file://{schema_dir}/"

    def retrieve(uri: str):
        if uri.startswith(base_uri):
            relative_path = uri[len(base_uri) :]
            full_path = os.path.join(schema_dir, relative_path)
            return resolve_schema(full_path)
        else:
            if root is not None:
                full_path = os.path.join(root, "." + uri)
            else:
                full_path = os.path.join(schema_dir, uri)

            return resolve_schema(full_path)

    registry = Registry(retrieve=retrieve)

    # Create the validator with the registry
    validator = Draft202012Validator(schema, registry=registry)

    try:
        start = time.time()
        validator.validate(data)
        end = time.time()
        elapsed_ms = (end - start) * 1000
        print(f"{data_path} is valid (took {elapsed_ms:.3f}ms)")
        sys.exit(0)
    except ValidationError as e:
        print(f"Validation error: {e}")
        sys.exit(1)
