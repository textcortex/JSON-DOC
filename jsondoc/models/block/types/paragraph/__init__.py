# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-08T10:03:42+00:00

from __future__ import annotations

from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.shared_definitions import Color
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Paragraph(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    rich_text: List[RichTextBase]
    color: Optional[Color] = None


class ParagraphBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['paragraph'] = 'paragraph'
    paragraph: Paragraph
    children: Optional[List[BlockBase]] = None
