from typing import List, Literal, Optional, Type

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase


class PlaceholderBlockBase(BlockBase):
    """
    Base class for all placeholder blocks.
    """

    pass


class BreakElementPlaceholderBlock(PlaceholderBlockBase):
    type: Literal["break_element_placeholder"] = "break_element_placeholder"


class CaptionPlaceholderBlock(PlaceholderBlockBase):
    type: Literal["caption_placeholder"] = "caption_placeholder"
    rich_text: Optional[List[RichTextBase]] = None
    # children: Optional[List[BlockBase]] = None


class CellPlaceholderBlock(PlaceholderBlockBase):
    type: Literal["cell_placeholder"] = "cell_placeholder"
    rich_text: Optional[List[RichTextBase]] = None


class FigurePlaceholderBlock(PlaceholderBlockBase):
    type: Literal["figure_placeholder"] = "figure_placeholder"


PLACEHOLDER_BLOCKS: List[Type[PlaceholderBlockBase]] = [
    BreakElementPlaceholderBlock,
    CaptionPlaceholderBlock,
    CellPlaceholderBlock,
    FigurePlaceholderBlock,
]
