#!/usr/bin/env python3
"""
Translate anything on your screen.
Press Cmd+Shift+T → drag to select a region → see the translation.
"""
import signal
import threading
import tkinter as tk
import sys
from pynput import keyboard

from config import HOTKEY_MODIFIERS, HOTKEY_KEY, TARGET_LANGUAGE, POPUP_AUTO_CLOSE
from database import init_db, save_translation

# macOS virtual key codes for printable characters (unaffected by modifier keys).
# Used so Option-modified chars (e.g. Option+T → '†') still match the hotkey.
_CHAR_TO_VK = {
    'a':0,'s':1,'d':2,'f':3,'h':4,'g':5,'z':6,'x':7,'c':8,'v':9,
    'b':11,'q':12,'w':13,'e':14,'r':15,'y':16,'t':17,
    '1':18,'2':19,'3':20,'4':21,'6':22,'5':23,'9':25,'7':26,'8':28,'0':29,
    'o':31,'u':32,'i':34,'p':35,'l':37,'j':38,'k':40,'n':45,'m':46,
}

# Single persistent Tk root that lives for the whole session.
# All Toplevel windows are children of this root so AppKit stays on the main thread.
_tk_root: tk.Tk | None = None


def _dispatch_ui(fn):
    """Schedule fn on the Tkinter main thread and block until it returns."""
    result_holder = [None, None]  # [value, exception]
    done = threading.Event()

    def wrapper():
        try:
            result_holder[0] = fn()
        except Exception as exc:
            result_holder[1] = exc
        finally:
            done.set()

    _tk_root.after(0, wrapper)
    done.wait()
    if result_holder[1] is not None:
        raise result_holder[1]
    return result_holder[0]


def run_translation_flow():
    """Full flow: selected text or region OCR → translate → show popup.
    UI steps are dispatched to the main thread; heavy work stays here."""
    from overlay import capture_region
    from ocr import extract_text, get_selected_text
    from translator import translate
    from popup import show_popup

    text = get_selected_text()
    if text:
        print(f"Selected text: {text!r}")
    else:
        print("No selection found — select a region on your screen...")
        image = _dispatch_ui(lambda: capture_region(_tk_root))
        if image is None:
            print("Selection cancelled.")
            return

        print("Extracting text...")
        text = extract_text(image)
        if not text.strip():
            print("No text found in selection.")
            _dispatch_ui(lambda: _show_error("No text detected in the selected region."))
            return

        print(f"Detected text: {text!r}")
    print("Translating...")
    translated, source_lang = translate(text)
    print(f"Translation ({source_lang} → {TARGET_LANGUAGE}): {translated!r}")

    def on_save():
        save_translation(
            original_text=text,
            translated_text=translated,
            source_language=source_lang,
            target_language=TARGET_LANGUAGE,
        )
        print("Saved to database.")

    _dispatch_ui(lambda: show_popup(
        original_text=text,
        translated_text=translated,
        source_lang=source_lang,
        target_lang=TARGET_LANGUAGE,
        on_save=on_save,
        auto_close=POPUP_AUTO_CLOSE,
        parent=_tk_root,
    ))


def _show_error(message: str):
    from tkinter import messagebox
    messagebox.showerror("Translator", message, parent=_tk_root)


class HotkeyListener:
    def __init__(self):
        self._current_modifiers = set()
        self._triggered = False

    def _modifier_name(self, key) -> str | None:
        mapping = {
            keyboard.Key.cmd: "cmd",
            keyboard.Key.cmd_l: "cmd",
            keyboard.Key.cmd_r: "cmd",
            keyboard.Key.shift: "shift",
            keyboard.Key.shift_l: "shift",
            keyboard.Key.shift_r: "shift",
            keyboard.Key.alt: "alt",
            keyboard.Key.alt_l: "alt",
            keyboard.Key.alt_r: "alt",
            keyboard.Key.ctrl: "ctrl",
            keyboard.Key.ctrl_l: "ctrl",
            keyboard.Key.ctrl_r: "ctrl",
        }
        return mapping.get(key)

    def on_press(self, key):
        mod = self._modifier_name(key)
        if mod:
            self._current_modifiers.add(mod)
            return

        try:
            char = key.char
        except AttributeError:
            char = None

        # On macOS, Option changes key.char (e.g. Option+T → '†'), so also
        # match by virtual key code which is unaffected by modifiers.
        vk = getattr(key, 'vk', None)
        expected_vk = _CHAR_TO_VK.get(HOTKEY_KEY.lower())
        key_matches = (char and char.lower() == HOTKEY_KEY.lower()) or \
                      (vk is not None and vk == expected_vk)

        if key_matches:
            if HOTKEY_MODIFIERS.issubset(self._current_modifiers) and not self._triggered:
                self._triggered = True
                threading.Thread(target=run_translation_flow, daemon=True).start()

    def on_release(self, key):
        mod = self._modifier_name(key)
        if mod:
            self._current_modifiers.discard(mod)
        else:
            self._triggered = False


def _request_accessibility():
    """Prompt macOS to grant Accessibility permission if not already trusted."""
    try:
        import ApplicationServices as AS
        trusted = AS.AXIsProcessTrustedWithOptions(
            {AS.kAXTrustedCheckOptionPrompt: True}
        )
        if not trusted:
            print("Accessibility permission required for highlight-to-translate.")
            print("Grant access in System Settings → Privacy & Security → Accessibility, then restart.")
    except Exception:
        pass


def main():
    global _tk_root
    _request_accessibility()
    init_db()

    _tk_root = tk.Tk()
    _tk_root.withdraw()

    # Run as a background accessory so windows never steal focus from other apps.
    try:
        from AppKit import NSApplication
        NSApplication.sharedApplication().setActivationPolicy_(1)
    except Exception:
        pass

    hotkey_str = "+".join(sorted(HOTKEY_MODIFIERS) + [HOTKEY_KEY.upper()])
    print(f"Translator running. Press {hotkey_str} to translate a screen region.")
    print("Press Ctrl+C to quit.\n")

    listener = HotkeyListener()
    kbd_listener = keyboard.Listener(
        on_press=listener.on_press, on_release=listener.on_release
    )
    kbd_listener.start()

    signal.signal(signal.SIGINT, signal.SIG_DFL)

    _tk_root.mainloop()
    print("\nExiting.")
    kbd_listener.stop()
    sys.exit(0)


if __name__ == "__main__":
    main()
