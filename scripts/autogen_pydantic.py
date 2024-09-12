import json
import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urljoin

from datamodel_code_generator import DataModelType, InputFileType, generate

from jsondoc.utils import load_json_file, replace_refs_with_arbitrary_object

# from scripts.utils import copy_directory_without_comments

# If /build doesn't exist, create it
if not os.path.exists("build"):
    os.makedirs("build")

SCHEMA_DIR = "schema"
# BS_DIR = "build/schema"
AUTOGEN_MODELS_DIR = "jsondoc/models/"

# Remove build/schema if it exists
if os.path.exists(AUTOGEN_MODELS_DIR):
    shutil.rmtree(AUTOGEN_MODELS_DIR)


def create_init_files(root_dir):
    """
    Create an empty __init__.py file in the specified directory and all its subdirectories.

    :param root_dir: The root directory to start from.
    """
    for dirpath, dirnames, filenames in os.walk(root_dir):
        init_file = os.path.join(dirpath, "__init__.py")
        if not os.path.exists(init_file):
            with open(init_file, "w") as f:
                pass  # Create an empty file


def convert_json_schema_to_model(
    filename: str,
    source_dir: str,
    output: str | None = None,
) -> str:
    # Load the JSON schema
    # with open(filename, "r") as file:
    #     json_schema = json.load(file)
    json_schema = load_json_file(filename)

    # Resolve relative references
    def resolve_refs(obj):
        if isinstance(obj, dict):
            if "$ref" in obj:
                ref: str = obj["$ref"]

                if ref.startswith("/"):
                    ref = ref[1:]

                fragment = None
                if "#" in ref:
                    tokens = ref.split("#")
                    ref = tokens[0]
                    fragment = tokens[1]

                ref_path = os.path.normpath(os.path.join(source_dir, ref))
                ref_obj = load_json_file(ref_path)

                if fragment:
                    # Get the fragment from the file
                    for part in fragment.split("/"):
                        if part:
                            ref_obj = ref_obj[part]

                title = ref_obj.get("title")
                if title is None:
                    print(ref_path)
                    return ref_obj
                    # raise ValueError(f"Title not found in {ref_path}")
                if "customTypePath" in ref_obj:
                    customTypePath = ref_obj["customTypePath"]
                else:
                    ref_tokens = ref.split("/")
                    ref_tokens = ["jsondoc", "models"] + ref_tokens[:-1] + [title]
                    customTypePath = ".".join(ref_tokens)

                ret = {
                    "type": "object",
                    "title": title,
                    # "customBasePath": "ASDF",
                    "customTypePath": customTypePath,
                    "properties": {},
                    # "properties": {"dummy": {"type": "string"}},
                    # "const": "Replace_" + title,
                }
                return ret

            return {k: resolve_refs(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [resolve_refs(item) for item in obj]
        else:
            return obj

    for _ in range(4):
        resolved_schema = resolve_refs(json_schema)

    # resolved_schema = replace_refs_with_arbitrary_object(resolved_schema)

    # Create directories if they don't exist
    if output:
        os.makedirs(os.path.dirname(output), exist_ok=True)

    output = Path(output)
    generate(
        json.dumps(resolved_schema),  # Convert back to JSON string
        input_file_type=InputFileType.JsonSchema,
        input_filename="example.json",
        output=output,
        output_model_type=DataModelType.PydanticV2BaseModel,
        apply_default_values_for_required_fields=True,
    )
    model: str = output.read_text()

    return model


def create_models(source_dir: str, destination_dir: str):
    # Create the destination directory if it doesn't exist
    os.makedirs(destination_dir, exist_ok=True)

    # Walk through the source directory
    for root, dirs, files in os.walk(source_dir):
        # Create corresponding subdirectories in the destination
        for dir_name in dirs:
            source_subdir = os.path.join(root, dir_name)
            dest_subdir = os.path.join(
                destination_dir, os.path.relpath(source_subdir, source_dir)
            )
            os.makedirs(dest_subdir, exist_ok=True)

        # Process files
        for file_name in files:
            if not file_name.endswith("_schema.json"):
                continue

            source_file = os.path.join(root, file_name)
            dest_file = os.path.join(
                destination_dir, os.path.relpath(source_file, source_dir)
            )
            # Replace the _schema.json at the end of the filename with .py
            # dest_file = dest_file.replace("_schema.json", ".py")

            # Get the directory of the destination file
            dest_dir_ = os.path.dirname(dest_file)
            # if dest_dir_.endswith("/"):
            #     dest_dir_ = dest_dir_[:-1]

            dest_file = dest_dir_ + "/__init__.py"

            print(f"Processing: {source_file}")

            # Convert the JSON schema to a model
            # try:
            convert_json_schema_to_model(source_file, source_dir, output=dest_file)
            #     print(f"Converted {source_file} to model: {dest_file}")
            # except Exception as e:
            #     print(f"Failed to convert {source_file} to model: {e}")
            #     continue

    create_init_files(destination_dir)


create_models(SCHEMA_DIR, AUTOGEN_MODELS_DIR)

# test = convert_json_schema_to_model("build/schema/block/common/common_schema.json")
# test = convert_json_schema_to_model("build/schema/block/block_schema.json")
# test = convert_json_schema_to_model(
#     "misc/jsonschema_examples/basic_if_then/schema.json"
# )
# print(test)
