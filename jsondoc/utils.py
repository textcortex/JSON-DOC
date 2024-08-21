import json

ARBITRARY_JSON_SCHEMA_OBJECT = {
    "type": "object",
    "properties": {},
    "additionalProperties": True,
}


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
