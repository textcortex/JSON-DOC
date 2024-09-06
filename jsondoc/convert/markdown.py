import re
from typing import List, Union
from pydantic import validate_call
from jsondoc.convert.utils import get_rich_text_from_block
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.code import CodeBlock
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import RichTextText
from jsondoc.models.page import Page
from jsondoc.models.shared_definitions import Annotations
from jsondoc.serialize import load_jsondoc, load_page


convert_heading_re = re.compile(r"convert_h(\d+)")
line_beginning_re = re.compile(r"^", re.MULTILINE)
whitespace_re = re.compile(r"[\t ]+")
all_whitespace_re = re.compile(r"[\s]+")
html_heading_re = re.compile(r"h[1-6]")


# Heading styles
ATX = "atx"
ATX_CLOSED = "atx_closed"
UNDERLINED = "underlined"
SETEXT = UNDERLINED

# Newline style
SPACES = "spaces"
BACKSLASH = "backslash"

# Strong and emphasis style
ASTERISK = "*"
UNDERSCORE = "_"


def _todict(obj):
    return dict((k, getattr(obj, k)) for k in dir(obj) if not k.startswith("_"))


class JsonDocToMarkdownConverter(object):

    class DefaultOptions:
        autolinks = True
        bullets = "*+-"  # An iterable of bullet types.
        code_language = ""
        code_language_callback = None
        convert = None
        default_title = False
        escape_asterisks = True
        escape_underscores = True
        escape_misc = True
        heading_style = UNDERLINED
        keep_inline_images_in = []
        newline_style = SPACES
        strip = None
        strong_em_symbol = ASTERISK
        wrap = False
        wrap_width = 80

    class Options(DefaultOptions):
        pass

    def __init__(self, **options):
        # Create an options dictionary. Use DefaultOptions as a base so that
        # it doesn't have to be extended.
        self.options = _todict(self.DefaultOptions)
        self.options.update(_todict(self.Options))
        self.options.update(options)
        if self.options["strip"] is not None and self.options["convert"] is not None:
            raise ValueError(
                "You may specify either tags to strip or tags to"
                " convert, but not both."
            )

    @validate_call
    def convert(self, obj: str | dict | BlockBase | Page) -> str:

        if isinstance(obj, (str, dict)):
            jsondoc = load_jsondoc(obj)
        else:
            jsondoc = obj

        if isinstance(jsondoc, Page):
            return self.convert_page(jsondoc)
        elif isinstance(jsondoc, BlockBase):
            return self.convert_block(jsondoc)
        else:
            raise ValueError(f"Invalid object type: {type(jsondoc)}")

    @validate_call
    def convert_page(self, page: Page) -> str:
        ret = ""
        for block in page.children:
            block_str = self.convert_block(block)
            ret += block_str

        return ret

    @validate_call
    def convert_block(self, block: BlockBase) -> str:
        rich_text = get_rich_text_from_block(block)
        if rich_text is None:
            return ""

        block_content = self.convert_rich_text_list_to_markdown(rich_text)

        # Code blocks are kept verbatim
        if not isinstance(block, CodeBlock):
            block_content = self.escape(block_content)

        return block_content

    def _get_prefix_and_suffix_from_annotations(
        self, annotations: Annotations
    ) -> tuple[str, str]:
        prefix = ""
        suffix = ""
        if annotations is not None:
            if annotations.bold:
                prefix += "**"
                suffix = "**" + suffix
            if annotations.italic:
                prefix += "*"
                suffix = "*" + suffix
            if annotations.strikethrough:
                prefix += "~~"
                suffix = "~~" + suffix
            if annotations.code:
                prefix += "`"
                suffix = "`" + suffix
            if annotations.underline:
                prefix += "<u>"
                suffix = "</u>" + suffix

        return prefix, suffix

    def escape(self, text):
        if not text:
            return ""
        if self.options["escape_misc"]:
            text = re.sub(r"([\\&<`[>~#=+|-])", r"\\\1", text)
            text = re.sub(r"([0-9])([.)])", r"\1\\\2", text)
        if self.options["escape_asterisks"]:
            text = text.replace("*", r"\*")
        if self.options["escape_underscores"]:
            text = text.replace("_", r"\_")
        return text

    def indent(self, text, level):
        return line_beginning_re.sub("\t" * level, text) if text else ""

    def underline(self, text, pad_char):
        text = (text or "").rstrip()
        return "%s\n%s\n\n" % (text, pad_char * len(text)) if text else ""

    def convert_rich_text_list_to_markdown(
        self, rich_text_list: List[Union[RichTextText, RichTextEquation]]
    ) -> str:
        ret = ""
        for rich_text in rich_text_list:
            if isinstance(rich_text, RichTextText):
                text_ = rich_text.text.content
                prefix, suffix = self._get_prefix_and_suffix_from_annotations(
                    rich_text.annotations
                )
                ret += prefix + text_ + suffix
            elif isinstance(rich_text, RichTextEquation):
                text_ = rich_text.equation.expression
                prefix, suffix = ["$$", "$$"]
                ret += prefix + text_ + suffix
            else:
                raise ValueError(f"Unsupported rich text type: {type(rich_text)}")

        return ret


def jsondoc_to_markdown(jsondoc, **options):
    return JsonDocToMarkdownConverter(**options).convert(jsondoc)
