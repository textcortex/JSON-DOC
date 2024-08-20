# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-20T16:21:13+00:00

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.file.base import FileBase
from pydantic import ConfigDict
from typing_extensions import Literal


class Type(Enum):
    external = 'external'
    file = 'file'


class Image(FileBase):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    type: Type
    caption: Optional[List[RichTextBase]] = None


class ImageBlock(BlockBase):
    type: Literal['image']
    image: Image
