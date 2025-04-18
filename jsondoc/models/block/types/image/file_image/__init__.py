# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-10T15:45:21+00:00

from __future__ import annotations

from typing import List, Optional

from pydantic import ConfigDict

from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.file.file import FileFile


class FileImage(FileFile):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )
    caption: Optional[List[RichTextBase]] = None
