import logging
import re
from datetime import datetime, timezone
from typing import List, Literal, Optional, Type

from bs4 import Tag
from pydantic import validate_call

from jsondoc.convert.placeholder import (
    CaptionPlaceholderBlock,
    CellPlaceholderBlock,
    PlaceholderBlockBase,
)
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.bulleted_list_item import (
    BulletedListItem,
    BulletedListItemBlock,
)
from jsondoc.models.block.types.code import Code, CodeBlock, Language
from jsondoc.models.block.types.column import ColumnBlock
from jsondoc.models.block.types.column_list import ColumnListBlock
from jsondoc.models.block.types.divider import DividerBlock
from jsondoc.models.block.types.equation import EquationBlock
from jsondoc.models.block.types.heading_1 import Heading1, Heading1Block
from jsondoc.models.block.types.heading_2 import Heading2, Heading2Block
from jsondoc.models.block.types.heading_3 import Heading3, Heading3Block
from jsondoc.models.block.types.image import ImageBlock
from jsondoc.models.block.types.image.external_image import ExternalImage
from jsondoc.models.block.types.image.file_image import FileImage
from jsondoc.models.block.types.numbered_list_item import (
    NumberedListItem,
    NumberedListItemBlock,
)
from jsondoc.models.block.types.paragraph import Paragraph, ParagraphBlock
from jsondoc.models.block.types.quote import Quote, QuoteBlock
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import Equation as EquationObj
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import Link, RichTextText, Text
from jsondoc.models.block.types.table import Table, TableBlock
from jsondoc.models.block.types.table_row import TableRow, TableRowBlock
from jsondoc.models.block.types.to_do import ToDoBlock
from jsondoc.models.block.types.toggle import ToggleBlock
from jsondoc.models.file.external import External
from jsondoc.models.page import CreatedBy, LastEditedBy, Page, Parent, Properties, Title
from jsondoc.models.shared_definitions import Annotations
from jsondoc.rules import is_block_child_allowed
from jsondoc.utils import generate_block_id, generate_page_id, get_current_time

all_whitespace_re = re.compile(r"[\s]+")


BLOCKS_WITH_RICH_TEXT: List[Type[BlockBase]] = [
    ParagraphBlock,
    CodeBlock,
    Heading1Block,
    Heading2Block,
    Heading3Block,
    QuoteBlock,
    BulletedListItemBlock,
    NumberedListItemBlock,
    ToDoBlock,
    ToggleBlock,
]

PLACEHOLDER_BLOCKS_WITH_RICH_TEXT: List[Type[PlaceholderBlockBase]] = [
    CaptionPlaceholderBlock,
    CellPlaceholderBlock,
]


def create_rich_text(
    text: str | None = None,
    url: str | None = None,
    equation: str | None = None,
    bold: bool | None = None,
    italic: bool | None = None,
    strikethrough: bool | None = None,
    underline: bool | None = None,
    code: bool | None = None,
    color: str | None = None,
    annotations: Annotations | None = None,
) -> RichTextText | RichTextEquation:
    if text is not None and equation is not None:
        raise ValueError("Only one of text or equation must be provided")

    if annotations is None:
        annotations = Annotations(
            bold=bold,
            italic=italic,
            strikethrough=strikethrough,
            underline=underline,
            code=code,
            color=color,
        )

    if equation is not None:
        if url is not None:
            logging.warning("URL is not supported for equations, ignoring the URL")

        ret = RichTextEquation(
            equation=RichTextEquation(expression=equation),
            annotations=annotations,
            plain_text=equation,
            # Equations don't support URLs
            href=None,
        )
    else:
        ret = RichTextText(
            text=Text(
                content=text if text else "",
                link=Link(url=url) if url else None,
            ),
            annotations=annotations,
            plain_text=text if text else "",
            href=url if url else None,
        )

    return ret


