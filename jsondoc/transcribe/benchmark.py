from typing import List

import dotenv
import PIL.Image
from thefuzz import fuzz

from jsondoc.transcribe.anthropic_ import HAIKU
from jsondoc.transcribe.fireworks import LLAVA_YI_34B
from jsondoc.transcribe.utils import ImageInfo, Transcriber, get_alphanumeric

dotenv.load_dotenv(".env")


import anthropic

client = anthropic.Anthropic()


IMAGE_PATH = "./example_doc/p1.png"

MODELS_TO_BENCHMARK: List[Transcriber] = [
    LLAVA_YI_34B,
    HAIKU,
]

# Height
HEIGHTS_TO_BENCHMARK = [
    None,
    2000,
    1500,
    1400,
    1300,
    1200,
    1100,
    1000,
    900,
    800,
    700,
    600,
    500,
    400,
]


def transcribe_resize(
    model: Transcriber,
    path: str,
    height=None,
    ground_truth=None,
):
    # Get image information
    image = PIL.Image.open(path)
    if height is not None:
        if height > image.height:
            raise ValueError("Resolution cannot be greater than the image height")

        image = image.resize(
            (int(height * image.width / image.height), height),
        )
        # Save the resized to a temporary file
        path = "/tmp/resized.png"
        image.save(path)

    image = PIL.Image.open(path)
    image_info = ImageInfo(
        width=image.width,
        height=image.height,
        mode=image.mode,
        format=image.format,
    )
    text, usage = model.transcribe(path)
    cost = (
        model.price.input_token_price * usage.input_tokens
        + model.price.output_token_price * usage.output_tokens
    )
    print(f"Resolution:           {image_info.width}x{image_info.height}")
    print(f"Number of pixels:     {image_info.width * image_info.height}")
    print(f"Price:                {cost:.2g} USD")
    print(f"Price per 1000 pages: {cost * 1000:.2g} USD")
    # print("Message:")
    # print(message)
    if ground_truth is not None:
        similarity = fuzz.ratio(
            get_alphanumeric(ground_truth),
            get_alphanumeric(text),
        )
        print(f"Similarity: {similarity}%")

    return text, usage, image_info


# opus_msg, _ = OPUS_TRANSCRIBER.transcribe(IMAGE_PATH)
# GROUND_TRUTH = opus_msg
GROUND_TRUTH = "Seite 1 von 5\n\nMietvertrag\n\nZwischen\nName Munevera Mujovic\nAdresse Stubenrauchstr. 33 B, 12357 Berlin\nTel: 0178/3464003\n                                                      - Vermieter -\nund\n\nName Hüseyin Onur Solmaz\nAdresse ______________________________\nTel: +49 176 8797 4685\n                                                      - Mieter -\nkommt nachfolgender Mietvertrag über Wohnraum zustande:\n\n§1 Mieträume\nDer Vermieter vermietet dem Mieter zu Wohnzwecken die im Hause\nLandsberger Allee 38, 10249 Berlin (Adresse) im 1.OG (Rechts) gelegene Wohnung\nbestehend aus 3 Zimmern, Küche, Bad/WC. Die Wohn/Nutzfläche beträgt ca. 90 Quadratmeter.\n\n§2 Mietzins und Nebenkosten\n\nDie monatliche Grundmiete beträgt                                      1.100,00     EUR\n\nNeben der Miete trägt der Mieter die Betriebskosten i.S.d.\nBetriebskostenverordnung (Betr.KV s. Anlage 1)\n\nAuf diese Betriebskosten ist eine monatliche Vorauszahlung von             200,00     EUR\nzu zahlen.                                                              ------------------\n\nInsgesamt sind vom Mieter zu bezahlen:                                 1.300,00     EUR"

print("GROUND TRUTH:")
print(GROUND_TRUTH)
print("====================================================")


for model_ in MODELS_TO_BENCHMARK:
    print(f"Model: {model_.get_slug()}")
    for height in HEIGHTS_TO_BENCHMARK:
        try:
            message, usage, image_info = transcribe_resize(
                model=model_,
                path=IMAGE_PATH,
                height=height,
                ground_truth=GROUND_TRUTH,
            )
        except ValueError:
            print(f"Skipping resolution {height}")
        print("====================================================")
