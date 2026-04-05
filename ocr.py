"""OCR using Apple's Vision framework via pyobjc."""
import os
import tempfile
from PIL import Image


def get_selected_text() -> str | None:
    """
    Copy the current selection to the clipboard via Cmd+C (using CGEvent) and return it.
    Requires Accessibility permission (System Settings → Privacy & Security → Accessibility).
    """
    import time
    import AppKit
    import Quartz

    try:
        pb = AppKit.NSPasteboard.generalPasteboard()
        old_count = pb.changeCount()

        # Wait for the hotkey modifier keys to be physically released
        time.sleep(0.15)

        # Simulate Cmd+C via CGEvent (kVK_ANSI_C = 8)
        src = Quartz.CGEventSourceCreate(Quartz.kCGEventSourceStateHIDSystemState)
        key_down = Quartz.CGEventCreateKeyboardEvent(src, 8, True)
        Quartz.CGEventSetFlags(key_down, Quartz.kCGEventFlagMaskCommand)
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_down)

        key_up = Quartz.CGEventCreateKeyboardEvent(src, 8, False)
        Quartz.CGEventSetFlags(key_up, Quartz.kCGEventFlagMaskCommand)
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_up)

        time.sleep(0.15)

        if pb.changeCount() == old_count:
            return None

        text = pb.stringForType_("public.utf8-plain-text")
        return str(text).strip() or None
    except Exception as e:
        print(f"Clipboard copy failed: {e}")
        return None


def extract_text(image: Image.Image) -> str:
    """Extract text from a PIL Image using Apple Vision OCR."""
    # Save image to a temp file so Vision can read it
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
        image.save(tmp_path)

    try:
        return _run_vision_ocr(tmp_path)
    finally:
        os.unlink(tmp_path)


def _run_vision_ocr(image_path: str) -> str:
    import Vision
    import Quartz
    import CoreFoundation

    url = CoreFoundation.CFURLCreateFromFileSystemRepresentation(
        None, image_path.encode("utf-8"), len(image_path.encode("utf-8")), False
    )
    source = Quartz.CGImageSourceCreateWithURL(url, None)
    cg_image = Quartz.CGImageSourceCreateImageAtIndex(source, 0, None)

    results = []
    error_ptr = None

    request = Vision.VNRecognizeTextRequest.alloc().init()
    request.setRecognitionLevel_(1)  # VNRequestTextRecognitionLevelAccurate = 1
    request.setUsesLanguageCorrection_(False)
    request.setRecognitionLanguages_([
        "es", "en", "fr", "de", "it", "pt", "nl",
        "zh-Hans", "zh-Hant", "ja", "ko",
    ])

    handler = Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(
        cg_image, {}
    )
    success, error = handler.performRequests_error_([request], None)

    if not success:
        raise RuntimeError(f"Vision OCR failed: {error}")

    for observation in request.results() or []:
        candidates = observation.topCandidates_(1)
        if candidates:
            results.append(candidates[0].string())

    return "\n".join(results)
