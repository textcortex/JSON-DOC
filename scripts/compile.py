import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory

from datamodel_code_generator import DataModelType, InputFileType, generate

from scripts.utils import copy_directory_without_comments

# If /build doesn't exist, create it
if not os.path.exists("build"):
    os.makedirs("build")

SCHEMA_DIR = "schema"
BS_DIR = "build/schema"

# Remove build/schema if it exists
if os.path.exists(BS_DIR):
    shutil.rmtree(BS_DIR)

copy_directory_without_comments(SCHEMA_DIR, BS_DIR)


def convert_json_schema_to_model(filename: str) -> str:
    with open(filename, "r") as file:
        json_schema = file.read()

    with TemporaryDirectory() as temporary_directory_name:
        temporary_directory = Path(temporary_directory_name)
        output = Path(temporary_directory / "model.py")
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


# test = convert_json_schema_to_model("build/schema/block/common/common_schema.json")
# test = convert_json_schema_to_model("build/schema/block/block_schema.json")
test = convert_json_schema_to_model(
    "misc/jsonschema_examples/basic_if_then/schema.json"
)
print(test)
