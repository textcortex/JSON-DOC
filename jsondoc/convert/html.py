from typing import List, Union
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype
from textwrap import fill
import re

from jsondoc.convert.utils import (
    BreakElementPlaceholderBlock,
    append_to_parent_block,
    append_to_rich_text,
    create_bullet_list_item_block,
    create_code_block,
    create_divider_block,
    create_h1_block,
    create_h2_block,
    create_h3_block,
    create_image_block,
    create_numbered_list_item_block,
    create_page,
    create_paragraph_block,
    create_quote_block,
    create_rich_text,
    create_table_block,
    create_table_row_block,
    get_rich_text_from_block,
    html_table_has_header_row,
    try_append_rich_text_to_block,
)
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.bulleted_list_item import BulletedListItemBlock
from jsondoc.models.block.types.code import CodeBlock
from jsondoc.models.block.types.column import ColumnBlock
from jsondoc.models.block.types.column_list import ColumnListBlock
from jsondoc.models.block.types.divider import DividerBlock
from jsondoc.models.block.types.equation import EquationBlock
from jsondoc.models.block.types.heading_1 import Heading1Block
from jsondoc.models.block.types.heading_2 import Heading2Block
from jsondoc.models.block.types.heading_3 import Heading3Block
from jsondoc.models.block.types.image import ImageBlock
from jsondoc.models.block.types.numbered_list_item import NumberedListItemBlock
from jsondoc.models.block.types.paragraph import Paragraph, ParagraphBlock
from jsondoc.models.block.types.quote import QuoteBlock
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import RichTextText
from jsondoc.models.block.types.table import TableBlock
from jsondoc.models.block.types.table_row import TableRowBlock
from jsondoc.models.block.types.to_do import ToDoBlock
from jsondoc.models.block.types.toggle import ToggleBlock
from jsondoc.models.page import Page
from jsondoc.models.shared_definitions import Annotations
from jsondoc.rules import is_block_child_allowed
from jsondoc.utils import generate_id, get_current_time


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

CHILDREN_TYPE = Union[BlockBase, RichTextBase, str]
RICH_TEXT_TYPE = Union[RichTextBase, RichTextEquation]


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


def abstract_inline_conversion(markup_fn):
    """
    This abstracts all simple inline tags like b, em, del, ...
    Returns a function that wraps the chomped text in a pair of the string
    that is returned by markup_fn, with '/' inserted in the string used after
    the text if it looks like an HTML tag. markup_fn is necessary to allow for
    references to self.strong_em_symbol etc.
    """

    def implementation(self, el, convert_as_inline):
        # text = el.get_text()
        # markup_prefix = markup_fn(self)
        # if markup_prefix.startswith("<") and markup_prefix.endswith(">"):
        #     markup_suffix = "</" + markup_prefix[1:]
        # else:
        #     markup_suffix = markup_prefix
        # if el.find_parent(["pre", "code", "kbd", "samp"]):
        #     return text
        # prefix, suffix, text = chomp(text)
        # if not text:
        #     return ""
        # return "%s%s%s%s%s" % (prefix, markup_prefix, text, markup_suffix, suffix)
        annotations = markup_fn(self)

        if el.find_parent(["pre", "code", "kbd", "samp"]):
            return create_rich_text()

        # prefix, suffix, text = chomp(text)
        # if not text:
        #     return None

        return create_rich_text(annotations=annotations)

        # return [
        #     # create_rich_text(text=prefix),
        #     create_rich_text(text, annotations=annotations),
        #     # create_rich_text(text=suffix),
        # ]

    return implementation


def _todict(obj):
    return dict((k, getattr(obj, k)) for k in dir(obj) if not k.startswith("_"))


def has_direct_text(node):
    """
    Checks if the given BeautifulSoup node has direct text content
    (text that is not part of any child nodes).

    Args:
        node (BeautifulSoup element): The HTML node to check.

    Returns:
        bool: True if the node has direct text content, False otherwise.
    """
    # Check if there is any direct text in the node
    direct_text = node.find_all(text=True, recursive=False)

    # Return True if there is any non-empty direct text, False otherwise
    return any(text.strip() for text in direct_text)


