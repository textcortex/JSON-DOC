import argparse
import sys

import pypandoc

from jsondoc.convert.html import html_to_jsondoc
from jsondoc.convert.markdown import jsondoc_to_markdown
from jsondoc.serialize import jsondoc_dump_json, load_jsondoc
from jsondoc.utils import set_created_by

ALLOWED_FORMATS = [
    "jsondoc",
    "biblatex",
    "bibtex",
    "commonmark",
    "commonmark_x",
    "creole",
    "csljson",
    "csv",
    "docbook",
    "docx",
    "dokuwiki",
    "endnotexml",
    "epub",
    "fb2",
    "gfm",
    "haddock",
    "html",
    "ipynb",
    "jats",
    "jira",
    "json",
    "latex",
    "man",
    "markdown",
    "markdown_github",
    "markdown_mmd",
    "markdown_phpextra",
    "markdown_strict",
    "mediawiki",
    "muse",
    "native",
    "odt",
    "opml",
    "org",
    "ris",
    "rst",
    "rtf",
    "t2t",
    "textile",
    "tikiwiki",
    "tsv",
    "twiki",
    "vimwiki",
]


def validate_format(format):
    if format is not None:
        if format not in ALLOWED_FORMATS:
            raise ValueError(f"Format not supported: {format}")


def convert_to_jsondoc(
    input_file: str | None = None,
    output_file: str | None = None,
    indent: int | None = None,
    source_format: str | None = None,
    target_format: str | None = None,
    force_page: bool = False,
    created_by: str | None = None,
):
    """
    Convert to and from JSON-DOC format.
    """
    # Determine the file type based on extension
    if source_format is not None and input_file is not None:
        file_extension = input_file.split(".")[-1].lower()
        if file_extension in ["html", "htm"]:
            source_format = "html"

    if source_format is not None:
        validate_format(source_format)

    input_content = None
    if input_file is None:
        assert source_format is not None, (
            "Source format must be specified if input file is not provided"
        )

        # Read from stdin
        input_content = sys.stdin.read()
    else:
        if source_format in ["html", "jsondoc"]:
            with open(input_file, "r") as file:
                input_content = file.read()

    if target_format is not None:
        validate_format(target_format)

    if source_format is not None and target_format is not None:
        formats_ = set([source_format, target_format])
        assert len(formats_) == 2, "Source and target formats must be different"
        if "jsondoc" not in formats_:
            raise ValueError("Converting only to/from JSON-DOC is not supported. ")

    if source_format == "jsondoc":
        assert target_format is not None, "Target format must be specified"
        assert target_format == "markdown", (
            "Currently can only convert from JSON-DOC to Markdown"
        )

        if input_content is None:
            raise Exception(
                "Input content should have been read by this point. "
                "This should not happen"
            )

        jsondoc = load_jsondoc(input_content)
        if output_file:
            with open(output_file, "w") as file:
                file.write(jsondoc_to_markdown(jsondoc))
        else:
            print(jsondoc_to_markdown(jsondoc))
    else:
        if source_format == "html":
            html_content = input_content
        else:
            try:
                html_content = pypandoc.convert_file(
                    input_content if input_content is not None else input_file,
                    "html",
                    format=source_format,
                    extra_args=["--wrap=none"],
                )
            except RuntimeError as e:
                # Handle different error message from Pandoc
                error_message = str(e)
                if "invalid input format" in error_message.lower():
                    raise ValueError(
                        f"File type not supported for conversion: {input_file}"
                    )
                elif "missing format" in error_message.lower():
                    raise ValueError(
                        "Could not determine file type for conversion. "
                        "Please specify the source formats with -s or --source_format."
                    )
                else:
                    raise e

        jsondoc = html_to_jsondoc(html_content, force_page=force_page)
        if created_by is not None:
            set_created_by(jsondoc, created_by)

        # Serialize the jsondoc
        serialized_jsondoc = jsondoc_dump_json(jsondoc, indent=indent)

        if output_file:
            # Write the output to a file
            with open(output_file, "w") as file:
                file.write(serialized_jsondoc)
        else:
            # Print to terminal
            print(serialized_jsondoc)


def main():
    parser = argparse.ArgumentParser(description="Convert files to jsondoc format")
    parser.add_argument(
        "-i",
        "--input_file",
        help="Path to the input file",
        default=None,
    )
    parser.add_argument(
        "-o",
        "--output_file",
        help="Path to the output jsondoc file (optional)",
        default=None,
    )
    parser.add_argument(
        "-s",
        "--source_format",
        help="Format of the input file",
        default=None,
    )
    parser.add_argument(
        "-t",
        "--target_format",
        help="Format of the output file",
        default=None,
    )
    parser.add_argument(
        "--indent",
        type=int,
        help="Number of spaces for indentation in the output JSON file",
        default=None,
    )
    parser.add_argument(
        "--force-page",
        action="store_true",
        help="Force the creation of a page even if the input doesn't "
        "contain a top-level HTML structure",
    )
    parser.add_argument(
        "--created-by",
        type=str,
        help="An identifier for the entity that created the JSON-DOC file",
        default=None,
    )
    args = parser.parse_args()

    try:
        convert_to_jsondoc(
            args.input_file,
            args.output_file,
            indent=args.indent,
            source_format=args.source_format,
            target_format=args.target_format,
            force_page=args.force_page,
            created_by=args.created_by,
        )
    except (ValueError, RuntimeError) as e:
        print(e)
        exit(1)


if __name__ == "__main__":
    main()
