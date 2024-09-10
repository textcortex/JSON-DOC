import json
import os
from pathlib import Path

from pydantic import BaseModel

from jsondoc.convert.html import html_to_jsondoc
from jsondoc.convert.markdown import jsondoc_to_markdown
from jsondoc.serialize import jsondoc_dump_json, load_jsondoc
from jsondoc.utils import diff_jsonable_dict, set_dict_recursive


def test_convert_html_all_elements():
    path = "examples/html/html_all_elements.html"

    content = open(path, "r").read()
    # content = "<p>This is a <b>bold</b> word and this is an <em>emphasized</em> word.</p>"

    ret = html_to_jsondoc(content)
    print(ret)

    # print("\n\nConverted to markdown:\n\n")
    # print(jsondoc_to_markdown(ret[0]))
    # print(jsondoc_to_markdown(ret))
    import ipdb

    ipdb.set_trace()


def compare_jsondoc(jsondoc1: BaseModel, jsondoc2: BaseModel) -> bool:
    jsondoc1 = jsondoc_dump_json(jsondoc1)
    jsondoc2 = jsondoc_dump_json(jsondoc2)

    # Load the jsondoc back as JSON
    jsondoc1 = json.loads(jsondoc1)
    jsondoc2 = json.loads(jsondoc2)

    # Set found time fields to ""
    fields_to_set_to_empty_string = [
        "id",
        "created_time",
        "last_edited_time",
        "expiry_time",
    ]
    for field in fields_to_set_to_empty_string:
        set_dict_recursive(jsondoc1, field, "")
        set_dict_recursive(jsondoc2, field, "")

    diff = diff_jsonable_dict(jsondoc1, jsondoc2)

    if len(diff) > 0:
        print(f"Discrepancies found:")
        print(diff)

    return len(diff) == 0


def _process_example(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)

    html_source = data.get("html")
    jsondoc_target = data.get("jsondoc")

    assert html_source is not None, f"file {json_path} does not contain field 'html'"
    assert (
        jsondoc_target is not None
    ), f"file {json_path} does not contain field 'jsondoc'"

    ret = html_to_jsondoc(html_source)

    # Load the jsondoc target
    jsondoc_reference = load_jsondoc(jsondoc_target)

    assert compare_jsondoc(ret, jsondoc_reference), f"file {json_path} does not match"


def test_examples():

    current_dir = Path(__file__).parent
    html_jsondoc_pairs_dir = current_dir / "html_jsondoc_pairs"

    json_files = [f for f in os.listdir(html_jsondoc_pairs_dir) if f.endswith(".json")]

    for json_file in json_files:
        print(f"Processing {json_file}...", end="")
        json_path = html_jsondoc_pairs_dir / json_file
        _process_example(json_path)
        print("PASS")


if __name__ == "__main__":
    test_examples()
    test_convert_html_all_elements()
