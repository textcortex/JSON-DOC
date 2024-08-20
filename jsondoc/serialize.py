import json
from typing import Any, Dict, Union

from pydantic import validate_call

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
from jsondoc.models.page import Page
from jsondoc.models.block import Type as BlockType

# Resolve block types

BLOCK_TYPES = {
    BlockType.paragraph: ParagraphBlock,
    BlockType.to_do: ToDoBlock,
    BlockType.bulleted_list_item: BulletedListItemBlock,
    BlockType.numbered_list_item: NumberedListItemBlock,
    BlockType.code: CodeBlock,
    BlockType.column: ColumnBlock,
    BlockType.column_list: ColumnListBlock,
    BlockType.divider: DividerBlock,
    BlockType.equation: EquationBlock,
    BlockType.heading_1: Heading1Block,
    BlockType.heading_2: Heading2Block,
    BlockType.heading_3: Heading3Block,
    BlockType.image: ImageBlock,
    BlockType.quote: QuoteBlock,
    BlockType.equation_1: EquationBlock,
    BlockType.table: TableBlock,
    BlockType.table_row: TableRowBlock,
    BlockType.toggle: ToggleBlock,
}

COUNTER = 0
@validate_call
def load_block(obj: Union[str, Dict[str, Any]]) -> BlockBase:
    global COUNTER
    COUNTER += 1
    print(f"Counter: {COUNTER}")

    if isinstance(obj, str):
        obj = json.loads(obj)

    children = obj.pop("children", None)
    if children is not None:
        obj["children"] = []

    current_type = obj["type"]
    try:
        current_type = BlockType(current_type)
    except ValueError:
        raise ValueError(f"Unsupported block type: {current_type}")

    block_instantiator = BLOCK_TYPES.get(current_type)
    if block_instantiator is None:
        raise ValueError(f"Unsupported block type: {current_type}")

    block = block_instantiator(**obj)
    if children is not None:
        if not hasattr(block, "children"):
            raise ValueError(f"Block {current_type} does not support children")

        block.children = [load_block(child) for child in children]

    return block


@validate_call
def load_page(obj: Union[str, Dict[str, Any]]) -> Page:
    if isinstance(obj, str):
        obj = json.loads(obj)

    children = obj.pop("children", [])
    obj["children"] = []
    page = Page(**obj)

    # for child in children:
    page.children = [load_block(child) for child in children]

    return page