def append_to_rich_text(rich_text: RichTextBase, text: str) -> RichTextBase:
    if isinstance(rich_text, RichTextText):
        rich_text.text.content += text
        rich_text.plain_text += text
    elif isinstance(rich_text, RichTextEquation):
        rich_text.equation.expression += text
        rich_text.plain_text += text
    else:
        raise ValueError(f"Unsupported rich text type: {type(rich_text)}")
    return rich_text


def create_paragraph_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    metadata: dict | None = None,
    typeid: bool = False,
    **kwargs,
) -> ParagraphBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)
    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return ParagraphBlock(
        id=id,
        created_time=created_time,
        paragraph=Paragraph(rich_text=rich_text),
        has_children=False,
        metadata=metadata,
    )


def create_bullet_list_item_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> BulletedListItemBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)
    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return BulletedListItemBlock(
        id=id,
        created_time=created_time,
        bulleted_list_item=BulletedListItem(rich_text=rich_text),
        has_children=False,
    )


def create_numbered_list_item_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> NumberedListItemBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)
    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return NumberedListItemBlock(
        id=id,
        created_time=created_time,
        numbered_list_item=NumberedListItem(rich_text=rich_text),
        has_children=False,
    )


def create_code_block(
    code: str | None = None,
    language: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> CodeBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)
    if created_time is None:
        created_time = get_current_time()

    language_ = None
    try:
        language_ = Language(language)
    except ValueError:
        logging.warning(f"Unsupported language: {language}")

    rich_text = []
    if code is not None:
        rich_text.append(create_rich_text(code, **kwargs))

    return CodeBlock(
        id=id,
        created_time=created_time,
        code=Code(
            rich_text=rich_text,
            language=language_,
        ),
        has_children=False,
    )


def create_divider_block(
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
) -> DividerBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)
    if created_time is None:
        created_time = get_current_time()

    return DividerBlock(
        id=id,
        created_time=created_time,
        divider={},
        has_children=False,
    )


def create_h1_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> Heading1Block:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return Heading1Block(
        id=id,
        created_time=created_time,
        heading_1=Heading1(rich_text=rich_text),
        has_children=False,
    )


def create_h2_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> Heading2Block:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return Heading2Block(
        id=id,
        created_time=created_time,
        heading_2=Heading2(rich_text=rich_text),
        has_children=False,
    )


def create_h3_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> Heading3Block:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return Heading3Block(
        id=id,
        created_time=created_time,
        heading_3=Heading3(rich_text=rich_text),
        has_children=False,
    )


def create_image_block(
    url: str,
    caption: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
) -> ImageBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    caption_ = None
    if caption is not None:
        caption_ = [create_rich_text(caption)]

    ret = ImageBlock(
        id=id,
        created_time=created_time,
        image=ExternalImage(
            external=External(url=url),
            caption=caption_,
        ),
    )
    return ret


def create_quote_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
    **kwargs,
) -> QuoteBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return QuoteBlock(
        id=id,
        created_time=created_time,
        quote=Quote(rich_text=rich_text),
        has_children=False,
    )


def create_table_row_block(
    cells: List[List[RichTextBase]] = [],
    id: str | None = None,
    created_time=None,
    typeid: bool = False,
) -> TableRowBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    return TableRowBlock(
        id=id,
        created_time=created_time,
        table_row=TableRow(cells=cells),
        has_children=False,
    )


def create_table_block(
    table_rows: List[TableRowBlock] = [],
    id: str | None = None,
    created_time=None,
    table_width: int | None = None,
    has_column_header: bool = False,
    has_row_header: bool = False,
    typeid: bool = False,
) -> TableBlock:
    if id is None:
        id = generate_block_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    return TableBlock(
        id=id,
        created_time=created_time,
        children=table_rows,
        table=Table(
            table_width=table_width,
            has_column_header=has_column_header,
            has_row_header=has_row_header,
        ),
    )


