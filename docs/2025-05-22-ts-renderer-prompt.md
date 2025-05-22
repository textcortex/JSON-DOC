---
title: "Implementing JSON-DOC TypeScript parser"
author: "Onur <onur@textcortex.com>"
date: "2025-05-21"
---

We have previously implemented a TypeScript parser for JSON-DOC, a new JSON based file format for documents. The excerpt below shows our initial intentions.

---

Convert JSON Schemas into TS interfaces similar to what is in Python with datamodel-codegen. See https://github.com/bcherny/json-schema-to-typescript and https://github.com/ThomasAribart/json-schema-to-ts. Compare the two and choose the best option.

The interfaces MUST BE generated programmatically, just as how we do in Python. Understand the directory structure first, list, navigate and read files. Look at the json schema files under /schema, and compare them with the generated files in the python directory

We basically need to implement parsing of a JSON-DOC file into typed objects in typescript, similar to Python load_jsondoc() and similar functions

Note that we use uv for running python. There are example json-doc files and tests under /tests and github actions that make sure that the parsing and validation logic in python is correct

For a correct ts implementation, similar tests and checks need to be implemented. Make sure to use up-to-date typescript tooling and conventions. This library is supposed to be installed universally, keep that in mind. Do not use obscure or non-general tooling for packaging and distribution. Follow today's best practices

---

This was implemented successfully, and now the tests for serialization and parsing passes. The next step is to implement a React TypeScript renderer for this file format. Implement a React component that will receive a JSON-DOC object and render it in the same visual style as Notion documents. You need to write logic to map each JSON-DOC block into HTML elements.

To aid your process, I have included HTML elements and CSS files from Notion under /examples/notion/frontend. notion_frame1.html contains a Notion page with a lot of different block types, and notion_frame1_reduced.html contains the same page, but with certain information truncated to make it easier to see the structure and fit into the context.

You don't need to match the style exactly, but you need to write code that will render each block at least in a logical and consistent way. Note that blocks can include other blocks recursively.

IMPORTANT: YOU WILL AT NO CIRCUMSTANCE SKIP THE TASK OF RENDERING BLOCKS RECURSIVELY. BLOCKS CAN CONTAIN OTHER BLOCKS AT AN ARBITRARY DEPTH.

YOU WILL RENDER ALL BLOCK TYPES THAT JSON-DOC SUPPORTS.

For your test, you will be making sure that /schema/page/ex1_success.json is rendered correctly with this new React component.

Look at README and CLAUDE.md files for more information. The Python implementation is the single source of truth for the JSON-DOC format. The TypeScript implementation was generated from the Python implementation, so it might contain some errors. If you encounter any errors or inconsistencies, fix them.

TAKING SHORTCUTS WILL BE PENALIZED HEAVILY.

---

Round 2:

npm run test gives error. DO NOT BREAK EXISTING FUNCTIONALITY.

Also, add a script to directly view a json-doc file in the terminal. I don't know how it should work, maybe should start a server and open the file in the browser. Up to you.

Make sure the tests pass. Implement this and add instructions to the README file.

---

Round 3:

JSON-DOC Viewer
File: ex1_success.json • Blocks: 47

🐞
Test document
This is heading 1
Lorem ipsum dolor sit amet
Top level paragraph
Subparagraph level 1
Subparagraph level 2
Subparagraph level 3
Subparagraph level 4
Subparagraph level 5
Subparagraph level 6
This is heading 2
Unsupported block type: table
Unsupported block type: table_row
Unsupported block type: table_row
Unsupported block type: table_row
New line
javascript
This is a code block
Intersecting blocks example
This paragraph has some bold items and links at the same time.
Here are two paragraphs that are
Bulleted list examples
Here is a bulleted list
Item 1
Item 2
I break the list here
I continue here
Enumerated list examples
Here is an enumerated list
Item 1 (1
Item 2 (2)
I break the list here
I continue here (3)
The index continues from the previous (4)
6. I can’t set (6) as the item label
TODO examples
Unsupported block type: to_do
Unsupported block type: to_do
Code blocks
bash
This is a code block
This is a new line
Equations
This is an \int_0^1\sin(x)\,dx inline equation. Below is a block equation:
Unsupported block type: equation
Image blocks
Unsupported block type: image
Quotes
Here is a quote
Some formatted text inside the quote
Divider
Here is a divider:
Columns
Below is a 2 column example
Unsupported block type: column_list
Unsupported block type: column
First column
Unsupported block type: to_do
Unsupported block type: column
Second column
Unsupported block type: table
Unsupported block type: table_row
Unsupported block type: table_row
Unsupported block type: table_row
Below is a 4 column example
Unsupported block type: column_list
Unsupported block type: column
Column 1
A list
Unsupported block type: column
Column 2
Unsupported block type: equation
Unsupported block type: column
Column 3
heading in column
Unsupported block type: column
Column 4
Unsupported block type: toggle
asdfasdfafd

I have included above the text I copied and pasted from the browser. As you can see, I get Unsupported block type errors for some block types.

I have also included screenshots of the page in /screenshots directory. So it is a good start, but there is still a lot done.

Note that certain block types do not map 1 to 1 to HTML elements, such as table elements. They are not isomorphic. To understand why, you can take a look at the HTML to JSON-DOC converter in the Python implementation. Or you can just compare an HTML table to a JSON-DOC table example in the /schema directory.

Now, MAKE SURE THAT ALL THE ELEMENTS ARE RENDERED CORRECTLY. DO NOT INTRODUCE ANY REGRESSIONS.

Also, as a final touch, if you see any way to improve on the visual spacing and such, do it. Use the screenshots in the /screenshots directory as a reference for the current implementation.

---

Round 4:

I still get errors like `Unsupported block type:`. I want to streamline taking renders of the page. Write a script that will automatically take renders of the page and save them to the /screenshots directory. Make sure that the screenshot is divided vertically into 16x9 aspect ratio portions, so that it's processed nicely in the context. Once these images are saved, read them back and use them as a reference for the current implementation.

Also, enumerated list is not implemented properly. There are numerous issues. Infer from the images what needs to be fixed, and then fix them.

DO NOT TAKE ANY SHORTCUTS. TAKING SHORTCUTS WILL BE PENALIZED HEAVILY.

---

Round 5:

Ok great, the red errors are indeed gone. But there are still some rendering issues, in bulleted lists, enumerated lists and tables.

I took a screenshot of the browser of the corresponding Notion page (that corresponds to ex1_success.json). It is saved in /typescript/reference_screenshots/notion_reference.png. You may need to divide it vertically like before, before you read it.

Make sure that there are no unnecessary line breaks, the columns are rendered correctly, and fix numerous other issues. Compare the screenshot you take with the reference screenshot, and fix the issues.

DO NOT TAKE ANY SHORTCUTS. TAKING SHORTCUTS WILL BE PENALIZED HEAVILY.
