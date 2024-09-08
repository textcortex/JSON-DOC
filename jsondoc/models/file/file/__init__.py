# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-08T11:45:26+00:00

from __future__ import annotations

from typing import Optional

from jsondoc.models.file.base import FileBase
from pydantic import AwareDatetime, BaseModel
from typing_extensions import Literal


class File(BaseModel):
    url: str
    expiry_time: Optional[AwareDatetime] = None


class FileFile(FileBase):
    type: Literal['file'] = 'file'
    file: File
