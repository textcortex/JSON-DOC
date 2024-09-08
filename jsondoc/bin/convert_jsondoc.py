import argparse
import json
from jsondoc.convert.html import html_to_jsondoc
from jsondoc.convert.markdown import jsondoc_to_markdown
from jsondoc.serialize import jsondoc_dump_json, load_jsondoc


def convert_to_jsondoc(input_file, output_file=None, indent=None):
    # Read the input file
    with open(input_file, "r") as file:
        content = file.read()

    # Determine the file type based on extension
    file_extension = input_file.split(".")[-1].lower()

    if file_extension in ["html", "htm"]:
        # Convert HTML to jsondoc
        jsondoc = html_to_jsondoc(content)
    elif file_extension in ["md", "markdown"]:
        # For markdown, we'll first convert to HTML, then to jsondoc
        # This is a placeholder as we don't have a direct markdown to jsondoc converter
        html_content = markdown_to_html(
            content
        )  # You'll need to implement this function
        jsondoc = html_to_jsondoc(html_content)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

    # Serialize the jsondoc
    serialized_jsondoc = jsondoc_dump_json(jsondoc, indent=indent)

    if output_file:
        # Write the output to a file
        with open(output_file, "w") as file:
            file.write(serialized_jsondoc)
    else:
        # Print to terminal
        print(serialized_jsondoc)


def markdown_to_html(markdown_content):
    # Placeholder function for markdown to HTML conversion
    # You'll need to implement this using a markdown library
    # For example, you could use the `markdown` library:
    # import markdown
    # return markdown.markdown(markdown_content)
    raise NotImplementedError("Markdown to HTML conversion not implemented")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert files to jsondoc format")
    parser.add_argument("input_file", help="Path to the input file")
    parser.add_argument(
        "-o",
        "--output_file",
        help="Path to the output jsondoc file (optional)",
        default=None,
    )
    parser.add_argument(
        "--indent",
        type=int,
        help="Number of spaces for indentation in the output JSON file",
        default=None,
    )
    args = parser.parse_args()

    convert_to_jsondoc(
        args.input_file,
        args.output_file,
        indent=args.indent,
    )
