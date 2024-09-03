from jsondoc.convert.html import html_to_jsondoc

def test_convert_html_all_elements():
    path = "examples/html/html_all_elements.html"

    content = open(path, "r").read()

    ret = html_to_jsondoc(content)

    import ipdb; ipdb.set_trace()


if __name__ == "__main__":
    test_convert_html_all_elements()