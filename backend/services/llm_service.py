"""Small Gemini JSON client with safe deterministic fallback.

It never completely depends on the LLM.

If:
- API key is missing
- Internet is unavailable
- Gemini returns an error
- JSON cannot be parsed

the caller automatically uses deterministic fallback logic.
"""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request

from pathlib import Path
from typing import Any


PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[2]
)

ENV_PATH = (
    PROJECT_ROOT
    / ".env"
)


def _load_env_file() -> dict[str, str]:

    values: dict[str, str] = {}

    if ENV_PATH.exists():

        for raw in ENV_PATH.read_text(
            encoding="utf-8"
        ).splitlines():

            line = raw.strip()

            if (
                not line
                or line.startswith("#")
                or "=" not in line
            ):

                continue

            key, value = line.split(
                "=",
                1,
            )

            values[
                key.strip()
            ] = (
                value
                .strip()
                .strip("'\"")
            )

    return values


def _config_value(
    name: str,
    default: str = "",
) -> str:

    return (

        os.getenv(name)

        or _load_env_file().get(
            name,
            default,
        )

    )


def configured() -> bool:

    key = _config_value(
        "GEMINI_API_KEY"
    )

    return bool(
        key
        and key
        != "your_gemini_api_key_here"
    )


def configured_model() -> str:

    return _config_value(
        "GEMINI_MODEL",
        "gemini-2.5-flash",
    )


def _extract_json(
    text: str,
) -> Any:

    text = text.strip()

    if text.startswith("```"):

        text = re.sub(
            r"^```(?:json)?\s*",
            "",
            text,
            flags=re.I,
        )

        text = re.sub(
            r"\s*```$",
            "",
            text,
        )

    try:

        return json.loads(
            text
        )

    except json.JSONDecodeError:

        pass

    starts = [

        i

        for i in (
            text.find("{"),
            text.find("["),
        )

        if i >= 0

    ]

    if not starts:

        raise ValueError(
            "LLM response did not contain JSON."
        )

    start = min(
        starts
    )

    opener = text[
        start
    ]

    closer = (
        "}"
        if opener == "{"
        else "]"
    )

    end = text.rfind(
        closer
    )

    if end <= start:

        raise ValueError(
            "LLM response contained incomplete JSON."
        )

    return json.loads(
        text[
            start:
            end + 1
        ]
    )


def generate_json(
    prompt: str,
    *,
    temperature: float = 0.15,
) -> tuple[Any | None, str]:
    """
    Return:

        (parsed_json, mode)

    mode:
        ai
        fallback
    """

    api_key = _config_value(
        "GEMINI_API_KEY"
    )

    if (
        not api_key
        or api_key
        == "your_gemini_api_key_here"
    ):

        return (
            None,
            "fallback",
        )

    preferred = (
        configured_model()
    )

    candidates: list[str] = []

    for name in [

        preferred,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",

    ]:

        if (
            name
            and name not in candidates
        ):

            candidates.append(
                name
            )

    base_contents = [

        {

            "role":
                "user",

            "parts": [

                {
                    "text":
                        prompt
                }

            ],

        }

    ]

    for model in candidates:

        url = (

            "https://generativelanguage.googleapis.com/"
            "v1beta/models/"

            f"{model}:generateContent"
            f"?key={api_key}"

        )

        payloads = [

            {

                "contents":
                    base_contents,

                "generationConfig": {

                    "temperature":
                        temperature,

                    "responseMimeType":
                        "application/json",

                },

            },

            {

                "contents":
                    base_contents,

                "generationConfig": {

                    "temperature":
                        temperature

                },

            },

        ]

        for body in payloads:

            request = urllib.request.Request(

                url,

                data=json.dumps(
                    body
                ).encode(
                    "utf-8"
                ),

                headers={

                    "Content-Type":
                        "application/json"

                },

                method="POST",

            )

            try:

                with urllib.request.urlopen(
                    request,
                    timeout=35,
                ) as response:

                    payload = json.loads(

                        response
                        .read()
                        .decode(
                            "utf-8"
                        )

                    )

                text = (

                    payload[
                        "candidates"
                    ][0][
                        "content"
                    ][
                        "parts"
                    ][0][
                        "text"
                    ]

                )

                return (
                    _extract_json(text),
                    "ai",
                )

            except (
                urllib.error.URLError,
                urllib.error.HTTPError,
                TimeoutError,
                KeyError,
                IndexError,
                json.JSONDecodeError,
                ValueError,
            ):

                continue

    return (
        None,
        "fallback",
    )