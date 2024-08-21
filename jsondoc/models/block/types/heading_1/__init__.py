# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-21T08:03:24+00:00

from __future__ import annotations

from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.shared_definitions import Color
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Heading1(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    rich_text: List[RichTextBase]
    color: Optional[Color] = None
    is_toggleable: Optional[bool] = None


class Heading1Block(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['heading_1']
    heading_1: Heading1
    children: Optional[List[BlockBase]] = None
