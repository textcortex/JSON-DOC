import base64

import dotenv

from jsondoc.transcribe.utils import TokenPrice, Transcriber, Usage, per_mil_tok

dotenv.load_dotenv(".env")


import anthropic

client = anthropic.Anthropic()


class AnthropicTranscriber(Transcriber):
    slug: str

    def get_slug(self):
        return self.slug

    def transcribe(self, path: str):
        image = open(path, "rb")
        image1_media_type = "image/png"
        image1_data = base64.b64encode(image.read()).decode("utf-8")

        message = client.messages.create(
            model=self.slug,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": image1_media_type,
                                "data": image1_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Transcribe this document into text "
                            "including every detail. "
                            "Output only the transcription.",
                        },
                    ],
                }
            ],
        )

        print(message)
        usage = Usage(
            input_tokens=message.usage.input_tokens,
            output_tokens=message.usage.output_tokens,
        )

        return message.content[0].text, usage


HAIKU = AnthropicTranscriber(
    slug="claude-3-haiku-20240307",
    price=TokenPrice(
        input_token_price=per_mil_tok("0.25"),
        output_token_price=per_mil_tok("1.25"),
    ),
)
SONNET = AnthropicTranscriber(
    slug="claude-3-sonnet-20240229",
    price=TokenPrice(
        input_token_price=per_mil_tok("3"),
        output_token_price=per_mil_tok("15"),
    ),
)
OPUS = AnthropicTranscriber(
    slug="claude-3-opus-20240229",
    price=TokenPrice(
        input_token_price=per_mil_tok("15"),
        output_token_price=per_mil_tok("75"),
    ),
)
