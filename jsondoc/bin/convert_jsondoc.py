import argparse
import pypandoc

from jsondoc.convert.html import html_to_jsondoc
from jsondoc.convert.markdown import jsondoc_to_markdown
from jsondoc.serialize import jsondoc_dump_json


def convert_to_jsondoc(input_file, output_file=None, indent=None):
    # Read the input file

    # Determine the file type based on extension
    file_extension = input_file.split(".")[-1].lower()

    if file_extension in ["html", "htm"]:
        with open(input_file, "r") as file:
            html_content = file.read()
    else:
        try:
            html_content = pypandoc.convert_file(input_file, "html")
        except RuntimeError as e:
            raise ValueError(f"File type not supported for conversion: {input_file}")

    jsondoc = html_to_jsondoc(html_content)

    # Serialize the jsondoc
    serialized_jsondoc = jsondoc_dump_json(jsondoc, indent=indent)

    if output_file:
        # Write the output to a file
        with open(output_file, "w") as file:
            file.write(serialized_jsondoc)
    else:
        # Print to terminal
        print(serialized_jsondoc)
        # import ipdb; ipdb.set_trace()
        # print(jsondoc_to_markdown(jsondoc))


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

    try:
        convert_to_jsondoc(
            args.input_file,
            args.output_file,
            indent=args.indent,
        )
    except ValueError as e:
        print(e)
        exit(1)