def create_page(
    id: str | None = None,
    created_time=None,
    created_by: str | None = None,
    last_edited_time: datetime | None = None,
    last_edited_by: str | None = None,
    children: List[BlockBase] = [],
    title: str | List[RichTextBase] | None = None,
    archived: bool | None = None,
    in_trash: bool | None = None,
    typeid: bool = False,
    # parent: str | None = None,
    # icon # TBD
) -> Page:
    """
    Creates a page with the given blocks
    """
    if id is None:
        id = generate_page_id(typeid=typeid)

    if created_time is None:
        created_time = get_current_time()

    created_by_ = None
    if created_by is not None:
        created_by_ = CreatedBy(id=created_by)

    last_edited_by_ = None
    if last_edited_by is not None:
        last_edited_by_ = LastEditedBy(id=last_edited_by)

    if last_edited_time is not None:
        # Ensure that it has timezone information
        if last_edited_time.tzinfo is None:
            raise ValueError("last_edited_time must be timezone-aware")

    title_ = None
    if title is not None:
        # Create rich text if title is a string
        if isinstance(title, str):
            title = [create_rich_text(title)]

        title_ = Title(title=title)

    properties = Properties(title=title_)

    # if parent is not None:
    #     parent_ = Parent(type="page_id", page_id=parent)

    return Page(
        id=id,
        created_time=created_time,
        created_by=created_by_,
        last_edited_time=last_edited_time,
        last_edited_by=last_edited_by_,
        children=children,
        properties=properties,
        archived=archived,
        in_trash=in_trash,
    )


def create_cell_placeholder_block():
    return CellPlaceholderBlock(
        id="",
        created_time=get_current_time(),
        type="cell_placeholder",
        rich_text=[],
    )


def get_rich_text_from_block(block: BlockBase) -> List[RichTextBase]:
    """
    Returns the rich text of a block. If the block does not support rich text,
    it will raise a ValueError. If the rich text is not initialized, it will
    initialize it to an empty list and return that.
    """
    if not block_supports_rich_text(block):
        raise ValueError(f"Block of type {type(block)} does not support rich text")

    ret = None
    if isinstance(block, ParagraphBlock):
        if block.paragraph.rich_text is None:
            block.paragraph.rich_text = []
        ret = block.paragraph.rich_text
    elif isinstance(block, CodeBlock):
        if block.code.rich_text is None:
            block.code.rich_text = []
        ret = block.code.rich_text
    elif isinstance(block, Heading1Block):
        if block.heading_1.rich_text is None:
            block.heading_1.rich_text = []
        ret = block.heading_1.rich_text
    elif isinstance(block, Heading2Block):
        if block.heading_2.rich_text is None:
            block.heading_2.rich_text = []
        ret = block.heading_2.rich_text
    elif isinstance(block, Heading3Block):
        if block.heading_3.rich_text is None:
            block.heading_3.rich_text = []
        ret = block.heading_3.rich_text
    elif isinstance(block, QuoteBlock):
        if block.quote.rich_text is None:
            block.quote.rich_text = []
        ret = block.quote.rich_text
    elif isinstance(block, BulletedListItemBlock):
        if block.bulleted_list_item.rich_text is None:
            block.bulleted_list_item.rich_text = []
        ret = block.bulleted_list_item.rich_text
    elif isinstance(block, NumberedListItemBlock):
        if block.numbered_list_item.rich_text is None:
            block.numbered_list_item.rich_text = []
        ret = block.numbered_list_item.rich_text
    elif isinstance(block, ToDoBlock):
        if block.to_do.rich_text is None:
            block.to_do.rich_text = []
        ret = block.to_do.rich_text
    elif isinstance(block, ToggleBlock):
        if block.toggle.rich_text is None:
            block.toggle.rich_text = []
        ret = block.toggle.rich_text
    # Placeholder blocks with rich text
    elif isinstance(block, CaptionPlaceholderBlock):
        if block.rich_text is None:
            block.rich_text = []
        ret = block.rich_text
    elif isinstance(block, CellPlaceholderBlock):
        if block.rich_text is None:
            block.rich_text = []
        ret = block.rich_text
    else:
        raise Exception(
            f"Unsupported block type: {type(block)}. "
            "This should not happen as long as this function implements all block types."
        )
    # else:
    #     raise ValueError(f"Unsupported block type: {type(block)}")

    return ret


