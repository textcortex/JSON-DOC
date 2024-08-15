import json

ARBITRARY_OBJECT = {
    "type": "object",
    "properties": {},
    "additionalProperties": True,
}


def replace_refs_with_arbitrary_object(data):
    if isinstance(data, dict):
        if "$ref" in data:
            return ARBITRARY_OBJECT
        return {k: replace_refs_with_arbitrary_object(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_refs_with_arbitrary_object(item) for item in data]
    else:
        return data


def load_json_file(file_path, deserialize=True):
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
