import argparse
import re
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

# ---------- Argument Parsing ----------
DATA_URI_RE = re.compile(r"^\s*data:", re.I)


# ---------- Helper functions ----------
def redact_binary_attrs(tag: Tag) -> None:
    """Replace base64‐encoded `src` / `srcset` with a placeholder."""
    if tag.name == "img" and tag.has_attr("src") and DATA_URI_RE.match(tag["src"]):
        tag["src"] = "redacted"
    if (
        tag.name == "source"
        and tag.has_attr("srcset")
        and DATA_URI_RE.match(tag["srcset"])
    ):
        tag["srcset"] = "redacted"


def is_leaf(tag: Tag) -> bool:
    """Returns True if `tag` has no child *elements* (text is allowed)."""
    return not any(isinstance(c, Tag) for c in tag.contents)


def clean_node(tag: Tag) -> None:
    """Recursively clean a BeautifulSoup element in-place."""
    if isinstance(tag, NavigableString):
        return

    # 1. strip style attributes
    tag.attrs.pop("style", None)

    # 2. redact binary embeds
    redact_binary_attrs(tag)

    # 3. special-case SVG: keep the wrapper to preserve structure
    if tag.name == "svg":
        tag.clear()
        tag.append("<!-- redacted -->")

    # 4. recurse
    for child in list(tag.children):
        clean_node(child)


def prune_top_level(soup: BeautifulSoup) -> None:
    """Remove high-volume, low-value nodes entirely."""
    for n in soup.find_all(["script", "style", "noscript"]):
        n.decompose()
    for link in soup.find_all("link", rel=lambda x: x and "stylesheet" in x):
        link.decompose()


def clean_html(raw_html: str) -> str:
    soup = BeautifulSoup(raw_html, "lxml")
    prune_top_level(soup)
    clean_node(soup)
    # Pretty formatting keeps the tree readable yet compact
    return soup.prettify(formatter="minimal")


# ---------- Execute cleaning ----------
def main():
    parser = argparse.ArgumentParser(
        description="Clean and reduce HTML files by removing unnecessary content."
    )
    parser.add_argument("input_path", help="Path to the input HTML file")
    parser.add_argument("output_path", help="Path where the cleaned HTML will be saved")
    args = parser.parse_args()
    raw_html = Path(args.input_path).read_text(encoding="utf-8", errors="ignore")

    # Update MAX_LEAF_CHARS based on command line argument

    cleaned_html = clean_html(raw_html)

    # Save to disk
    Path(args.output_path).write_text(cleaned_html, encoding="utf-8")

    # Show a short preview to the user
    print(f"Saved cleaned HTML to {args.output_path}")
    print(f"Original size: {len(raw_html):,} characters")
    print(f"Cleaned size : {len(cleaned_html):,} characters")


if __name__ == "__main__":
    main()
