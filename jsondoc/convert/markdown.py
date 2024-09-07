import re
from typing import List, Union
from pydantic import validate_call
from jsondoc.convert.utils import get_rich_text_from_block
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.code import CodeBlock
from jsondoc.models.block.types.divider import DividerBlock
from jsondoc.models.block.types.heading_1 import Heading1Block
from jsondoc.models.block.types.heading_2 import Heading2Block
from jsondoc.models.block.types.heading_3 import Heading3Block
from jsondoc.models.block.types.paragraph import ParagraphBlock
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import RichTextText
from jsondoc.models.page import Page
from jsondoc.models.shared_definitions import Annotations
from jsondoc.serialize import load_jsondoc, load_page


convert_heading_re = re.compile(r"convert_heading_(\d+)")
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


def chomp(text):
    """
    If the text in an inline tag like b, a, or em contains a leading or trailing
    space, strip the string and return a space as suffix of prefix, if needed.
    This function is used to prevent conversions like
        <b> foo</b> => ** foo**
    """
    prefix = " " if text and text[0] == " " else ""
    suffix = " " if text and text[-1] == " " else ""
    text = text.strip()
    return (prefix, suffix, text)


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

    def __getattr__(self, attr):
        # Handle headings
        m = convert_heading_re.match(attr)
        if m:
            n = int(m.group(1))

            def convert_tag(block, convert_as_inline):
                return self.convert_heading_n_block(n, block, convert_as_inline)

            convert_tag.__name__ = "convert_heading_%s_block" % n
            setattr(self, convert_tag.__name__, convert_tag)
            return convert_tag

        raise AttributeError(attr)

    @validate_call
    def convert(self, obj: str | dict | BlockBase | Page) -> str:

        if isinstance(obj, (str, dict)):
            jsondoc = load_jsondoc(obj)
        else:
            jsondoc = obj

        if isinstance(jsondoc, Page):
            return self.convert_page(jsondoc)
        elif isinstance(jsondoc, BlockBase):
            return self.convert_block(jsondoc, False)
        else:
            raise ValueError(f"Invalid object type: {type(jsondoc)}")

    @validate_call
    def convert_page(self, page: Page) -> str:
        ret = ""
        for block in page.children:
            block_str = self.convert_block(block, False)
            ret += block_str

        return ret

    @validate_call
    def convert_block(self, block: BlockBase, convert_as_inline: bool) -> str:

        type_ = block.type
        convert_fn = getattr(self, f"convert_{type_}_block", None)

        if convert_fn is None:
            convert_fn = self.convert_paragraph_block
            # TODO: Change this back
            # raise ValueError(f"Unsupported block type: {type_}")

        block_content = convert_fn(block, convert_as_inline)

        if hasattr(block, "children") and block.children:
            for child in block.children:
                block_content += self.convert_block(child, convert_as_inline)

        # rich_text = get_rich_text_from_block(block)
        # if rich_text is None:
        #     return ""

        # # Code blocks are kept verbatim
        # escape = isinstance(block, CodeBlock)

        # block_content = self.convert_rich_text_list_to_markdown(
        #     rich_text, escape=escape
        # )

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
        self,
        rich_text_list: List[Union[RichTextText, RichTextEquation]],
        escape: bool = True,
    ) -> str:
        ret = ""
        for rich_text in rich_text_list:
            if isinstance(rich_text, RichTextText):
                text_ = rich_text.text.content
                if escape:
                    text_ = self.escape(text_)

                prefix_, suffix_, text_ = chomp(text_)

                url = rich_text.text.link.url if rich_text.text.link else None
                if url:
                    text_ = f"[{text_}]({url})"

                prefix, suffix = self._get_prefix_and_suffix_from_annotations(
                    rich_text.annotations
                )
                ret += prefix_ + prefix + text_ + suffix + suffix_
            elif isinstance(rich_text, RichTextEquation):
                text_ = rich_text.equation.expression
                if escape:
                    text_ = self.escape(text_)
                prefix, suffix = ["$$", "$$"]
                ret += prefix + text_ + suffix
            else:
                raise ValueError(f"Unsupported rich text type: {type(rich_text)}")

        return ret

    def convert_paragraph_block(
        self, block: ParagraphBlock, convert_as_inline: bool
    ) -> str:
        rich_text = get_rich_text_from_block(block)
        if rich_text is None:
            return ""

        # Code blocks are kept verbatim
        # escape = isinstance(block, CodeBlock)

        text = self.convert_rich_text_list_to_markdown(rich_text, escape=True)

        if convert_as_inline:
            return text

        # return "\n\n" + block_content
        return "%s\n\n" % text if text else ""

    def convert_divider_block(
        self, block: DividerBlock, convert_as_inline: bool
    ) -> str:
        if convert_as_inline:
            return ""

        return "\n\n---\n\n"

    def convert_code_block(self, block: CodeBlock, convert_as_inline: bool) -> str:
        rich_text = get_rich_text_from_block(block)
        if rich_text is None:
            return ""

        language = block.code.language.value

        # if self.options["code_language_callback"]:
        #     language = self.options["code_language_callback"](language)

        # if language:
        #     language = f" {language}"

        code = self.convert_rich_text_list_to_markdown(rich_text, escape=True)

        if convert_as_inline:
            return f"{code}"

        return f"```{language}\n{code}\n```\n\n"

    def convert_heading_n_block(
        self,
        n: int,
        block: Heading1Block | Heading2Block | Heading3Block,
        convert_as_inline: bool,
    ):

        rich_text = get_rich_text_from_block(block)
        if rich_text is None:
            return ""

        text = self.convert_rich_text_list_to_markdown(rich_text, escape=True)
        if convert_as_inline:
            return text

        style = self.options["heading_style"].lower()

        if style == UNDERLINED and n <= 2:
            line = "=" if n == 1 else "-"
            return self.underline(text, line)

        hashes = "#" * n
        if style == ATX_CLOSED:
            return "%s %s %s\n\n" % (hashes, text, hashes)

        return "%s %s\n\n" % (hashes, text)


def jsondoc_to_markdown(jsondoc, **options):
    return JsonDocToMarkdownConverter(**options).convert(jsondoc)
