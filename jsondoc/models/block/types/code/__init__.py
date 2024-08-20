# generated by datamodel-codegen:
#   filename:  example.json
#   timestamp: 2024-08-20T16:21:12+00:00

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from jsondoc.models.block.base import BlockBase
from jsondoc.models.block.types.rich_text.base import RichTextBase
from pydantic import BaseModel, ConfigDict
from typing_extensions import Literal


class Language(Enum):
    abap = 'abap'
    arduino = 'arduino'
    bash = 'bash'
    basic = 'basic'
    c = 'c'
    clojure = 'clojure'
    coffeescript = 'coffeescript'
    c__ = 'c++'
    c_ = 'c#'
    css = 'css'
    dart = 'dart'
    diff = 'diff'
    docker = 'docker'
    elixir = 'elixir'
    elm = 'elm'
    erlang = 'erlang'
    flow = 'flow'
    fortran = 'fortran'
    f_ = 'f#'
    gherkin = 'gherkin'
    glsl = 'glsl'
    go = 'go'
    graphql = 'graphql'
    groovy = 'groovy'
    haskell = 'haskell'
    html = 'html'
    java = 'java'
    javascript = 'javascript'
    json = 'json'
    julia = 'julia'
    kotlin = 'kotlin'
    latex = 'latex'
    less = 'less'
    lisp = 'lisp'
    livescript = 'livescript'
    lua = 'lua'
    makefile = 'makefile'
    markdown = 'markdown'
    markup = 'markup'
    matlab = 'matlab'
    mermaid = 'mermaid'
    nix = 'nix'
    objective_c = 'objective-c'
    ocaml = 'ocaml'
    pascal = 'pascal'
    perl = 'perl'
    php = 'php'
    plain_text = 'plain text'
    powershell = 'powershell'
    prolog = 'prolog'
    protobuf = 'protobuf'
    python = 'python'
    r = 'r'
    reason = 'reason'
    ruby = 'ruby'
    rust = 'rust'
    sass = 'sass'
    scala = 'scala'
    scheme = 'scheme'
    scss = 'scss'
    shell = 'shell'
    sql = 'sql'
    swift = 'swift'
    typescript = 'typescript'
    vb_net = 'vb.net'
    verilog = 'verilog'
    vhdl = 'vhdl'
    visual_basic = 'visual basic'
    webassembly = 'webassembly'
    xml = 'xml'
    yaml = 'yaml'
    java_c_c___c_ = 'java/c/c++/c#'


class Code(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        arbitrary_types_allowed=True,
    )
    caption: Optional[List[RichTextBase]] = None
    rich_text: List[RichTextBase]
    language: Optional[Language] = None
    children: Optional[List[BlockBase]] = None


class CodeBlock(BlockBase):
    type: Literal['code']
    code: Code
