# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-15T07:58:13+00:00

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import AwareDatetime, BaseModel, ConfigDict
from typing_extensions import Literal


class Parent(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    type: str
    block_id: Optional[str] = None
    page_id: Optional[str] = None


class CreatedBy(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    object: Literal['user']
    id: str


class LastEditedBy(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    object: Literal['user']
    id: str


class Type(Enum):
    text = 'text'
    equation = 'equation'


class RichTextItem(BaseModel):
    type: Type


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


class Type1(Enum):
    paragraph = 'paragraph'
    to_do = 'to_do'
    bulleted_list_item = 'bulleted_list_item'
    numbered_list_item = 'numbered_list_item'
    code = 'code'
    column = 'column'
    column_list = 'column_list'
    divider = 'divider'
    equation = 'equation'
    heading_1 = 'heading_1'
    heading_2 = 'heading_2'
    heading_3 = 'heading_3'
    image = 'image'
    quote = 'quote'
    equation_1 = 'equation'
    table = 'table'
    table_row = 'table_row'
    toggle = 'toggle'


class Child(BaseModel):
    type: Type1


class NumberedListItem(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
    )
    rich_text: List[RichTextItem]
    color: Optional[Color] = None
    children: Optional[List[Child]] = None


class NumberedListItemBlock(BaseModel):
    object: Literal['block']
    id: str
    parent: Optional[Parent] = None
    type: str
    created_time: AwareDatetime
    created_by: Optional[CreatedBy] = None
    last_edited_time: Optional[AwareDatetime] = None
    last_edited_by: Optional[LastEditedBy] = None
    archived: bool
    in_trash: Optional[bool] = None
    has_children: bool
    metadata: Optional[Dict[str, Any]] = None
    numbered_list_item: NumberedListItem
