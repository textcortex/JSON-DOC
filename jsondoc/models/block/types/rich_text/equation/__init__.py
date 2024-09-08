# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-08T10:03:42+00:00

from __future__ import annotations

from typing import Optional

from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.shared_definitions import Annotations
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Equation(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    expression: str


class RichTextEquation(RichTextBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['equation'] = 'equation'
    equation: Equation
    annotations: Annotations
    plain_text: str
    href: Optional[str] = None
