"""Floating translation result popup."""
import tkinter as tk

BG = "#18181b"
BORDER = "#3f3f46"
LANG_FG = "#71717a"
ORIG_FG = "#a1a1aa"
TRANS_FG = "#f4f4f5"
COPY_BG = "#27272a"
COPY_HOVER = "#3f3f46"
COPY_FG = "#a1a1aa"
COPY_DONE_FG = "#4ade80"


class TranslationPopup:
    def __init__(self, original_text: str, translated_text: str,
                 source_lang: str, target_lang: str,
                 on_save=None, auto_close: int = 0, parent: tk.Tk = None):

        self._on_save = on_save
        self.root = tk.Toplevel(parent) if parent else tk.Tk()
        self.root.overrideredirect(True)
        self.root.configure(bg=BORDER)
        self.root.attributes("-topmost", True)

        # 1px border effect via outer frame color
        inner = tk.Frame(self.root, bg=BG, padx=16, pady=12)
        inner.pack(padx=1, pady=1, fill="both", expand=True)

        # — Language pill —
        lang_row = tk.Frame(inner, bg=BG)
        lang_row.pack(fill="x", pady=(0, 8))

        tk.Label(
            lang_row,
            text=f"{source_lang.upper()}  →  {target_lang.upper()}",
            bg=BG, fg=LANG_FG,
            font=("Helvetica Neue", 10),
        ).pack(side="left")

        close = tk.Label(lang_row, text="✕", bg=BG, fg=LANG_FG,
                         font=("Helvetica Neue", 12), cursor="hand2")
        close.pack(side="right")
        close.bind("<Button-1>", lambda e: self._close(save=True))
        close.bind("<Enter>", lambda e: close.configure(fg=TRANS_FG))
        close.bind("<Leave>", lambda e: close.configure(fg=LANG_FG))

        # — Original text —
        orig = self._make_textbox(inner, ORIG_FG, 11, original_text)
        orig.pack(fill="x", pady=(0, 6))

        # — Divider —
        tk.Frame(inner, bg=BORDER, height=1).pack(fill="x", pady=(0, 8))

        # — Translated text —
        trans = self._make_textbox(inner, TRANS_FG, 14, translated_text, bold=True)
        trans.pack(fill="x", pady=(0, 10))

        # — Buttons row —
        btn_row = tk.Frame(inner, bg=BG)
        btn_row.pack(anchor="w")

        self._copy_btn = tk.Label(
            btn_row, text="Copy", bg=COPY_BG, fg=COPY_FG,
            font=("Helvetica Neue", 11), padx=12, pady=4, cursor="hand2",
        )
        self._copy_btn.pack(side="left")
        self._copy_btn.bind("<Button-1>", lambda e: self._copy(translated_text))
        self._copy_btn.bind("<Enter>", lambda e: self._copy_btn.configure(bg=COPY_HOVER))
        self._copy_btn.bind("<Leave>", lambda e: self._copy_btn.configure(bg=COPY_BG))

        discard_btn = tk.Label(
            btn_row, text="Discard", bg=COPY_BG, fg=COPY_FG,
            font=("Helvetica Neue", 11), padx=12, pady=4, cursor="hand2",
        )
        discard_btn.pack(side="left", padx=(8, 0))
        discard_btn.bind("<Button-1>", lambda e: self._close(save=False))
        discard_btn.bind("<Enter>", lambda e: discard_btn.configure(bg=COPY_HOVER))
        discard_btn.bind("<Leave>", lambda e: discard_btn.configure(bg=COPY_BG))

        self._center_window()

        # Drag
        self.root.bind("<ButtonPress-1>", self._drag_start)
        self.root.bind("<B1-Motion>", self._drag_move)

        if auto_close > 0:
            self.root.after(auto_close * 1000, lambda: self._close(save=True))

        if parent:
            parent.wait_window(self.root)
        else:
            self.root.mainloop()

    def _make_textbox(self, parent, fg, size, text, bold=False):
        weight = "bold" if bold else "normal"
        lines = min(4, text.count("\n") + 1)
        box = tk.Text(
            parent, bg=BG, fg=fg,
            font=("Helvetica Neue", size, weight),
            wrap="word", relief="flat", highlightthickness=0,
            borderwidth=0, cursor="arrow", width=38, height=lines,
        )
        box.insert("1.0", text)
        box.configure(state="disabled")
        return box

    def _close(self, save: bool):
        # Reset cursor before destroying to avoid a stuck hand cursor
        self.root.configure(cursor="")
        self.root.update_idletasks()
        if save and self._on_save:
            self._on_save()
        self.root.destroy()

    def _copy(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        self._copy_btn.configure(fg=COPY_DONE_FG, text="Copied ✓")
        self.root.after(1500, lambda: self._copy_btn.configure(fg=COPY_FG, text="Copy"))

    def _center_window(self):
        self.root.update_idletasks()
        w = self.root.winfo_reqwidth()
        h = self.root.winfo_reqheight()
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.root.geometry(f"+{(sw - w) // 2}+{(sh - h) // 2}")

    def _drag_start(self, e):
        self._dx, self._dy = e.x, e.y

    def _drag_move(self, e):
        self.root.geometry(
            f"+{self.root.winfo_x() + e.x - self._dx}"
            f"+{self.root.winfo_y() + e.y - self._dy}"
        )


def show_popup(original_text: str, translated_text: str,
               source_lang: str, target_lang: str,
               on_save=None, auto_close: int = 0, parent: tk.Tk = None):
    TranslationPopup(
        original_text=original_text,
        translated_text=translated_text,
        source_lang=source_lang,
        target_lang=target_lang,
        on_save=on_save,
        auto_close=auto_close,
        parent=parent,
    )
