# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-15T07:20:03+00:00

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class Type(Enum):
    external = 'external'
    file = 'file'


class FileObject(BaseModel):
    type: Type
