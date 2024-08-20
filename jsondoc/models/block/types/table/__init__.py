# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-20T15:49:35+00:00

from __future__ import annotations

from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.table_row import TableRowBlock
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Table(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    table_width: Optional[float] = None
    has_column_header: bool
    has_row_header: bool


class TableBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    dummy: Optional[str] = None
    type: Literal['table']
    table: Table
    children: List[TableRowBlock]
