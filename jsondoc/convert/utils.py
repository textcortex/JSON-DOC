from datetime import datetime, timezone
from jsondoc.models.block.types.paragraph import Paragraph, ParagraphBlock
from jsondoc.models.block.types.rich_text.text import Link, RichTextText, Text
from jsondoc.models.shared_definitions import Annotations
from jsondoc.utils import generate_id


def create_rich_text(
    text: str,
    url: str = None,
    bold: bool = False,
    italic: bool = False,
    strikethrough: bool = False,
    underline: bool = False,
    code: bool = False,
    color: str = "default",
) -> RichTextText:
    return RichTextText(
        type="text",
        text=Text(
            content=text,
            link=Link(url=url) if url else None,
        ),
        annotations=Annotations(
            bold=bold,
            italic=italic,
            strikethrough=strikethrough,
            underline=underline,
            code=code,
            color=color,
        ),
        plain_text=text,
    )


def create_paragraph_block(
    text: str,
    id=None,
    created_time=None,
    **kwargs,
) -> ParagraphBlock:
    if id is None:
        id = generate_id()
    if created_time is None:
        created_time = datetime.now(tz=timezone.utc)

    return ParagraphBlock(
        id=id,
        object="block",
        created_time=created_time,
        type="paragraph",
        paragraph=Paragraph(
            rich_text=[
                create_rich_text(text, **kwargs),
            ]
        ),
        has_children=False,
    )


# print(create_paragraph_block("Hello, world!"))
