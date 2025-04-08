import re
from types import NoneType
from typing import Callable, List, Union

from bs4 import BeautifulSoup, Comment, Doctype, NavigableString
from pydantic import BaseModel

from jsondoc.convert.placeholder import (
    BreakElementPlaceholderBlock,
    CaptionPlaceholderBlock,
    CellPlaceholderBlock,
    FigurePlaceholderBlock,
)
from jsondoc.convert.utils import (
    append_rich_text_to_block,
    append_to_parent_block,
    append_to_rich_text,
    block_supports_rich_text,
    create_bullet_list_item_block,
    create_cell_placeholder_block,
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
    run_final_block_transformations,
)
from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.image import ImageBlock
from jsondoc.models.block.types.paragraph import ParagraphBlock
from jsondoc.models.block.types.rich_text.base import RichTextBase
from jsondoc.models.block.types.rich_text.equation import RichTextEquation
from jsondoc.models.block.types.rich_text.text import Link, RichTextText
from jsondoc.models.block.types.table_row import TableRowBlock
from jsondoc.models.page import Page
from jsondoc.models.shared_definitions import Annotations
from jsondoc.rules import is_block_child_allowed
from jsondoc.utils import generate_block_id, get_current_time

line_beginning_re = re.compile(r"^", re.MULTILINE)
whitespace_re = re.compile(r"[\t ]+")
all_whitespace_re = re.compile(r"[\s]+")
html_heading_re = re.compile(r"h[1-6]")


CHILDREN_TYPE = Union[BlockBase, RichTextBase, str]
RICH_TEXT_TYPE = Union[RichTextBase, RichTextEquation]


class ConvertOutput(BaseModel):
    """
    Return type for convert functions

    Children objects are reconciled to the main object,
    i.e. first we run:
    >>> reconcile_to_block(block: BlockBase, children: List[CHILDREN_TYPE]) -> List[CHILDREN_TYPE]
    and then we concatenate the result with prev_objects and next_objects:
    >>> final_objects = prev_objects + reconciled_objects + next_objects
    """

    main_object: BlockBase | RichTextBase
    prev_objects: List[BlockBase | RichTextBase] = []
    next_objects: List[BlockBase | RichTextBase] = []


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
        annotations = markup_fn(self)

        if el.find_parent(["pre", "code", "kbd", "samp"]):
            return ConvertOutput(main_object=create_rich_text())

        # prefix, suffix, text = chomp(text)
        # if not text:
        #     return None

        return ConvertOutput(main_object=create_rich_text(annotations=annotations))

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


def apply_parent_rich_text_style(
    parent: RichTextText | RichTextEquation,
    child: RichTextText | RichTextEquation,
):
    parent_annotations = parent.annotations
    child_annotations = child.annotations

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

    if parent.href is not None:
        child.href = parent.href
        child.text.link = Link(url=parent.href)

    # TBD: Decide how to handle color


def apply_rich_text_style_to_block_recursive(
    rich_text: RichTextText | RichTextEquation,
    block: BlockBase,
):
    """
    Recursively applies the annotations to the block and its children
    """
    if hasattr(block, "children") and isinstance(block.children, list):
        for child in block.children:
            apply_rich_text_style_to_block_recursive(rich_text, child)

    # Get rich text
    rich_text_list = get_rich_text_from_block(block)
    if isinstance(rich_text_list, list):
        for sub_rich_text in rich_text_list:
            apply_parent_rich_text_style(rich_text, sub_rich_text)


