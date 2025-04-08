import difflib
import json
import time

from jsondoc.serialize import load_page
from jsondoc.utils import diff_strings, load_json_file, timer

PAGE_PATH = "schema/page/ex1_success.json"


def remove_null_fields(string):
    """
    This is just to make the test pass, because they get removed when
    we serialize the model with exclude_none=True
    """
    lines = string.splitlines()
    to_remove = [
        '"link": null',
        '"href": null',
    ]
    # Remove lines that contain the fields
    lines = [line for line in lines if all(field not in line for field in to_remove)]
    return "\n".join(lines)


def remove_commas_from_end_of_lines(string):
    return "\n".join([line.rstrip(",") for line in string.splitlines()])


def test_load_page():
    content = load_json_file(PAGE_PATH)

    # This should not raise any errors
    with timer("load_page", unit="ms"):
        page = load_page(content)

    assert page is not None

    # Serialize it again
    serialized = page.model_dump_json(
        serialize_as_any=True,  # This argument is needed to output nested models
        exclude_none=True,
    )

    canonical_content = json.dumps(content, indent=2, sort_keys=True)
    canonical_serialized = json.dumps(json.loads(serialized), indent=2, sort_keys=True)

    canonical_content = remove_null_fields(canonical_content)

    # Remove commas from the end of lines
    canonical_content = remove_commas_from_end_of_lines(canonical_content)
    canonical_serialized = remove_commas_from_end_of_lines(canonical_serialized)

    # Indented versions
    # canonical_content = json.dumps
    diff = diff_strings(canonical_content, canonical_serialized)

    assert len(diff) == 0, (
        "The serialized content is different from the original content:\n" + diff
    )


if __name__ == "__main__":
    test_load_page()
