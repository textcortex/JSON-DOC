from jsondoc.serialize import load_page
from jsondoc.utils import load_json_file

PAGE_PATH = "schema/page/ex2_success.json"


def test_load_page():
    content = load_json_file(PAGE_PATH)

    # This should not raise any errors
    page = load_page(content)
    assert page is not None

    # Serialize it again
    serialized = page.model_dump_json(
        serialize_as_any=True,  # This argument is needed to output nested models
        # exclude_none=True,
    )

    # TBD: Compare the serialized content with the original content


if __name__ == "__main__":
    test_load_page()
