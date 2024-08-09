import os
import requests
import dotenv

dotenv.load_dotenv(".env")

# Replace with your own values
integration_token = os.getenv("NOTION_INTEGRATION_SECRET")
page_id = "8d7dbc6b5c554589826c1352450db04e"  # Page ID or URL of the page

headers = {
    "Authorization": f"Bearer {integration_token}",
    "Notion-Version": "2022-06-28",  # Use the latest Notion API version
}


def fetch_block_children(block_id):
    url = f"https://api.notion.com/v1/blocks/{block_id}/children"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch block children. Status code: {response.status_code}")
        print(response.text)
        return None


def fetch_page_contents(page_id):
    contents = []
    page_data = fetch_block_children(page_id)
    if page_data:
        contents.append(page_data)
        for block in page_data.get("results", []):
            if block["type"] == "child_page":
                subpage_id = block["id"]
                subpage_contents = fetch_page_contents(subpage_id)
                if subpage_contents:
                    contents.extend(subpage_contents)
    return contents


# Fetch main page contents
main_page_contents = fetch_page_contents(page_id)

# Print the contents
for content in main_page_contents:
    print(content)
