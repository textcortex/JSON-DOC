from jsondoc.convert.placeholder import CaptionPlaceholderBlock
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.bulleted_list_item import BulletedListItemBlock
from jsondoc.models.block.types.code import CodeBlock
from jsondoc.models.block.types.column import ColumnBlock
from jsondoc.models.block.types.column_list import ColumnListBlock
from jsondoc.models.block.types.divider import DividerBlock
from jsondoc.models.block.types.equation import EquationBlock
from jsondoc.models.block.types.heading_1 import Heading1Block
from jsondoc.models.block.types.heading_2 import Heading2Block
from jsondoc.models.block.types.heading_3 import Heading3Block
from jsondoc.models.block.types.image import ImageBlock
from jsondoc.models.block.types.numbered_list_item import NumberedListItemBlock
from jsondoc.models.block.types.paragraph import ParagraphBlock
from jsondoc.models.block.types.quote import QuoteBlock
from jsondoc.models.block.types.table import TableBlock
from jsondoc.models.block.types.table_row import TableRowBlock
from jsondoc.models.block.types.to_do import ToDoBlock
from jsondoc.models.block.types.toggle import ToggleBlock

# TODO:
# - If type: synced_block is added, add it down below as well

ALL_BLOCK_TYPES = [
    BulletedListItemBlock,
    CodeBlock,
    ColumnBlock,
    ColumnListBlock,
    DividerBlock,
    EquationBlock,
    Heading1Block,
    Heading2Block,
    Heading3Block,
    ImageBlock,
    NumberedListItemBlock,
    ParagraphBlock,
    QuoteBlock,
    TableBlock,
    TableRowBlock,
    ToDoBlock,
    ToggleBlock,
]

ALLOWED_CHILDREN_BLOCK_TYPES = {
    BulletedListItemBlock: ALL_BLOCK_TYPES,
    CodeBlock: [],
    ColumnBlock: ALL_BLOCK_TYPES,
    ColumnListBlock: [ColumnBlock],
    DividerBlock: [],
    EquationBlock: [],
    Heading1Block: [],
    Heading2Block: [],
    Heading3Block: [],
    ImageBlock: [],
    NumberedListItemBlock: ALL_BLOCK_TYPES,
    ParagraphBlock: ALL_BLOCK_TYPES,
    QuoteBlock: ALL_BLOCK_TYPES,
    TableBlock: [TableRowBlock],
    TableRowBlock: [],
    ToDoBlock: ALL_BLOCK_TYPES,
    ToggleBlock: ALL_BLOCK_TYPES,
    CaptionPlaceholderBlock: [ParagraphBlock],
}


def is_block_child_allowed(parent: BlockBase, child: BlockBase) -> bool:
    """
    Given a parent block and a child block,
    this function will return True if the child block is allowed
    as a child of the parent block, otherwise False
    """
    allowed_types = ALLOWED_CHILDREN_BLOCK_TYPES[type(parent)]
    for allowed_type in allowed_types:
        if isinstance(child, allowed_type):
            return True
    return False
