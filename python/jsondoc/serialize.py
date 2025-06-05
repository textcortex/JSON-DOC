import json
from copy import deepcopy
from typing import Any, Dict, List, Type, Union

from pydantic import BaseModel, validate_call

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
from jsondoc.models.block.types.image.external_image import ExternalImage
from jsondoc.models.block.types.image.file_image import FileImage
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
from jsondoc.models.file import Type as FileType
from jsondoc.models.file.base import FileBase
from jsondoc.models.page import Page
from jsondoc.utils import get_nested_value, set_nested_value

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

IMAGE_FILE_TYPES = {
    FileType.file: FileImage,
    FileType.external: ExternalImage,
}

OTHER_RICH_TEXT_FIELDS = {
    BlockType.code: [".code.caption"],
    BlockType.image: [".image.caption"],
}


# Cell fields are nested lists of rich texts
NESTED_RICH_TEXT_FIELDS = {
    BlockType.table_row: [".table_row.cells"],
}


def load_rich_text(obj: Union[str, Dict[str, Any]]) -> Type[RichTextBase]:
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


def load_image(obj: Union[str, Dict[str, Any]]) -> Type[FileBase]:
    """
    For some reason, the file's type field is at the parent level of the file object.

    {
        "type": "file",
        "file": {
            "url": "...",
            "expiry_time": "2024-08-09T13:15:57.161Z",
        },
    }

    For that reason, we input the type as a separate argument.
    """
    obj = deepcopy(obj)

    if isinstance(obj, str):
        obj = json.loads(obj)

    mutable_obj = dict(obj)
    try:
        current_type = mutable_obj.get("type")
        current_type = FileType(current_type)
    except ValueError:
        raise ValueError(f"Unsupported file type: {current_type}")

    # Find the corresponding file class
    file_instantiator = IMAGE_FILE_TYPES.get(current_type)

    # Create the file with all properties
    file = file_instantiator(**mutable_obj)
    return file


@validate_call
def load_block(obj: Union[str, Dict[str, Any]]) -> Type[BlockBase]:
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

    # Process caption field
    if current_type in OTHER_RICH_TEXT_FIELDS:
        rt_fields = OTHER_RICH_TEXT_FIELDS[current_type]
        for rt_field in rt_fields:
            val_ = get_nested_value(mutable_obj, rt_field)

            if val_ is None:
                continue

            if not isinstance(val_, list):
                raise ValueError(f"Field {rt_field} must be a list: {val_}")

            new_val = [load_rich_text(rich_text) for rich_text in val_]
            set_nested_value(mutable_obj, rt_field, new_val)

    # Process cell field
    if current_type in NESTED_RICH_TEXT_FIELDS:
        rt_fields = NESTED_RICH_TEXT_FIELDS[current_type]
        for rt_field in rt_fields:
            val_ = get_nested_value(mutable_obj, rt_field)

            if not isinstance(val_, list):
                raise ValueError(f"Field {rt_field} must be a list: {val_}")

            new_val = []
            for row in val_:
                new_row = [load_rich_text(rich_text) for rich_text in row]
                new_val.append(new_row)
            set_nested_value(mutable_obj, rt_field, new_val)

    # Process image field
    if current_type == BlockType.image:
        file_field = ".image"
        val_ = get_nested_value(mutable_obj, file_field)
        new_val = load_image(val_)
        set_nested_value(mutable_obj, file_field, new_val)

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


@validate_call
def load_jsondoc(
    obj: Union[str, Dict[str, Any], List[Dict[str, Any]]],
) -> Page | BlockBase | List[BlockBase]:
    if isinstance(obj, str):
        obj = json.loads(obj)

    if isinstance(obj, list):
        return [load_jsondoc(block) for block in obj]

    object_ = obj.get("object")
    if object_ == "page":
        return load_page(obj)
    elif object_ == "block":
        return load_block(obj)
    else:
        raise ValueError("Invalid object: must be either 'page' or 'block'")


def base_model_dump_json(obj: BaseModel, indent: int | None = None) -> str:
    return obj.model_dump_json(
        serialize_as_any=True,
        exclude_none=True,
        indent=indent,
    )


@validate_call
def jsondoc_dump_json(
    obj: BlockBase | List[BlockBase] | Page,
    indent: int | None = None,
) -> str:
    """
    Serializes an input JSON-DOC object to a JSON string.

    :param obj: JSON-DOC object to serialize (can be a single block, a list of blocks, or a page)
    :param indent: Indentation level for the JSON string
    :return: JSON string
    """
    if isinstance(obj, list):
        strs = [base_model_dump_json(block, indent=indent) for block in obj]
        dicts = [json.loads(s) for s in strs]
        return json.dumps(dicts, indent=indent)
    else:
        return base_model_dump_json(obj, indent=indent)
