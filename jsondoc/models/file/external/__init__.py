# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-04T22:43:27+00:00

from __future__ import annotations

from jsondoc.models.file.base import FileBase
from pydantic import BaseModel
from typing_extensions import Literal


class External(BaseModel):
    url: str


class FileExternal(FileBase):
    type: Literal['external'] = 'external'
    external: External
