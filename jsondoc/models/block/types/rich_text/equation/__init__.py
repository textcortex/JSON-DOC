# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-21T17:19:54+00:00

from __future__ import annotations

from typing import Optional

from jsondoc.models.block.types.rich_text.base import RichTextBase
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Equation(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    expression: str


class Annotations(BaseModel):
    bold: bool
    italic: bool
    strikethrough: bool
    underline: bool
    code: bool
    color: str


class RichTextEquation(RichTextBase):
    type: Literal['equation']
    equation: Equation
    annotations: Annotations
    plain_text: str
    href: Optional[str] = None
