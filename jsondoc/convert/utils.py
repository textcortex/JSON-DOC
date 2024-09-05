import logging
from datetime import datetime, timezone

from jsondoc.models.block.types.bulleted_list_item import BulletedListItemBlock
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
from jsondoc.models.block.types.numbered_list_item import NumberedListItemBlock
from jsondoc.models.block.types.paragraph import Paragraph, ParagraphBlock
from jsondoc.models.block.types.quote import Quote, QuoteBlock
from jsondoc.models.block.types.rich_text.equation import Equation as EquationObj
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import Link, RichTextText, Text
from jsondoc.models.block.types.table import TableBlock
from jsondoc.models.block.types.table_row import TableRowBlock
from jsondoc.models.block.types.to_do import ToDoBlock
from jsondoc.models.block.types.toggle import ToggleBlock
from jsondoc.models.file.external import External
from jsondoc.models.shared_definitions import Annotations
from jsondoc.utils import generate_id


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
    if text is None and equation is None:
        raise ValueError("Either text or equation must be provided")

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
        )
    elif text is not None:
        ret = RichTextText(
            text=Text(
                content=text,
                link=Link(url=url) if url else None,
            ),
            annotations=annotations,
            plain_text=text,
        )

    return ret


def create_paragraph_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    **kwargs,
) -> ParagraphBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return ParagraphBlock(
        id=id,
        created_time=created_time,
        paragraph=Paragraph(rich_text=rich_text),
        has_children=False,
    )


def create_code_block(
    code: str | None = None,
    language: str | None = None,
    id: str | None = None,
    created_time=None,
    **kwargs,
) -> CodeBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

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
) -> DividerBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

    return DividerBlock(
        id=id,
        created_time=created_time,
        has_children=False,
    )


def create_h1_block(
    text: str | None = None,
    id: str | None = None,
    created_time=None,
    **kwargs,
) -> Heading1Block:
    if id is None:
        id = generate_id()

    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

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
    **kwargs,
) -> Heading2Block:
    if id is None:
        id = generate_id()

    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

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
    **kwargs,
) -> Heading3Block:
    if id is None:
        id = generate_id()

    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

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
) -> ImageBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

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
    **kwargs,
) -> QuoteBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

    rich_text = []
    if text is not None:
        rich_text.append(create_rich_text(text, **kwargs))

    return QuoteBlock(
        id=id,
        created_time=created_time,
        quote=Quote(rich_text=rich_text),
        has_children=False,
    )


# print(create_paragraph_block(text="Hello, world!"))
