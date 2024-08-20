# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-20T16:30:59+00:00

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class Type(Enum):
    text = 'text'
    equation = 'equation'


class Model(BaseModel):
    type: Type
