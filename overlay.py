"""Fullscreen overlay for selecting a screen region."""
import tkinter as tk
from PIL import ImageGrab, Image


class RegionSelector:
    """
    Dims the screen and lets the user drag a selection rectangle.
    Returns a PIL Image of the selected region, or None if cancelled.
    """

    def __init__(self):
        self._start = None
        self._rect_id = None
        self._selected_image = None

    def select(self, parent: tk.Tk = None) -> Image.Image | None:
        # Grab screenshot before showing overlay
        screenshot = ImageGrab.grab()

        # Use Toplevel so we stay in the same Space (avoids Mission Control switch).
        # Manually set geometry to cover the full screen instead of -fullscreen.
        self._root = tk.Toplevel(parent) if parent else tk.Tk()
        self._root.overrideredirect(True)
        sw = self._root.winfo_screenwidth()
        sh = self._root.winfo_screenheight()
        self._root.geometry(f"{sw}x{sh}+0+0")
        self._root.attributes("-alpha", 0.35)
        self._root.configure(bg="black")

        self._root.lift()
        self._root.focus_force()
        try:
            self._root.attributes("-topmost", True)
        except Exception:
            pass

        self._canvas = tk.Canvas(
            self._root,
            cursor="crosshair",
            bg="black",
            highlightthickness=0,
        )
        self._canvas.pack(fill="both", expand=True)

        self._canvas.create_text(
            sw // 2,
            40,
            text="Drag to select region  •  Click to cancel",
            fill="white",
            font=("Helvetica", 16),
        )

        # On Retina displays the screenshot is at physical resolution but
        # mouse events use logical pixels — compute the scale factor once.
        self._scale_x = screenshot.width / sw
        self._scale_y = screenshot.height / sh

        self._screenshot = screenshot
        self._canvas.bind("<ButtonPress-1>", self._on_press)
        self._canvas.bind("<B1-Motion>", self._on_drag)
        self._canvas.bind("<ButtonRelease-1>", self._on_release)
        self._root.bind("<Escape>", self._on_cancel)

        if parent:
            parent.wait_window(self._root)
        else:
            self._root.mainloop()
        return self._selected_image

    def _on_press(self, event):
        self._start = (event.x, event.y)
        if self._rect_id:
            self._canvas.delete(self._rect_id)

    def _on_drag(self, event):
        if not self._start:
            return
        if self._rect_id:
            self._canvas.delete(self._rect_id)
        x0, y0 = self._start
        self._rect_id = self._canvas.create_rectangle(
            x0, y0, event.x, event.y,
            outline="#4fc3f7",
            width=2,
            fill="#4fc3f7",
            stipple="gray25",
        )

    def _on_release(self, event):
        if not self._start:
            return
        x0, y0 = self._start
        x1, y1 = event.x, event.y

        left = min(x0, x1)
        top = min(y0, y1)
        right = max(x0, x1)
        bottom = max(y0, y1)

        if right - left < 5 or bottom - top < 5:
            self._root.destroy()
            return

        self._selected_image = self._screenshot.crop((
            int(left * self._scale_x),
            int(top * self._scale_y),
            int(right * self._scale_x),
            int(bottom * self._scale_y),
        ))
        self._root.destroy()

    def _on_cancel(self, event):
        self._root.destroy()


def capture_region(parent: tk.Tk = None) -> Image.Image | None:
    selector = RegionSelector()
    return selector.select(parent)
