from jsondoc.serialize import load_page
from jsondoc.utils import load_json_file

PAGE_PATH = "schema/page/ex2_success.json"


def test_load_page():
    content = load_json_file(PAGE_PATH)
    page = load_page(content)
    assert page is not None

    # Serialize it again
    serialized = page.model_dump_json(exclude_none=True)
    import ipdb; ipdb.set_trace()


if __name__ == "__main__":
    test_load_page()
