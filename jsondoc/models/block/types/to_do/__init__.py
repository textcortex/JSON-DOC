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


class ToDo(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    rich_text: List[RichTextBase]
    checked: bool
    color: Optional[Color] = None


class ToDoBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['to_do'] = 'to_do'
    to_do: ToDo
    children: Optional[List[BlockBase]] = None
