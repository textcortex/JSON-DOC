from typing import OrderedDict

from jsondoc.models.block.base import BlockBase
from jsondoc.models.page import Page


def extract_blocks(
    input_obj: Page | BlockBase | list[BlockBase],
) -> dict[str, BlockBase]:
    """
    Creates a mapping of block IDs to Block objects from various input types.

    Args:
        input_obj: Can be either a Page object, a single Block object, or a list of Block objects

    Returns:
        A dictionary mapping block IDs (strings) to their corresponding Block objects
    """
    block_map: dict[str, BlockBase] = OrderedDict()

    # Handle Page input
    if isinstance(input_obj, Page):
        # Process all blocks in the page
        for block in input_obj.children:
            _process_block_and_children(block, block_map)

    # Handle single Block input
    elif isinstance(input_obj, BlockBase):
        _process_block_and_children(input_obj, block_map)

    # Handle list of Blocks input
    elif isinstance(input_obj, list):
        for block in input_obj:
            if isinstance(block, BlockBase):
                _process_block_and_children(block, block_map)

    return block_map


def _process_block_and_children(
    block: BlockBase, block_map: dict[str, BlockBase]
) -> None:
    """
    Helper function to process a block and its children recursively, adding them to the block map.

    Args:
        block: The block to process
        block_map: The dictionary mapping block IDs to Block objects
    """
    # Add the current block to the map
    block_map[block.id] = block

    # Process children recursively if they exist
    if hasattr(block, "children") and block.children:
        for child in block.children:
            _process_block_and_children(child, block_map)


def replace_urls(
    input_obj: Page | BlockBase | list[BlockBase],
    url_replace_map: dict[str, str],
) -> None:
    """
    Recursively processes all blocks in the input object and replaces any file or image URLs
    that are found in the url_replace_map with their corresponding values.

    Args:
        input_obj: Can be either a Page object, a single Block object, or a list of Block objects
        url_replace_map: A dictionary mapping original URLs to their replacement URLs
    """
    # Extract all blocks
    blocks = extract_blocks(input_obj)

    # Process each block
    for block_id, block in blocks.items():
        _replace_url_in_block(block, url_replace_map)


def _replace_url_in_container(container, container_type, url_replace_map):
    """
    Helper function to replace URL in a file or external container.

    Args:
        container: The container object that might have URL information
        container_type: The type of container ('file' or 'external')
        url_replace_map: Dictionary mapping original URLs to replacement URLs
    """
    if not hasattr(container, container_type):
        return

    url_container = getattr(container, container_type)
    if hasattr(url_container, "url"):
        current_url = getattr(url_container, "url")
        if current_url in url_replace_map:
            setattr(url_container, "url", url_replace_map[current_url])


def _replace_url_in_block(block: BlockBase, url_replace_map: dict[str, str]) -> None:
    """
    Helper function to replace URLs in a specific block based on the url_replace_map.

    Args:
        block: The block to process
        url_replace_map: A dictionary mapping original URLs to their replacement URLs
    """
    if not hasattr(block, "type"):
        return

    block_type = getattr(block, "type")

    # Check for image block
    if block_type == "image" and hasattr(block, "image"):
        image = getattr(block, "image")
        if hasattr(image, "type"):
            image_type = getattr(image, "type")
            _replace_url_in_container(image, image_type, url_replace_map)

    # Check for file block
    elif block_type == "file" and hasattr(block, "file"):
        file_block = getattr(block, "file")
        if hasattr(file_block, "type"):
            file_type = getattr(file_block, "type")
            _replace_url_in_container(file_block, file_type, url_replace_map)
