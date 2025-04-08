from jsondoc.convert.html import html_to_jsondoc
from jsondoc.convert.markdown import jsondoc_to_markdown
from jsondoc.serialize import load_jsondoc, load_page
from jsondoc.utils import load_json_file


def test_convert_jsondoc_to_markdown():
    path = "schema/page/ex1_success.json"
    content = load_json_file(path)
    page = load_jsondoc(content)

    print(jsondoc_to_markdown(page))


if __name__ == "__main__":
    test_convert_jsondoc_to_markdown()
