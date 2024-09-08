# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-09-08T11:45:26+00:00

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, RootModel


class Model(RootModel[Any]):
    root: Any


class Color(Enum):
    blue = 'blue'
    blue_background = 'blue_background'
    brown = 'brown'
    brown_background = 'brown_background'
    default = 'default'
    gray = 'gray'
    gray_background = 'gray_background'
    green = 'green'
    green_background = 'green_background'
    orange = 'orange'
    orange_background = 'orange_background'
    yellow = 'yellow'
    pink = 'pink'
    pink_background = 'pink_background'
    purple = 'purple'
    purple_background = 'purple_background'
    red = 'red'
    red_background = 'red_background'
    yellow_background = 'yellow_background'


class Annotations(BaseModel):
    bold: Optional[bool] = None
    italic: Optional[bool] = None
    strikethrough: Optional[bool] = None
    underline: Optional[bool] = None
    code: Optional[bool] = None
    color: Optional[str] = None
