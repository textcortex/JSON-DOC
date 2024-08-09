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

url = f"https://api.notion.com/v1/pages/{page_id}"

response = requests.get(url, headers=headers)

if response.status_code == 200:
    page_data = response.json()
    print(page_data)
else:
    print(f"Failed to fetch the page. Status code: {response.status_code}")
    print(response.text)
