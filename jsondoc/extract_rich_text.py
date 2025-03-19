from typing import Dict, List, Optional, Union

from pydantic import BaseModel

from jsondoc.convert.utils import block_supports_rich_text, get_rich_text_from_block
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.page import Page


class BackRef(BaseModel):
    block_id: str
    begin_idx: int
    end_idx: int


class TextWithBackref(BaseModel):
    text: str
    backrefs: list[BackRef]


def extract_rich_text_from_page(
    page: Page, include_annotations: bool = False
) -> Dict[str, Union[str, List[Dict]]]:
    """
    Extract all rich text content from a JSON-DOC page.

    Args:
        page: A JSON-DOC Page object
        include_annotations: If True, includes formatting info (bold, italic, etc.) in the output

    Returns:
        A dictionary containing:
        - 'title': The page title text
        - 'content': A list of text content from all blocks, each item is either:
          - A string (if include_annotations=False)
          - A dict with 'text' and 'annotations' (if include_annotations=True)
    """
    result = {"title": "", "content": []}

    # Extract title
    if page.properties.title and page.properties.title.title:
        title_texts = []
        for rich_text in page.properties.title.title:
            title_texts.append(rich_text.plain_text)
        result["title"] = "".join(title_texts)

    # Process all blocks recursively
    result["content"] = extract_rich_text_from_blocks(
        page.children, include_annotations
    )

    return result


def _process_rich_text_items(rich_text_list, include_annotations, result):
    """
    Helper function to process a list of rich text items and append them to the result.

    Args:
        rich_text_list: List of rich text items to process
        include_annotations: Whether to include formatting annotations
        result: The result list to append items to
    """
    if not rich_text_list:
        return

    for rich_text in rich_text_list:
        if include_annotations:
            result.append(
                {
                    "text": rich_text.plain_text,
                    "annotations": rich_text.annotations.model_dump()
                    if hasattr(rich_text, "annotations")
                    else {},
                    "href": rich_text.href if hasattr(rich_text, "href") else None,
                }
            )
        else:
            result.append(rich_text.plain_text)


def extract_rich_text_from_blocks(
    blocks: List[BlockBase], include_annotations: bool = False
) -> List[Union[str, Dict]]:
    """
    Extract rich text content from a list of blocks recursively.

    Args:
        blocks: List of BlockBase objects
        include_annotations: If True, includes formatting info in the output

    Returns:
        List of text content, either as strings or annotation dictionaries
    """
    result = []

    for block in blocks:
        # Extract rich text if the block supports it
        if block_supports_rich_text(block):
            try:
                rich_text_list = get_rich_text_from_block(block)
                _process_rich_text_items(rich_text_list, include_annotations, result)
            except ValueError:
                # Block doesn't support rich text (shouldn't happen due to our check)
                pass

        # Extract captions from blocks that support them
        if block.type == "image" and hasattr(block.image, "caption"):
            _process_rich_text_items(block.image.caption, include_annotations, result)
        elif block.type == "code" and hasattr(block.code, "caption"):
            _process_rich_text_items(block.code.caption, include_annotations, result)

        # Process child blocks recursively
        if hasattr(block, "children") and block.children:
            child_content = extract_rich_text_from_blocks(
                block.children, include_annotations
            )
            result.extend(child_content)

        # Handle special blocks like tables that have rich text in different structure
        if block.type == "table_row" and hasattr(block.table_row, "cells"):
            for cell in block.table_row.cells:
                if isinstance(cell, list):
                    _process_rich_text_items(cell, include_annotations, result)

    return result


def extract_plain_text_from_page(page: Page) -> str:
    """
    Extract all plain text content from a JSON-DOC page and return it as a single string.

    Args:
        page: A JSON-DOC Page object

    Returns:
        A string containing all the text content from the page
    """
    extracted = extract_rich_text_from_page(page, include_annotations=False)

    # Join title and content with appropriate separators
    result = []
    if extracted["title"]:
        result.append(extracted["title"])

    if extracted["content"]:
        # Filter out empty strings and join with spaces
        content_text = " ".join([item for item in extracted["content"] if item])
        if content_text:
            result.append(content_text)

    return "\n\n".join(result)


def extract_text_from_jsondoc_page_with_block_backref(
    page: Page,
) -> list[TextWithBackref]:
    """
    Extract rich text from jsondoc data.
    """
    rich_text = extract_rich_text_from_page(page)
    return rich_text
