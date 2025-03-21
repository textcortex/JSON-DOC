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
