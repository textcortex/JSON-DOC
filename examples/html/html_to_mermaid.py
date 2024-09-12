from bs4 import BeautifulSoup


def escape(text):
    return text.replace('"', "&quot;")


def traverse_node(node, parent_id, mermaid_lines, node_counter):
    """
    Recursively traverses an HTML node and builds Mermaid lines for a tree diagram.

    Args:
        node (BeautifulSoup element): The current HTML node.
        parent_id (str): The ID of the parent node.
        mermaid_lines (list): List of Mermaid lines describing the tree structure.
        node_counter (list): Counter to keep track of node IDs.
    """
    # Generate a unique ID for the current node
    node_id = f"node{node_counter[0]}"
    node_counter[0] += 1

    # Determine the label for the current node
    if node.name:  # Element node
        label = f"&lt;{node.name}&gt;"
    else:  # Text node
        # label = node.strip() if node.strip() else "Text"
        text_ = node.strip()
        truncated_text = text_[:5]
        # Escape double quotes in the text

        if len(text_) > 10:
            label = escape(truncated_text) + f"... ({len(text_)} chars)"
        else:
            label = escape(text_)

    # Add the Mermaid line for the current node
    mermaid_lines.append(f'{parent_id} --> {node_id}["{label}"]')

    # Recursively process child nodes
    if hasattr(node, "children"):  # Check if the node has children
        for child in node.children:
            if child.name or (child.string and child.string.strip()):
                traverse_node(child, node_id, mermaid_lines, node_counter)


def generate_mermaid_diagram(html_content):
    """
    Generates a Mermaid diagram for the given HTML content.

    Args:
        html_content (str): The HTML content to parse.

    Returns:
        str: The Mermaid diagram code.
    """
    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # Initialize Mermaid diagram lines and node counter
    mermaid_lines = ["graph TD;"]
    node_counter = [1]  # Using a list to pass by reference

    # Start traversal from the root element (usually <html>)
    root = soup.find()  # Get the first root element
    root_id = "root"
    mermaid_lines.append(f'{root_id}["&lt;{root.name}&gt;"]')

    # Traverse the HTML tree starting from the root
    if hasattr(root, "children"):
        for child in root.children:
            if child.name or (child.string and child.string.strip()):
                traverse_node(child, root_id, mermaid_lines, node_counter)

    # Join all lines into a single Mermaid diagram string
    return "\n".join(mermaid_lines)


if __name__ == "__main__":
    # # Example usage
    # html_content = (
    #     "<p>This is a <b>bold</b> word and this is an <em>emphasized</em> word.</p>"
    # )
    # mermaid_diagram = generate_mermaid_diagram(html_content)
    # print(mermaid_diagram)
    import argparse

    parser = argparse.ArgumentParser(
        description="Convert HTML content to a Mermaid diagram"
    )
    parser.add_argument("html_file", help="Path to the HTML file to convert")

    args = parser.parse_args()

    with open(args.html_file, "r") as file:
        html_content = file.read()
        mermaid_diagram = generate_mermaid_diagram(html_content)
        print(mermaid_diagram)