def append_rich_text_to_block(block: BlockBase, rich_text: RichTextBase):
    # if not isinstance(block, BlockBase) or not isinstance(rich_text, RichTextBase):
    #     return False
    if not block_supports_rich_text(block):
        raise ValueError(f"Block of type {type(block)} does not support rich text")

    rich_text_list = get_rich_text_from_block(block)
    rich_text_list.append(rich_text)


def block_supports_rich_text(block: BlockBase) -> bool:
    return type(block) in BLOCKS_WITH_RICH_TEXT + PLACEHOLDER_BLOCKS_WITH_RICH_TEXT


@validate_call
def append_to_parent_block(parent: BlockBase, child: BlockBase) -> bool:
    """
    Appends a child block to a parent block
    """
    if not hasattr(parent, "children"):
        raise ValueError("Parent block cannot have children")

    if not is_block_child_allowed(parent, child):
        raise ValueError(
            f"Parent block of type {type(parent)} does not allow "
            f"children of type {type(child)}"
        )

    if parent.children is None:
        parent.children = []

    parent.children.append(child)

    if parent.has_children is False:
        parent.has_children = True

    return True


def html_table_has_header_row(table: Tag) -> bool:
    """
    Check if an HTML table has a header row.
    """
    # Check if there's a thead element
    if table.find("thead"):
        return True

    # Check the first row of the table
    first_row = table.find("tr")
    if first_row:
        # If all cells in the first row are th, it's a header row
        if all(cell.name == "th" for cell in first_row.find_all(["td", "th"])):
            return True

        # If it's the first row in a tbody and there's no thead, it might be a header
        if (
            first_row.parent.name == "tbody"
            and not first_row.previous_sibling
            and not table.find("thead")
        ):
            return True

    return False


def ensure_table_cell_count(table: TableBlock):
    """
    Ensures that the table has the same number of cells in each row.
    """
    # Get the maximum number of cells in all rows
    max_cells = max(len(row.table_row.cells) for row in table.children)
    for row in table.children:
        n_diff = max_cells - len(row.table_row.cells)
        # Append empty cells to the row
        for _ in range(n_diff):
            row.table_row.cells.append([])


def _final_block_transformation(obj: BlockBase | str | RichTextBase):
    if isinstance(obj, CaptionPlaceholderBlock):
        # Convert caption to a paragraph block

        ret = create_paragraph_block()
        ret.paragraph.rich_text = obj.rich_text
        return ret
    elif isinstance(obj, TableBlock):
        ensure_table_cell_count(obj)
    elif isinstance(obj, str):
        text_ = all_whitespace_re.sub(" ", obj)
        if not text_.strip():
            # Skip empty strings
            return None
        return create_paragraph_block(text=text_)
    elif isinstance(obj, RichTextBase):
        # if not obj.plain_text.strip():
        #     # Skip empty rich text objects
        #     return None
        new_obj_ = create_paragraph_block()
        new_obj_.paragraph.rich_text = [obj]
        return new_obj_
    elif isinstance(obj, PlaceholderBlockBase):
        # Make sure no placeholder blocks are left behind
        return None
    # elif isinstance(obj, tuple(BLOCKS_WITH_RICH_TEXT)):
    #     # Check for blocks that support rich text
    #     rich_text = get_rich_text_from_block(obj)
    #     if rich_text is not None:
    #         # If the block has no rich text or only empty rich text, skip it
    #         if not rich_text or all(not rt.plain_text.strip() for rt in rich_text):
    #             return None

    return obj


def run_final_block_transformations(blocks: List[BlockBase]):
    """
    Runs final checks on blocks after the main conversion is complete.

    E.g. Handles residual placeholder blocks after the main conversion is complete.
    This is needed because some placeholder blocks need to be handled in a special way.
    """
    ret = []
    for block in blocks:
        if isinstance(getattr(block, "children", None), list):
            block.children = run_final_block_transformations(block.children)

        handled_block = _final_block_transformation(block)
        if handled_block is not None:
            ret.append(handled_block)

    return ret
