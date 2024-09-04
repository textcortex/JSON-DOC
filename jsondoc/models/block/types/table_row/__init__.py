# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-04T22:43:27+00:00

from __future__ import annotations

from typing import List

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class TableRow(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    cells: List[List[RichTextBase]]


class TableRowBlock(BlockBase):
    type: Literal['table_row']
    table_row: TableRow
