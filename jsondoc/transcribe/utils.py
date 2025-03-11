from decimal import Decimal
from typing import Tuple

from pydantic import BaseModel


class ImageInfo(BaseModel):
    width: int
    height: int
    mode: str
    format: str


class Usage(BaseModel):
    input_tokens: int
    output_tokens: int


class TokenPrice(BaseModel):
    input_token_price: Decimal
    output_token_price: Decimal


class Transcriber(BaseModel):
    price: TokenPrice

    def transcribe(self, path: str) -> Tuple[str, Usage]:
        raise NotImplementedError

    def get_slug(self):
        raise NotImplementedError


def per_mil_tok(price: str):
    return Decimal(price) / Decimal("1_000_000")


def get_alphanumeric(text: str):
    text = " ".join(text.split())
    return "".join([c for c in text if c.isalnum() or c.isspace()])
