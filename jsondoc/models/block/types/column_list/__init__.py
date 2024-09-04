# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-04T22:43:27+00:00

from __future__ import annotations

from typing import Any, Dict, List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.column import ColumnBlock
from pydantic import ConfigDict
from typing_extensions import Literal


class ColumnListBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['column_list']
    column_list: Dict[str, Any]
    children: Optional[List[ColumnBlock]] = None
