# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-06T15:48:03+00:00

from __future__ import annotations

from typing import Any, Dict, List, Optional

from jsondoc.models.block.base import BlockBase
from pydantic import ConfigDict
from typing_extensions import Literal


class ColumnBlock(BlockBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Literal['column'] = 'column'
    column: Dict[str, Any]
    children: Optional[List[BlockBase]] = None
