from datetime import datetime, timezone
import logging
from jsondoc.models.block.types.paragraph import Paragraph, ParagraphBlock
from jsondoc.models.block.types.rich_text.equation import (
    RichTextEquation,
    Equation as EquationObj,
)
from jsondoc.models.block.types.rich_text.text import Link, RichTextText, Text
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
) -> RichTextText:
    if text is None and equation is None:
        raise ValueError("Either text or equation must be provided")

    if text is not None and equation is not None:
        raise ValueError("Only one of text or equation must be provided")

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
        created_time=created_time,
        paragraph=Paragraph(
            rich_text=[
                create_rich_text(text, **kwargs),
            ]
        ),
        has_children=False,
    )


print(create_paragraph_block(text="Hello, world!"))
