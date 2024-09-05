from jsondoc.convert.html import html_to_jsondoc

def test_convert_html_all_elements():
    path = "examples/html/html_all_elements.html"

    content = open(path, "r").read()
    content = "<p>This is a <b>bold</b> word and this is an <em>emphasized</em> word.</p>"

    ret = html_to_jsondoc(content)
    print(ret)
    import ipdb; ipdb.set_trace()


if __name__ == "__main__":
    test_convert_html_all_elements()