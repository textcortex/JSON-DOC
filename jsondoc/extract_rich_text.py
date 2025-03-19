from typing import Dict, List, Union

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


def extract_text_with_backref_from_page(
    page: Page, include_annotations: bool = False
) -> TextWithBackref:
    """
    Extract all rich text content from a JSON-DOC page as a single string
    with backrefs tracking the block origins.

    Args:
        page: A JSON-DOC Page object
        include_annotations: If True, includes formatting info (not used in backref tracking)

    Returns:
        TextWithBackref: Object containing concatenated text and backrefs
    """
    concat_text = ""
    backrefs = []

    # Extract title
    title_text = ""
    if page.properties.title and page.properties.title.title:
        for rich_text in page.properties.title.title:
            title_text += rich_text.plain_text

    if title_text:
        begin_idx = len(concat_text)
        concat_text += title_text
        end_idx = len(concat_text)
        # Add a backref for the page title using the page's ID
        backrefs.append(BackRef(block_id=page.id, begin_idx=begin_idx, end_idx=end_idx))
        # Add a newline after the title
        concat_text += "\n\n"

    # Process all blocks recursively and collect their text with backrefs
    blocks_with_text = _extract_blocks_with_text(page.children, include_annotations)

    # Add all blocks to the concatenated text with their respective backrefs
    for block_id, block_text in blocks_with_text:
        if block_text:
            begin_idx = len(concat_text)
            concat_text += block_text
            end_idx = len(concat_text)

            backrefs.append(
                BackRef(block_id=block_id, begin_idx=begin_idx, end_idx=end_idx)
            )

            # Add a space after each block
            concat_text += " "

    return TextWithBackref(text=concat_text.strip(), backrefs=backrefs)


def _extract_blocks_with_text(
    blocks: List[BlockBase], include_annotations: bool = False
) -> List[tuple[str, str]]:
    """
    Extract text from blocks and return a list of (block_id, text) tuples.

    Args:
        blocks: List of blocks to process
        include_annotations: Whether to include annotations (not used in this implementation)

    Returns:
        List of (block_id, text) tuples
    """
    result = []

    for block in blocks:
        # Get text from the current block
        block_text = _extract_text_from_single_block(block)
        if block_text:
            result.append((block.id, block_text))

        # Process child blocks recursively
        if hasattr(block, "children") and block.children:
            child_results = _extract_blocks_with_text(
                block.children, include_annotations
            )
            result.extend(child_results)

    return result


def _extract_text_from_single_block(block: BlockBase) -> str:
    """
    Extract text from a single block without processing its children.

    Args:
        block: The block to extract text from

    Returns:
        The text content of the block
    """
    result = []

    # Extract rich text if the block supports it
    if block_supports_rich_text(block):
        try:
            rich_text_list = get_rich_text_from_block(block)
            for rich_text in rich_text_list:
                result.append(rich_text.plain_text)
        except ValueError:
            pass

    # Extract captions from blocks that support them
    if block.type == "image" and hasattr(block.image, "caption"):
        for caption_text in block.image.caption:
            result.append(caption_text.plain_text)
    elif block.type == "code" and hasattr(block.code, "caption"):
        for caption_text in block.code.caption:
            result.append(caption_text.plain_text)

    # Handle special blocks like tables
    if block.type == "table_row" and hasattr(block.table_row, "cells"):
        for cell in block.table_row.cells:
            if isinstance(cell, list):
                for item in cell:
                    if hasattr(item, "plain_text"):
                        result.append(item.plain_text)

    return " ".join(result)


def _extract_text_from_block(
    block: BlockBase, include_annotations: bool = False
) -> str:
    """
    Extract all text from a single block, including its children.

    Args:
        block: The block to extract text from
        include_annotations: Whether to include annotations (not used in this implementation)

    Returns:
        A string with all text from the block
    """
    # Extract text from the current block
    result = [_extract_text_from_single_block(block)]

    # Process child blocks recursively
    if hasattr(block, "children") and block.children:
        for child in block.children:
            child_text = _extract_text_from_block(child, include_annotations)
            if child_text:
                result.append(child_text)

    return " ".join([text for text in result if text])


def extract_rich_text_from_page(page: Page, include_annotations: bool = False) -> Dict:
    """
    Extract all rich text content from a JSON-DOC page.

    Args:
        page: A JSON-DOC Page object
        include_annotations: If True, includes formatting info in the output

    Returns:
        Dictionary containing title and content lists
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


def _process_rich_text_items(
    rich_text_list: list[RichTextBase],
    include_annotations: bool,
    result: list,
) -> None:
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
