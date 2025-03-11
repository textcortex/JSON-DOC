# JSON-DOC

JSON-DOC is a simple and flexible format for storing structured content in JSON files. It is designed to support a wide variety of content types and use cases, such as paragraphs, headings, lists, tables, images, code blocks, HTML and more.

JSON-DOC is an attempt to standardize the data model used by [Notion](https://notion.so).

## Installation

Install the package from PyPI:

```bash
pip install python-jsondoc
```

## Features

- Documents are represented as a list of blocks
- Each block is a JSON object
- A unique identifier for each block by hashing RFC 8785 Canonical JSON
- Support for nested blocks

## Motivation

TBD