# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-21T17:19:54+00:00

from __future__ import annotations

from typing import Optional

from jsondoc.models.block.types.rich_text.base import RichTextBase
from pydantic import BaseModel
from typing_extensions import Literal


class Link(BaseModel):
    url: str


class Text(BaseModel):
    content: str
    link: Optional[Link] = None


class Annotations(BaseModel):
    bold: bool
    italic: bool
    strikethrough: bool
    underline: bool
    code: bool
    color: str


class RichTextText(RichTextBase):
    type: Literal['text']
    text: Text
    annotations: Annotations
    plain_text: str
    href: Optional[str] = None