def append_caption_block_to_table_row_block(
    parent_table_row_block: TableRowBlock,
    child_paragraph_block: CellPlaceholderBlock,
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


def append_caption_block_to_image_block(
    parent_image_block: ImageBlock,
    child_paragraph_block: CaptionPlaceholderBlock,
):
    """
    Sets a caption for an image block
    """
    parent_image_block.image.caption = child_paragraph_block.rich_text


def override_reconcile_to_figure_placeholder_block(
    _: FigurePlaceholderBlock, children: List[CHILDREN_TYPE]
):
    """
    Given a figure placeholder block and a list of children,
    this function will reconcile the children to the block
    and return a list of objects

    We don't use the figure placeholder block and just return the children
    """
    image_block = None
    caption_block = None

    ret = []
    for child in children:
        if isinstance(child, CaptionPlaceholderBlock):
            caption_block = child
            continue
        elif isinstance(child, ImageBlock):
            image_block = child

        ret.append(child)

    if image_block is not None and caption_block is not None:
        image_block.image.caption = caption_block.rich_text

    return ret


def override_reconcile_to_caption_placeholder_block(
    parent: CaptionPlaceholderBlock, children: List[CHILDREN_TYPE]
):
    """
    Given a caption placeholder block and a list of children,
    this function will get the rich text from the children
    and set it as the rich text of the caption placeholder block
    Finally, it will return the caption placeholder block
    """

    final_rich_text = []
    for child in children:
        if isinstance(child, RichTextBase):
            final_rich_text.append(child)
        elif isinstance(child, BlockBase):
            final_rich_text.extend(get_rich_text_from_block(child))
        elif isinstance(child, str):
            final_rich_text.append(create_rich_text(text=child))
        else:
            pass
            # raise ValueError(f"Unsupported type: {type(child)}")

    parent.rich_text = final_rich_text

    return [parent]


# Override append functions
# Maps pairs of (parent_block_type, child_block_type) to a function
# that appends the child block to the parent block
OVERRIDE_APPEND_FUNCTIONS = {
    (TableRowBlock, CellPlaceholderBlock): append_caption_block_to_table_row_block,
    (ImageBlock, CaptionPlaceholderBlock): append_caption_block_to_image_block,
}

OVERRIDE_RECONCILE_FUNCTIONS = {
    FigurePlaceholderBlock: override_reconcile_to_figure_placeholder_block,
    CaptionPlaceholderBlock: override_reconcile_to_caption_placeholder_block,
}


def reconcile_to_rich_text(
    parent_rich_text: RICH_TEXT_TYPE, children: List[CHILDREN_TYPE]
) -> List[CHILDREN_TYPE]:
    """
    Given a parent rich text and a list of children,
    this function will apply the parent annotations
    to the children and return a list of objects
    """
    # Get non-null/false values from annotations
    final_objects = []

    for child in children:
        if isinstance(child, RichTextBase):
            apply_parent_rich_text_style(parent_rich_text, child)
            final_objects.append(child)
        elif isinstance(child, BlockBase):
            apply_rich_text_style_to_block_recursive(parent_rich_text, child)
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
    block: BlockBase,
    children: List[CHILDREN_TYPE],
    typeid: bool = False,
) -> List[CHILDREN_TYPE]:
    """
    Given a block and a list of children,
    this function will reconcile the children to the block
    and return a list of objects
    """
    override_reconcile_fn = OVERRIDE_RECONCILE_FUNCTIONS.get(type(block))
    if override_reconcile_fn:
        return override_reconcile_fn(block, children)

    remaining_children = []
    objects = [block]

    # Any string will be added to the current rich text
    current_rich_text = None
    for child in children:
        if isinstance(child, str):
            if current_rich_text is None:
                current_rich_text = create_rich_text()

            append_to_rich_text(current_rich_text, child)

            if block_supports_rich_text(block):
                append_rich_text_to_block(block, current_rich_text)
            else:
                remaining_children.append(current_rich_text)

        elif isinstance(child, RichTextBase):
            if block_supports_rich_text(block):
                append_rich_text_to_block(block, child)
                current_rich_text = None
            else:
                remaining_children.append(child)

        elif isinstance(child, BreakElementPlaceholderBlock):
            # TBD: Should probably abstract away all placeholder blocks
            # Create an empty version of the current block, and set it as the current parent
            # A <br> element basically creates an empty block of the same type as the parent
            block_type = block.type
            # Get corresponding field from the block
            block_field = getattr(block, block_type)
            init_kwargs = {
                "id": generate_block_id(typeid=typeid),
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
    class Options(BaseModel):
        autolinks: bool = True
        code_language: str = ""
        code_language_callback: Callable | None = None
        convert: Callable | None = None
        default_title: bool = False
        keep_inline_images_in: list[str] = []
        strip: str | None = None
        force_page: bool = False
        typeid: bool = False

    def __init__(self, **options):
        self.options = self.Options(**options)
        if self.options.strip is not None and self.options.convert is not None:
            raise ValueError(
                "You may specify either tags to strip or tags to convert, but not both."
            )

    def convert(self, html: str | bytes) -> Page | BlockBase | List[BlockBase]:
        soup = BeautifulSoup(html, "html.parser")
        return self.convert_soup(soup)

    def convert_soup(self, soup: BeautifulSoup) -> Page | BlockBase | List[BlockBase]:
        children = self.process_tag(soup, convert_as_inline=False, children_only=True)
        children = run_final_block_transformations(children)
        is_page = self._is_soup_page(soup)

        ret = None
        if is_page or self.options.force_page:
            title = self._get_html_title(soup)
            # Ensure that children is a list
            if not isinstance(children, list):
                children = [children]

            # Create a page and add all the blocks to it
            ret = create_page(
                title=title,
                children=children,
                typeid=self.options.typeid,
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
        objects = []

        # Headings or cells can't include block elements (elements w/newlines)
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
                processed_text = self.process_text(el)
                if processed_text:
                    children_objects.append(processed_text)
            else:
                # text += self.process_tag(el, convert_children_as_inline)
                new_objects = self.process_tag(el, convert_children_as_inline)
                children_objects += new_objects

        current_level_object = None
        current_level_prev_objects = []
        current_level_next_objects = []
        if not children_only:
            convert_fn = getattr(self, "convert_%s" % node.name, None)
            if convert_fn and self.should_convert_tag(node.name):
                # text = convert_fn(node, text, convert_as_inline)
                # current_level_object = convert_fn(node, convert_as_inline)
                convert_output = convert_fn(node, convert_as_inline)
                assert isinstance(convert_output, (ConvertOutput, NoneType)), (
                    f"Convert function {convert_fn} must return a ConvertOutput or None"
                )

                if convert_output is not None:
                    current_level_object = convert_output.main_object
                    current_level_prev_objects = convert_output.prev_objects
                    current_level_next_objects = convert_output.next_objects

        # print(node, repr(current_level_object))

        if current_level_object is None:
            objects = children_objects
        elif isinstance(current_level_object, BlockBase):
            objects = reconcile_to_block(
                current_level_object,
                children_objects,
                typeid=self.options.typeid,
            )
        elif isinstance(current_level_object, RichTextBase):
            objects = reconcile_to_rich_text(current_level_object, children_objects)
        else:
            raise Exception(
                f"Current node has yielded an unexpected type {type(current_level_object)}"
            )

        objects = current_level_prev_objects + objects + current_level_next_objects
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

        # Check for <html> and <body> tags
        html_tag = soup.find("html")
        body_tag = soup.find("body")
        if not html_tag or not body_tag:
            return False

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
        # if el.parent.name == "li" and (
        #     not el.next_sibling or el.next_sibling.name in ["ul", "ol"]
        # ):
        #     text = text.rstrip()

        # Strip preceding and trailing only newlines
        # text = text.strip("\n")
        # Match whitespace at the end of string and convert it to a single space
        text = re.sub(r"\s+$", " ", text)
        # Match whitespace at the beginning of string and convert it to a single space
        text = re.sub(r"^\s+", " ", text)

        if not el.previous_sibling:
            text = text.lstrip()

        if not el.next_sibling:
            text = text.rstrip()

        if len(text) == 0:
            return None

        return text

    def should_convert_tag(self, tag):
        tag = tag.lower()
        strip = self.options.strip
        convert = self.options.convert
        if strip is not None:
            return tag not in strip
        elif convert is not None:
            return tag in convert
        else:
            return True

    def convert_a(self, el, convert_as_inline):
        href = el.get("href")
        return ConvertOutput(main_object=create_rich_text(url=href))

    convert_b = abstract_inline_conversion(
        lambda self: Annotations(bold=True)  # 2 * self.options.strong_em_symbol
    )

    def convert_blockquote(self, el, convert_as_inline):
        # text = el.get_text()
        # if convert_as_inline:
        #     return text
        # return (
        #     "\n" + (line_beginning_re.sub("> ", text.strip()) + "\n\n") if text else ""
        # )
        # if not text:
        #     return None

        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        # TODO: If text has newlines, split them and add 2, 3, ... lines as children
        return ConvertOutput(
            main_object=create_quote_block(
                typeid=self.options.typeid,
            )
        )

    def convert_br(self, el, convert_as_inline):
        if convert_as_inline:
            return None

        return ConvertOutput(
            main_object=BreakElementPlaceholderBlock(
                id="", created_time=get_current_time()
            )
        )

    def convert_code(self, el, convert_as_inline):
        # if el.parent.name == "pre":
        #     return text
        # converter = abstract_inline_conversion(
        #      "`",
        # )
        # return converter(self, el, convert_as_inline)
        if el.parent.name == "pre":
            return ConvertOutput(main_object=create_rich_text())

        converter = abstract_inline_conversion(lambda self: Annotations(code=True))
        return converter(self, el, convert_as_inline)

    convert_del = abstract_inline_conversion(
        lambda self: Annotations(strikethrough=True)
    )

    convert_em = abstract_inline_conversion(lambda self: Annotations(italic=True))

    convert_kbd = convert_code

    def convert_h1(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(main_object=create_h1_block(typeid=self.options.typeid))

    def convert_h2(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(main_object=create_h2_block(typeid=self.options.typeid))

    def convert_h3(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(main_object=create_h3_block(typeid=self.options.typeid))

    def convert_h4(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(
            main_object=create_paragraph_block(typeid=self.options.typeid)
        )

    def convert_h5(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(
            main_object=create_paragraph_block(typeid=self.options.typeid)
        )

    def convert_h6(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(
            main_object=create_paragraph_block(typeid=self.options.typeid)
        )

    def convert_hr(self, el, convert_as_inline):
        return ConvertOutput(
            main_object=create_divider_block(typeid=self.options.typeid)
        )

    convert_i = convert_em

    def convert_img(self, el, convert_as_inline):
        alt = el.attrs.get("alt", None)
        src = el.attrs.get("src", None)
        if not src:
            return None

        # title = el.attrs.get("title", None) or ""
        # title_part = ' "%s"' % title.replace('"', r"\"") if title else ""
        if (
            convert_as_inline
            and el.parent.name not in self.options.keep_inline_images_in
        ):
            return alt

        return ConvertOutput(
            main_object=create_image_block(
                url=src,
                typeid=self.options.typeid,
                # alt is not supported in JSON-DOC yet
                # caption=alt,
            )
        )

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
            return ConvertOutput(
                main_object=create_numbered_list_item_block(typeid=self.options.typeid)
            )
        else:
            return ConvertOutput(
                main_object=create_bullet_list_item_block(typeid=self.options.typeid)
            )

    def convert_p(self, el, convert_as_inline):
        if convert_as_inline:
            return ConvertOutput(main_object=create_rich_text())

        return ConvertOutput(
            main_object=create_paragraph_block(typeid=self.options.typeid)
        )

    def convert_pre(self, el, convert_as_inline):
        text = el.get_text()

        if not text:
            return None

        code_language = self.options.code_language

        if self.options.code_language_callback:
            code_language = self.options.code_language_callback(el) or code_language

        return ConvertOutput(
            main_object=create_code_block(
                language=code_language, typeid=self.options.typeid
            )
        )

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
        # self.options.sub_symbol,
    )

    convert_sup = abstract_inline_conversion(
        lambda self: Annotations()
        # self.options.sup_symbol,
    )

    def convert_table(self, el, convert_as_inline):
        has_column_header = html_table_has_header_row(el)
        return ConvertOutput(
            main_object=create_table_block(
                has_column_header=has_column_header, typeid=self.options.typeid
            )
        )

    def convert_caption(self, el, convert_as_inline):
        return ConvertOutput(
            main_object=CaptionPlaceholderBlock(
                id="",
                created_time=get_current_time(),
                type="caption_placeholder",
                rich_text=[],
            )
        )

    convert_figcaption = convert_caption

    def convert_figure(self, el, convert_as_inline):
        return ConvertOutput(
            main_object=FigurePlaceholderBlock(
                id="",
                created_time=get_current_time(),
                type="figure_placeholder",
                rich_text=[],
            )
        )

    def convert_td(self, el, convert_as_inline):
        """
        Regular table cell

        <td> and <th> elements are intermediately converted to ParagraphBlocks.
        This is so that they act as rich-text containers.
        While paragraph block child is being reconciled to a table row block,
        paragraph_block.rich_text will be extracted to form table_row.cells.
        """
        # Get colspan
        colspan = el.get("colspan", "1")
        # Get rowspan
        # rowspan = el.get("rowspan", 1)
        # We need to come up with a much different way to handle rowspan
        if not isinstance(colspan, int):
            try:
                colspan = int(colspan)
            except ValueError:
                colspan = 1

        next_objects = []
        if colspan > 1:
            next_objects = [create_cell_placeholder_block() for _ in range(colspan - 1)]

        return ConvertOutput(
            main_object=create_cell_placeholder_block(),
            next_objects=next_objects,
        )

    # Headers are handled the same way as regular cells
    # Header row/column information is passed at a higher level
    convert_th = convert_td

    def convert_tr(self, el, convert_as_inline):
        """
        Table row
        """
        return ConvertOutput(
            main_object=create_table_row_block(typeid=self.options.typeid)
        )


def html_to_jsondoc(html: str | bytes, **options) -> Page | BlockBase | List[BlockBase]:
    return HtmlToJsonDocConverter(**options).convert(html)
