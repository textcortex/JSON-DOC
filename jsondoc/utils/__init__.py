import difflib
import json
import logging
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone

from typeid import TypeID

from jsondoc.models.block.base import CreatedBy

ARBITRARY_JSON_SCHEMA_OBJECT = {
    "type": "object",
    "properties": {},
    "additionalProperties": True,
}

TYPEID_BLOCK_ID_PREFIX = "bk"
TYPEID_PAGE_ID_PREFIX = "pg"


def generate_block_id(typeid: bool = False) -> str:
    if typeid:
        return str(TypeID(prefix=TYPEID_BLOCK_ID_PREFIX))
    return str(uuid.uuid4())


def generate_page_id(typeid: bool = False) -> str:
    if typeid:
        return str(TypeID(prefix=TYPEID_PAGE_ID_PREFIX))
    return str(uuid.uuid4())


def get_current_time() -> datetime:
    return datetime.now(tz=timezone.utc)


def replace_refs_with_arbitrary_object(data):
    if isinstance(data, dict):
        if "$ref" in data:
            return ARBITRARY_JSON_SCHEMA_OBJECT
        return {k: replace_refs_with_arbitrary_object(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_refs_with_arbitrary_object(item) for item in data]
    else:
        return data


def load_json_file(file_path, deserialize=True) -> dict | str:
    with open(file_path) as schema_file:
        content = schema_file.read()
        # Remove the lines that begin with //. Account for spaces before the //
        content = "\n".join(
            [line for line in content.split("\n") if not line.lstrip().startswith("//")]
        )

        if deserialize:
            return json.loads(content)
        else:
            return content


def get_nested_value(obj: dict | object, coordinates: str) -> any:
    keys = coordinates.strip(".").split(".")
    current = obj
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key)
        elif hasattr(current, key):
            current = getattr(current, key)
        else:
            raise ValueError(f"Cannot get '{key}' from object: {current}")
    return current


def set_nested_value(obj: dict | object, coordinates: str, value: any) -> None:
    keys = coordinates.strip(".").split(".")
    current = obj
    for key in keys[:-1]:
        if isinstance(current, dict):
            if key not in current:
                current[key] = {}
            current = current[key]
        elif hasattr(current, key):
            current = getattr(current, key)
        else:
            raise ValueError(f"Cannot set '{key}' on object: {current}")
    if isinstance(current, dict):
        current[keys[-1]] = value
    else:
        setattr(current, keys[-1], value)


@contextmanager
def timer(name, unit="s"):
    start_time = time.time()
    yield
    end_time = time.time()
    elapsed = end_time - start_time
    if unit == "ms":
        print(f"{name} took {elapsed * 1000:.4f} milliseconds")
    else:
        print(f"{name} took {end_time - start_time:.4f} seconds")


def diff_strings(string1, string2):
    lines1 = string1.splitlines(keepends=True)
    lines2 = string2.splitlines(keepends=True)

    diff = difflib.unified_diff(lines1, lines2, lineterm="")
    return "".join(diff)


def diff_jsonable_dict(d1: dict, d2: dict) -> str:
    """
    Diffs two Python dictionaries that can be serialized to JSON.
    """
    try:
        d1_json = json.dumps(d1)
        d2_json = json.dumps(d2)
    except Exception as e:
        raise ValueError(f"Failed to diff dictionaries: {e}")

    return diff_json(d1_json, d2_json)


def diff_json(j1: str, j2: str) -> str:
    """
    Diffs two given JSON strings.
    TBD: Handle other inputs, like files, bytes, etc.
    """
    j1_canonical = json.dumps(json.loads(j1), indent=2, sort_keys=True)
    j2_canonical = json.dumps(json.loads(j2), indent=2, sort_keys=True)

    return diff_strings(j1_canonical, j2_canonical)


def set_dict_recursive(d: dict | list, key: str, value: str):
    """
    Set all values that match a key in a nested dictionary or list.
    """
    if isinstance(d, dict):
        for k, v in d.items():
            if isinstance(v, dict):
                set_dict_recursive(v, key, value)
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, dict):
                        set_dict_recursive(item, key, value)
            elif k == key:
                d[k] = value
    elif isinstance(d, list):
        for item in d:
            if isinstance(item, dict):
                set_dict_recursive(item, key, value)


def set_field_recursive(obj: any, field_name: str, value: any) -> None:
    """
    Recursively sets all fields with name 'field_name' to 'value' in the given object.
    Works with dictionaries, lists, Pydantic models, and other objects with attributes.

    Args:
        obj: The object to traverse (dict, list, Pydantic model, or other object)
        field_name: The name of the field to set
        value: The value to set the field to
    """
    from pydantic import BaseModel

    # Handle dictionary
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            if k == field_name:
                obj[k] = value
            else:
                set_field_recursive(v, field_name, value)

    # Handle list
    elif isinstance(obj, list):
        for item in obj:
            set_field_recursive(item, field_name, value)

    # Handle Pydantic models
    elif isinstance(obj, BaseModel):
        # Get the model fields as a dict and process them
        data = obj.model_dump()
        for k, v in data.items():
            if k == field_name:
                setattr(obj, k, value)
            else:
                model_value = getattr(obj, k)
                set_field_recursive(model_value, field_name, value)

    # # Handle other objects with attributes (non-primitive types)
    # elif hasattr(obj, "__dict__") and not isinstance(
    #     obj, (str, int, float, bool, type(None))
    # ):
    #     for k, v in list(obj.__dict__.items()):
    #         if k == field_name:
    #             setattr(obj, k, value)
    #         else:
    #             set_field_recursive(v, field_name, value)


def set_created_by(obj: any, created_by: str | CreatedBy) -> None:
    """
    Recursively sets the 'created_by' field to the given value in the given object.
    """
    assert isinstance(created_by, (str, CreatedBy))

    if isinstance(created_by, str):
        created_by = CreatedBy(id=created_by, object="user")

    set_field_recursive(obj, "created_by", created_by)