def apply_parent_annotations(
    parent_annotations: Annotations,
    child_annotations: Annotations,
):
    if parent_annotations.bold is True:
        child_annotations.bold = True

    if parent_annotations.italic is True:
        child_annotations.italic = True

    if parent_annotations.strikethrough is True:
        child_annotations.strikethrough = True

    if parent_annotations.underline is True:
        child_annotations.underline = True

    if parent_annotations.code is True:
        child_annotations.code = True

    # TBD: Decide how to handle color


def apply_annotations_to_block(annotations_to_apply: Annotations, block: BlockBase):
    if hasattr(block, "children") and isinstance(block.children, list):
        for child in block.children:
            apply_annotations_to_block(annotations_to_apply, child)

    # Get rich text
    rich_text_list = get_rich_text_from_block(block)
    if isinstance(rich_text_list, list):
        for rich_text in rich_text_list:
            apply_parent_annotations(annotations_to_apply, rich_text.annotations)


def append_paragraph_block_to_table_row_block(
    parent_table_row_block: TableRowBlock, child_paragraph_block: ParagraphBlock
):
    """
    Appends a paragraph block to a table row block
    """
    if parent_table_row_block.table_row.cells is None:
        parent_table_row_block.table_row.cells = []

    child_rich_text = get_rich_text_from_block(child_paragraph_block)
    if child_rich_text is None:
        child_rich_text = []

    parent_table_row_block.table_row.cells.append(child_rich_text)


# Override append functions
# Maps pairs of (parent_block_type, child_block_type) to a function
# that appends the child block to the parent block
OVERRIDE_APPEND_FUNCTIONS = {
    (TableRowBlock, ParagraphBlock): append_paragraph_block_to_table_row_block,
}


def reconcile_to_rich_text(
    parent_rich_text: RICH_TEXT_TYPE, children: List[CHILDREN_TYPE]
) -> List[CHILDREN_TYPE]:
    """
    Given a parent rich text and a list of children,
    this function will apply the parent annotations
    to the children and return a list of objects
    """
    annotations = parent_rich_text.annotations

    # Get non-null/false values from annotations
    final_objects = []

    for child in children:
        if isinstance(child, RichTextBase):
            apply_parent_annotations(annotations, child.annotations)
            final_objects.append(child)
        elif isinstance(child, BlockBase):
            apply_annotations_to_block(annotations, child)
            final_objects.append(child)
        elif isinstance(child, str):
            append_to_rich_text(parent_rich_text, child)
        else:
            raise ValueError(f"Unsupported type: {type(child)}")

    # Append the parent rich text to the final objects ONLY if it has text
    if len(parent_rich_text.plain_text) > 0:
        final_objects.insert(0, parent_rich_text)

    return final_objects


