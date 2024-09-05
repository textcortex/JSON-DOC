# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-05T14:27:19+00:00

from __future__ import annotations

from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.shared_definitions import Color
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class BulletedListItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    rich_text: List[RichTextBase]
    color: Optional[Color] = None


class BulletedListItemBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['bulleted_list_item'] = 'bulleted_list_item'
    bulleted_list_item: BulletedListItem
    children: Optional[List[BlockBase]] = None
