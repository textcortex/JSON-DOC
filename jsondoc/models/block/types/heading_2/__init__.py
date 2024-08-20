# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-20T15:49:35+00:00

from __future__ import annotations

from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.shared_definitions import Color
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Heading2(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    rich_text: List[RichTextBase]
    color: Optional[Color] = None
    is_toggleable: Optional[bool] = None
    children: Optional[List[BlockBase]] = None


class Heading2Block(BlockBase):
    dummy: Optional[str] = None
    type: Literal['heading_2']
    heading_2: Heading2