def reconcile_to_block(
    block: BlockBase, children: List[CHILDREN_TYPE]
) -> List[CHILDREN_TYPE]:
    """
    Given a block and a list of children,
    this function will reconcile the children to the block
    and return a list of objects
    """
    remaining_children = []
    objects = [block]

    # Any string will be added to the current rich text
    current_rich_text = None
    for child in children:
        if isinstance(child, str):
            if current_rich_text is None:
                current_rich_text = create_rich_text()
            append_to_rich_text(current_rich_text, child)
            success_ = try_append_rich_text_to_block(block, current_rich_text)
            if not success_:
                remaining_children.append(current_rich_text)

        elif isinstance(child, RichTextBase):
            success_ = try_append_rich_text_to_block(block, child)
            current_rich_text = None
            if not success_:
                remaining_children.append(child)

        elif isinstance(child, BreakElementPlaceholderBlock):
            # TBD: Should probably abstract away all placeholder blocks
            # Create an empty version of the current block, and set it as the current parent
            # A <br> element basically creates an empty block of the same type as the parent
            block_type = block.type
            # Get corresponding field from the block
            block_field = getattr(block, block_type)
            init_kwargs = {
                "id": generate_id(),
                "created_time": child.created_time,
                block_type: type(block_field)(),
            }

            empty_block = type(block)(**init_kwargs)
            # If we don't set current_rich_text to None, then the rich_text object will be
            # shared across different blocks and cause duplicate text issues
            current_rich_text = None
            objects.append(empty_block)
            block = empty_block
        elif isinstance(child, BlockBase):
            child_allowed = is_block_child_allowed(block, child)
            append_function = OVERRIDE_APPEND_FUNCTIONS.get((type(block), type(child)))

            # We introduce the following condition instead of only
            # if child_allowed:
            # because we need to do a hack with some block types, such as
            # convert td/th elements to paragraph blocks
            if child_allowed or append_function is not None:
                if append_function:
                    append_function(block, child)
                else:
                    append_to_parent_block(block, child)
            else:
                remaining_children.append(child)

    objects = objects + remaining_children

    return objects


