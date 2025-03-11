import base64
import json
import os

import dotenv
import requests

from jsondoc.transcribe.utils import TokenPrice, Transcriber, Usage, per_mil_tok

dotenv.load_dotenv(".env")

FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")


class FireworksTranscriber(Transcriber):
    slug: str

    def get_slug(self):
        return self.slug

    def transcribe(self, path: str):
        with open(path, "rb") as image:
            image_base64 = base64.b64encode(image.read()).decode("utf-8")

        url = "https://api.fireworks.ai/inference/v1/chat/completions"
        payload = {
            # "model": "accounts/fireworks/models/llava-yi-34b",
            "model": self.slug,
            "max_tokens": 2048,
            "top_p": 1,
            "top_k": 40,
            "presence_penalty": 0,
            "frequency_penalty": 0,
            "temperature": 0.6,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Transcribe this document into text including every detail."
                            "Output only the transcription.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                            },
                        },
                    ],
                }
            ],
        }
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {FIREWORKS_API_KEY}",
        }
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(payload)
        )
        body = response.json()
        print(body)
        if response.status_code == 200:
            try:
                text = body.get("choices", {})[0].get("message", {}).get("content")
                usage = Usage(
                    input_tokens=body.get("usage", {}).get("prompt_tokens"),
                    output_tokens=body.get("usage", {}).get("completion_tokens"),
                )
                return text, usage
            except Exception as e:
                print(e)
                return None, None

        return None, None


LLAVA_YI_34B = FireworksTranscriber(
    slug="accounts/fireworks/models/llava-yi-34b",
    price=TokenPrice(
        input_token_price=per_mil_tok("0.9"),
        output_token_price=per_mil_tok("0.9"),
    ),
)

# # Example usage
# path = "example_doc/p1.png"
# response = transcribe_llava(path)
# print(json.dumps(response, indent=4))

# import ipdb

# ipdb.set_trace()
