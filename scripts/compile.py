import json
import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urljoin

from datamodel_code_generator import DataModelType, InputFileType, generate

from jsondoc.utils import load_json_file

# from scripts.utils import copy_directory_without_comments

# If /build doesn't exist, create it
if not os.path.exists("build"):
    os.makedirs("build")

SCHEMA_DIR = "schema"
# BS_DIR = "build/schema"
AUTOGEN_MODELS_DIR = "jsondoc/models/autogen/"

# Remove build/schema if it exists
if os.path.exists(AUTOGEN_MODELS_DIR):
    shutil.rmtree(AUTOGEN_MODELS_DIR)


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
                ref = obj["$ref"]

                if ref.startswith("/"):
                    ref = ref[1:]

                fragment = None
                if "#" in ref:
                    tokens = ref.split("#")
                    ref = tokens[0]
                    fragment = tokens[1]

                ref_path = os.path.normpath(os.path.join(source_dir, ref))
                ret = load_json_file(ref_path)
                if fragment:
                    # Get the fragment from the file
                    for part in fragment.split("/"):
                        if part:
                            ret = ret[part]

                return ret

            return {k: resolve_refs(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [resolve_refs(item) for item in obj]
        else:
            return obj

    resolved_schema = resolve_refs(json_schema)

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
            dest_file = dest_file.replace("_schema.json", ".py")
            print(f"Processing: {source_file}")

            # Convert the JSON schema to a model
            # try:
            convert_json_schema_to_model(source_file, source_dir, output=dest_file)
            #     print(f"Converted {source_file} to model: {dest_file}")
            # except Exception as e:
            #     print(f"Failed to convert {source_file} to model: {e}")
            #     continue


create_models(SCHEMA_DIR, AUTOGEN_MODELS_DIR)

# test = convert_json_schema_to_model("build/schema/block/common/common_schema.json")
# test = convert_json_schema_to_model("build/schema/block/block_schema.json")
# test = convert_json_schema_to_model(
#     "misc/jsonschema_examples/basic_if_then/schema.json"
# )
# print(test)