class HtmlToJsonDocConverter(object):
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
        sub_symbol = ""
        sup_symbol = ""
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

    def convert(self, html: str | bytes) -> Page | BlockBase | List[BlockBase]:
        soup = BeautifulSoup(html, "html.parser")
        return self.convert_soup(soup)

    def convert_soup(
        self, soup: BeautifulSoup, force_page=False
    ) -> Page | BlockBase | List[BlockBase]:

        children = self.process_tag(soup, convert_as_inline=False, children_only=True)

        is_page = self._is_soup_page(soup)

        ret = None
        if is_page or force_page:
            title = self._get_html_title(soup)
            # Ensure that children is a list
            if not isinstance(children, list):
                children = [children]

            # Create a page and add all the blocks to it
            ret = create_page(
                title=title,
                children=children,
            )
        else:
            ret = children
            if isinstance(ret, list):
                if len(ret) == 1:
                    ret = ret[0]

        return ret

    def process_tag(
        self, node, convert_as_inline, children_only=False
    ) -> List[CHILDREN_TYPE]:
        """
        Convert a BeautifulSoup node to JSON-DOC. Recurses through the children
        nodes and converts them to JSON-DOC corresponding current block type
        can have children or not.
        """
        # text = ""
        objects = []

        # markdown headings or cells can't include
        # block elements (elements w/newlines)
        is_heading = html_heading_re.match(node.name) is not None
        is_cell = node.name in ["td", "th"]
        convert_children_as_inline = convert_as_inline

        if not children_only and (is_heading or is_cell):
            convert_children_as_inline = True

        # Remove whitespace-only textnodes in purely nested nodes
        def is_nested_node(el):
            return el and el.name in [
                "ol",
                "ul",
                "li",
                "table",
                "thead",
                "tbody",
                "tfoot",
                "tr",
                "td",
                "th",
            ]

        if is_nested_node(node):
            for el in node.children:
                # Only extract (remove) whitespace-only text node if any of the
                # conditions is true:
                # - el is the first element in its parent
                # - el is the last element in its parent
                # - el is adjacent to an nested node
                can_extract = (
                    not el.previous_sibling
                    or not el.next_sibling
                    or is_nested_node(el.previous_sibling)
                    or is_nested_node(el.next_sibling)
                )
                if (
                    isinstance(el, NavigableString)
                    and str(el).strip() == ""
                    and can_extract
                ):
                    el.extract()

        children_objects = []
        # Convert the children first
        for el in node.children:
            if isinstance(el, Comment) or isinstance(el, Doctype):
                continue
            elif isinstance(el, NavigableString):
                # text += self.process_text(el)
                processed_text = self.process_text(el)
                if processed_text:
                    children_objects.append(processed_text)
            else:
                # text += self.process_tag(el, convert_children_as_inline)
                new_objects = self.process_tag(el, convert_children_as_inline)
                children_objects += new_objects

        current_level_object = None
        if not children_only:
            convert_fn = getattr(self, "convert_%s" % node.name, None)
            if convert_fn and self.should_convert_tag(node.name):
                # text = convert_fn(node, text, convert_as_inline)
                current_level_object = convert_fn(node, convert_as_inline)

        # print(node, repr(current_level_object))
        # import ipdb; ipdb.set_trace()

        if current_level_object is None:
            objects = children_objects
        elif isinstance(current_level_object, BlockBase):
            objects = reconcile_to_block(current_level_object, children_objects)
        elif isinstance(current_level_object, RichTextBase):
            objects = reconcile_to_rich_text(current_level_object, children_objects)
        else:
            raise Exception(
                f"Current node has yielded an unexpected type {type(current_level_object)}"
            )

        return objects

    @staticmethod
    def _get_html_title(soup: BeautifulSoup) -> str | None:
        """
        Extracts the title from the HTML document.

        :param soup: BeautifulSoup object of the HTML document
        :return: The title string or None if not found
        """
        title_tag = soup.find("title")
        if title_tag and title_tag.string:
            return title_tag.string.strip()

        # If no title tag, check for the first h1
        h1_tag = soup.find("h1")
        if h1_tag:
            return h1_tag.get_text(strip=True)

        return None

    @staticmethod
    def _is_soup_page(soup: BeautifulSoup) -> bool:
        """
        Determines if the BeautifulSoup object represents a JSON-DOC page.

        :param soup: BeautifulSoup object
        :return: Boolean indicating if it's a JSON-DOC page
        """
        # Check for DOCTYPE
        if not soup.contents or not isinstance(soup.contents[0], Doctype):
            return False

        # Check for <html> tag
        html_tag = soup.find("html")
        if not html_tag:
            return False

        # # Check for <head> and <body> tags
        # head_tag = soup.find('head')
        # body_tag = soup.find('body')
        # if not (head_tag and body_tag):
        #     return False

        # # Check for essential head elements
        # if not (head_tag.find('title') or head_tag.find('meta')):
        #     return False

        # # Check if body has some content
        # if not body_tag.contents:
        #     return False

        return True

    def process_text(self, el):
        text = str(el) or ""

        # normalize whitespace if we're not inside a preformatted element
        if not el.find_parent("pre"):
            text = whitespace_re.sub(" ", text)

        # escape special characters if we're not inside a preformatted or code element
        # if not el.find_parent(["pre", "code", "kbd", "samp"]):
        #     text = self.escape(text)

        # remove trailing whitespaces if any of the following condition is true:
        # - current text node is the last node in li
        # - current text node is followed by an embedded list
        if el.parent.name == "li" and (
            not el.next_sibling or el.next_sibling.name in ["ul", "ol"]
        ):
            text = text.rstrip()

        # Strip preceding and trailing only newlines
        text = text.strip("\n")
        if len(text) == 0:
            return None

        return text
        # return create_rich_text(text=text)

    # def __getattr__(self, attr):
    #     # Handle headings
    #     m = convert_heading_re.match(attr)
    #     if m:
    #         n = int(m.group(1))

    #         def convert_tag(el, text, convert_as_inline):
    #             return self.convert_hn(n, el, text, convert_as_inline)

    #         convert_tag.__name__ = "convert_h%s" % n
    #         setattr(self, convert_tag.__name__, convert_tag)
    #         return convert_tag

    #     raise AttributeError(attr)

    def should_convert_tag(self, tag):
        tag = tag.lower()
        strip = self.options["strip"]
        convert = self.options["convert"]
        if strip is not None:
            return tag not in strip
        elif convert is not None:
            return tag in convert
        else:
            return True

    # def escape(self, text):
    #     if not text:
    #         return ""
    #     if self.options["escape_misc"]:
    #         text = re.sub(r"([\\&<`[>~#=+|-])", r"\\\1", text)
    #         text = re.sub(r"([0-9])([.)])", r"\1\\\2", text)
    #     if self.options["escape_asterisks"]:
    #         text = text.replace("*", r"\*")
    #     if self.options["escape_underscores"]:
    #         text = text.replace("_", r"\_")
    #     return text

    def indent(self, text, level):
        return line_beginning_re.sub("\t" * level, text) if text else ""

    # def underline(self, text, pad_char):
    #     text = (text or "").rstrip()
    #     return "%s\n%s\n\n" % (text, pad_char * len(text)) if text else ""

    def convert_a(self, el, convert_as_inline):
        text = el.get_text()
        prefix, suffix, text = chomp(text)
        if not text:
            # return ""
            return []

        href = el.get("href")

        # title = el.get("title")
        # For the replacement see #29: text nodes underscores are escaped
        # if (
        #     self.options["autolinks"]
        #     and text.replace(r"\_", "_") == href
        #     and not title
        #     and not self.options["default_title"]
        # ):
        #     # Shortcut syntax
        #     return "<%s>" % href

        # if self.options["default_title"] and not title:
        #     title = href

        # title_part = ' "%s"' % title.replace('"', r"\"") if title else ""
        # return [
        #     create_rich_text(text=prefix),
        #     create_rich_text(text=text, url=href),
        #     create_rich_text(text=suffix),
        # ]
        return create_rich_text(text=text, url=href)
        # return (
        #     "%s[%s](%s%s)%s" % (prefix, text, href, title_part, suffix)
        #     if href
        #     else text
        # )

    convert_b = abstract_inline_conversion(
        lambda self: Annotations(bold=True)  # 2 * self.options["strong_em_symbol"]
    )

    def convert_blockquote(self, el, convert_as_inline):
        text = el.get_text()
        # if convert_as_inline:
        #     return text
        # return (
        #     "\n" + (line_beginning_re.sub("> ", text.strip()) + "\n\n") if text else ""
        # )
        if not text:
            return None

        # if convert_as_inline:
        #     return create_rich_text(text=text)

        # TODO: If text has newlines, split them and add 2, 3, ... lines as children
        return create_quote_block()

    def convert_br(self, el, convert_as_inline):
        if convert_as_inline:
            return None

        return BreakElementPlaceholderBlock(id="", created_time=get_current_time())

    def convert_code(self, el, convert_as_inline):
        text = el.get_text()
        # if el.parent.name == "pre":
        #     return text
        # converter = abstract_inline_conversion(
        #      "`",
        # )
        # return converter(self, el, convert_as_inline)
        if el.parent.name == "pre":
            return create_rich_text()

        converter = abstract_inline_conversion(lambda self: Annotations(code=True))
        return converter(self, el, convert_as_inline)

    convert_del = abstract_inline_conversion(
        lambda self: Annotations(strikethrough=True)
        # "~~"
    )

    convert_em = abstract_inline_conversion(
        lambda self: Annotations(italic=True)
        # self.options["strong_em_symbol"]
    )

    convert_kbd = convert_code

    # def convert_hn(self, n, el, text, convert_as_inline):
    #     if convert_as_inline:
    #         return text

    #     style = self.options["heading_style"].lower()
    #     text = text.strip()
    #     if style == UNDERLINED and n <= 2:
    #         line = "=" if n == 1 else "-"
    #         return self.underline(text, line)
    #     hashes = "#" * n
    #     if style == ATX_CLOSED:
    #         return "%s %s %s\n\n" % (hashes, text, hashes)
    #     return "%s %s\n\n" % (hashes, text)

    def convert_h1(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_h1_block()

    def convert_h2(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_h2_block()

    def convert_h3(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_h3_block()

    def convert_h4(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_paragraph_block()

    def convert_h5(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_paragraph_block()

    def convert_h6(self, el, convert_as_inline):
        # text = el.get_text()
        if convert_as_inline:
            return create_rich_text()

        return create_paragraph_block()

    def convert_hr(self, el, convert_as_inline):
        # return "\n\n---\n\n"
        return create_divider_block()

    convert_i = convert_em

    def convert_img(self, el, convert_as_inline):
        alt = el.attrs.get("alt", None)
        src = el.attrs.get("src", None)
        if not src:
            return None

        # title = el.attrs.get("title", None) or ""
        # title_part = ' "%s"' % title.replace('"', r"\"") if title else ""
        # if (
        #     convert_as_inline
        #     and el.parent.name not in self.options["keep_inline_images_in"]
        # ):
        #     return alt

        # return "![%s](%s%s)" % (alt, src, title_part)
        return create_image_block(url=src, caption=alt)

    def convert_list(self, el, convert_as_inline):
        """
        This is applied to <ul> and <ol> tags. We simply return None, because
        there is no need for a container block for list items in JSON-DOC.
        """
        return None

    convert_ul = convert_list
    convert_ol = convert_list

    def convert_li(self, el, convert_as_inline):
        parent = el.parent
        if parent is not None and parent.name == "ol":
            return create_numbered_list_item_block()
        else:
            return create_bullet_list_item_block()

    def convert_p(self, el, convert_as_inline):
        # text = el.get_text()
        # if convert_as_inline:
        #     # return text
        #     return create_rich_text()

        # if self.options["wrap"]:
        #     text = fill(
        #         text,
        #         width=self.options["wrap_width"],
        #         break_long_words=False,
        #         break_on_hyphens=False,
        #     )
        # return "%s\n\n" % text if text else ""
        # return ParagraphBlock(
        #     paragraph=Paragraph(
        #         rich_text=[RichTextText()],
        #     )
        # )
        return create_paragraph_block()

    def convert_pre(self, el, convert_as_inline):
        text = el.get_text()
        # if not text:
        #     return ""
        # code_language = self.options["code_language"]

        # if self.options["code_language_callback"]:
        #     code_language = self.options["code_language_callback"](el) or code_language

        # return "\n```%s\n%s\n```\n" % (code_language, text)
        if not text:
            return None

        code_language = self.options["code_language"]

        if self.options["code_language_callback"]:
            code_language = self.options["code_language_callback"](el) or code_language

        return create_code_block(code=text, language=code_language)

    def convert_script(self, el, convert_as_inline):
        return None

    def convert_style(self, el, convert_as_inline):
        return None

    convert_s = convert_del

    convert_strong = convert_b

    convert_samp = convert_code

    # Notion does not have an alternative for sub and sup tags
    convert_sub = abstract_inline_conversion(
        lambda self: Annotations()
        # self.options["sub_symbol"],
    )

    convert_sup = abstract_inline_conversion(
        lambda self: Annotations()
        # self.options["sup_symbol"],
    )

    def convert_table(self, el, convert_as_inline):
        # return "\n\n" + text + "\n"
        has_column_header = html_table_has_header_row(el)
        return create_table_block(
            has_column_header=has_column_header,
        )

    def convert_caption(self, el, convert_as_inline):
        # return text + "\n"
        return None  # TBD

    def convert_figcaption(self, el, convert_as_inline):
        # return "\n\n" + text + "\n\n"
        return None  # TBD

    def convert_td(self, el, convert_as_inline):
        """
        Regular table cell

        <td> and <th> elements are intermediately converted to ParagraphBlocks.
        This is so that they act as rich-text containers.
        While paragraph block child is being reconciled to a table row block,
        paragraph_block.rich_text will be extracted to form table_row.cells.
        """
        return create_paragraph_block()

    def convert_th(self, el, convert_as_inline):
        """
        Table header cell
        """
        return create_paragraph_block()

    def convert_tr(self, el, convert_as_inline):
        """
        Table row
        """
        return create_table_row_block()


def html_to_jsondoc(html: str | bytes, **options) -> Page | BlockBase | List[BlockBase]:
    return HtmlToJsonDocConverter(**options).convert(html)
