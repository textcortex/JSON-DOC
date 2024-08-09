import json
import os
import sys

import dotenv
import requests

dotenv.load_dotenv(".env")

# Replace with your own values
integration_token = os.getenv("NOTION_INTEGRATION_SECRET")
# page_id = "8d7dbc6b5c554589826c1352450db04e"  # Page ID or URL of the page
page_id = sys.argv[1]

headers = {
    "Authorization": f"Bearer {integration_token}",
    "Notion-Version": "2022-06-28",  # Use the latest Notion API version
}


def fetch_page(page_id):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch page. Status code: {response.status_code}")
        print(response.text)
        return None


def fetch_block_children(block_id):
    url = f"https://api.notion.com/v1/blocks/{block_id}/children"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        ret = response.json()
        for block in ret.get("results", []):
            if block.get("has_children"):
                sub_block_id = block["id"]
                data_ = fetch_block_children(sub_block_id)
                if data_:
                    block["children"] = data_.get("results", [])
        return ret
    else:
        print(f"Failed to fetch block children. Status code: {response.status_code}")
        print(response.text)
        return None


def fetch_page_contents(block_id):
    page_content = fetch_page(block_id)
    contents = {
        "id": block_id,
        "object": "page",
        "properties": page_content.get("properties") if page_content else {},
        "children": [],
    }
    block_data = fetch_block_children(block_id)
    if block_data:
        for block in block_data.get("results", []):
            if block["type"] == "child_page":
                subpage_id = block["id"]
                subpage_contents = fetch_page_contents(subpage_id)
                if subpage_contents:
                    contents["children"].append(subpage_contents)
            else:
                contents["children"].append(block)
    return contents


# Fetch main page contents
main_page_contents = fetch_page_contents(page_id)

# Print the self-contained JSON
print(json.dumps(main_page_contents, indent=4))
