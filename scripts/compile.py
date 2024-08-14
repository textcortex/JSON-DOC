import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory

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
    output: str | None = None,
) -> str:
    # with open(filename, "r") as file:
    #     json_schema = file.read()
    json_schema = load_json_file(filename, deserialize=False)

    # with TemporaryDirectory() as temporary_directory_name:
    #     temporary_directory = Path(temporary_directory_name)
    #     output = Path(temporary_directory / "model.py")

    # Create directories if they don't exist
    if output:
        if not os.path.exists(os.path.dirname(output)):
            os.makedirs(os.path.dirname(output))

    output = Path(output)
    generate(
        json_schema,
        input_file_type=InputFileType.JsonSchema,
        input_filename="example.json",
        output=output,
        # set up the output model types
        output_model_type=DataModelType.PydanticV2BaseModel,
    )
    model: str = output.read_text()

    return model


def create_models(source_dir: str, destination_dir: str):
    # Create the destination directory if it doesn't exist
    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)

    # Walk through the source directory
    for root, dirs, files in os.walk(source_dir):
        # Create corresponding subdirectories in the destination
        for dir_name in dirs:
            source_subdir = os.path.join(root, dir_name)
            dest_subdir = os.path.join(
                destination_dir, os.path.relpath(source_subdir, source_dir)
            )
            if not os.path.exists(dest_subdir):
                os.makedirs(dest_subdir)

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

            # Convert the JSON schema to a model
            try:
                convert_json_schema_to_model(source_file, output=dest_file)
            except Exception as e:
                print(f"Failed to convert {source_file} to model: {e}")
                continue

            print(f"Converted {source_file} to model: {dest_file}")


create_models(SCHEMA_DIR, AUTOGEN_MODELS_DIR)

# test = convert_json_schema_to_model("build/schema/block/common/common_schema.json")
# test = convert_json_schema_to_model("build/schema/block/block_schema.json")
# test = convert_json_schema_to_model(
#     "misc/jsonschema_examples/basic_if_then/schema.json"
# )
# print(test)
