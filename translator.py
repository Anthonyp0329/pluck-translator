"""Translation using deep-translator (Google Translate free backend)."""
from deep_translator import GoogleTranslator
from langdetect import detect, LangDetectException
from config import TARGET_LANGUAGE


def detect_language(text: str) -> str:
    try:
        return detect(text)
    except LangDetectException:
        return "auto"


def translate(text: str, target_language: str = TARGET_LANGUAGE) -> tuple[str, str]:
    """
    Translate text to the target language.
    Returns (translated_text, detected_source_language).
    """
    source_lang = detect_language(text)

    # If already in target language, still run through translator for consistency
    translator = GoogleTranslator(source="auto", target=target_language)
    translated = translator.translate(text)

    return translated, source_lang
