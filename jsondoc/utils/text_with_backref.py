from typing import Dict, List, Union

from pydantic import BaseModel

from jsondoc.convert.utils import block_supports_rich_text, get_rich_text_from_block
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.page import Page


class BackRef(BaseModel):
    plain_text: str
    block_id: str
    start_idx: int
    end_idx: int


class TextWithBackrefs(BaseModel):
    text: str
    backrefs: list[BackRef]

    def get_intersecting_backrefs(self, start_idx: int, end_idx: int) -> list[BackRef]:
        """
        Returns all backrefs that intersect with the given text range.

        A backref intersects if any part of it overlaps with the range defined by start_idx and end_idx.
        This happens when the backref starts before the end of the range AND ends after the start of the range.

        Args:
            start_idx: The starting index of the text range
            end_idx: The ending index of the text range (exclusive)

        Returns:
            A list of BackRef objects that intersect with the given range
        """
        return [
            backref
            for backref in self.backrefs
            if backref.start_idx < end_idx and backref.end_idx > start_idx
        ]


def extract_text_with_backref_from_page(
    page: Page, include_annotations: bool = False
) -> TextWithBackrefs:
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
        start_idx = len(concat_text)
        concat_text += title_text
        end_idx = len(concat_text)
        # Add a backref for the page title using the page's ID
        backrefs.append(
            BackRef(
                plain_text=title_text,
                block_id=page.id,
                start_idx=start_idx,
                end_idx=end_idx,
            )
        )
        # Add a newline after the title
        concat_text += "\n\n"

    # Process all blocks recursively and collect their text with backrefs
    blocks_with_text = _extract_blocks_with_text(page.children, include_annotations)

    # Add all blocks to the concatenated text with their respective backrefs
    for block_id, block_text in blocks_with_text:
        if block_text:
            start_idx = len(concat_text)
            concat_text += block_text
            end_idx = len(concat_text)

            backrefs.append(
                BackRef(
                    plain_text=block_text,
                    block_id=block_id,
                    start_idx=start_idx,
                    end_idx=end_idx,
                )
            )

            # Add a space after each block
            concat_text += " "

    return TextWithBackrefs(text=concat_text.strip(), backrefs=backrefs)


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
