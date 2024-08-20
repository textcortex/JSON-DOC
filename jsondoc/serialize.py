import json
from copy import deepcopy
from typing import Any, Dict, Union

from pydantic import validate_call

from jsondoc.models.block import Type as BlockType
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
from jsondoc.models.block.types.rich_text import Type as RichTextType
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import RichTextText
from jsondoc.models.block.types.table import TableBlock
from jsondoc.models.block.types.table_row import TableRowBlock
from jsondoc.models.block.types.to_do import ToDoBlock
from jsondoc.models.block.types.toggle import ToggleBlock
from jsondoc.models.page import Page

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

RICH_TEXT_TYPES = {
    RichTextType.text: RichTextText,
    RichTextType.equation: RichTextEquation,
}


def load_rich_text(obj: Union[str, Dict[str, Any]]) -> RichTextBase:
    obj = deepcopy(obj)

    if isinstance(obj, str):
        obj = json.loads(obj)

    mutable_obj = dict(obj)

    # Extract and validate rich text type
    current_type = obj["type"]
    try:
        current_type = RichTextType(current_type)
    except ValueError:
        raise ValueError(f"Unsupported rich text type: {current_type}")

    # Find the corresponding rich text class
    rich_text_instantiator = RICH_TEXT_TYPES.get(current_type)
    if rich_text_instantiator is None:
        raise ValueError(f"Unsupported rich text type: {current_type}")

    # Create the rich text with all properties
    rich_text = rich_text_instantiator(**mutable_obj)
    return rich_text


@validate_call
def load_block(obj: Union[str, Dict[str, Any]]) -> BlockBase:
    obj = deepcopy(obj)

    if isinstance(obj, str):
        obj = json.loads(obj)

    mutable_obj = dict(obj)

    children = obj.pop("children", None)

    # Extract and validate block type
    current_type = obj["type"]
    try:
        current_type = BlockType(current_type)
    except ValueError:
        raise ValueError(f"Unsupported block type: {current_type}")

    # Find the corresponding block class
    block_instantiator = BLOCK_TYPES.get(current_type)
    if block_instantiator is None:
        raise ValueError(f"Unsupported block type: {current_type}")

    # Create a mutable copy of the object properties
    if children is not None:
        # Process children recursively
        processed_children = [load_block(child) for child in children]
        # Add processed children to the mutable object
        mutable_obj["children"] = processed_children

    # Process rich text
    # First get sub object field
    obj_field_key = current_type.value
    obj_field = mutable_obj.get(obj_field_key, {})
    # Check if there is a rich text field
    if "rich_text" in obj_field:
        # Must be a list
        if not isinstance(obj_field["rich_text"], list):
            raise ValueError(
                f"Rich text field must be a list: {obj_field['rich_text']}"
            )

        # Load rich text field
        rich_text = [load_rich_text(rich_text) for rich_text in obj_field["rich_text"]]
        # Replace rich text field
        obj_field["rich_text"] = rich_text

    # Create the block with all properties, including processed children
    block = block_instantiator(**mutable_obj)
    return block


@validate_call
def load_page(obj: Union[str, Dict[str, Any]]) -> Page:
    obj = deepcopy(obj)

    if isinstance(obj, str):
        obj = json.loads(obj)

    mutable_obj = dict(obj)

    children = mutable_obj.pop("children", [])
    mutable_obj["children"] = [load_block(child) for child in children]

    page = Page(**mutable_obj)
    return page
