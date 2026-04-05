# Pluck

Pluck words out of anything on your screen — subtitles, articles, images, PDFs — translate them instantly, and build a personal vocabulary that reviews itself.

Built for the hackathon theme: **"Give people time back in their day using AI."**

Instead of manually looking up words and copying them into flashcard apps, Pluck captures vocabulary passively as you encounter it. A 5-minute daily quiz is all you need.

---

## How it works

1. **Press the hotkey** (`⌘⇧'`) over any text on your screen
2. If text is highlighted, it's captured from the clipboard instantly
3. If nothing is selected, drag a region — Apple Vision OCR reads the text
4. A popup shows the translation without stealing focus from what you were doing
5. It saves automatically. Hit **Discard** to skip it
6. Open the webapp to review your words and take typed flashcard quizzes

---

## Requirements

- macOS (uses Apple Vision OCR and Quartz)
- Python 3.11+
- Node.js 18+
- Accessibility permissions for the terminal/IDE running the app
- A [DeepL API](https://www.deepl.com/pro-api) free key

---

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/Anthonyp0329/pluck-translator.git
cd pluck-translator
```

### 2. Set up the Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure

Create a `config.py` or set the following values in the existing one:

```python
DEEPL_API_KEY = "your-deepl-api-key"   # free tier works fine
HOTKEY_MODIFIERS = {"cmd", "shift"}
HOTKEY_KEY = "'"
```

Get a free DeepL API key at [deepl.com/pro-api](https://www.deepl.com/pro-api) (500,000 characters/month free).

### 4. Grant Accessibility permission

The app simulates Cmd+C to capture selected text. macOS requires Accessibility access for this.

Go to **System Settings → Privacy & Security → Accessibility** and add your terminal (e.g. Terminal, iTerm2, or VS Code).

### 5. Run the desktop app

```bash
source venv/bin/activate
python main.py
```

The app runs in the background. Press `⌘⇧'` over any text to capture a translation.

### 6. Set up the webapp

```bash
cd translate-webapp
npm install
```

Create a `.env.local` file:

```
DB_PATH=../translations.db
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse your saved words and take quizzes.

---

## Project structure

```
pluck-translator/
├── main.py          # Entry point, hotkey listener
├── ocr.py           # Apple Vision OCR + clipboard capture
├── overlay.py       # Screen region selection UI
├── popup.py         # Translation result popup
├── translator.py    # DeepL translation wrapper
├── database.py      # SQLite read/write
├── config.py        # Hotkey, API key, quiz settings
├── requirements.txt
└── translate-webapp/
    ├── app/         # Next.js App Router pages + API routes
    ├── components/  # LanguageGrid, TranslationTable, QuizClient
    └── lib/         # DB queries, constants
```

---

## Quiz system

Words appear in typed flashcard quizzes — you type the translation from memory. A word **graduates** after 3 correct answers and stops appearing in future quizzes. The progress is shown as dots on the word list.

---

## Deploying the webapp to Vercel

The webapp is built on Next.js and deploys to Vercel with one change: swap the local SQLite database for a hosted Postgres instance (e.g. [Neon](https://neon.tech)).

1. Create a Neon project and run the schema from `database.py`
2. Link it via the Vercel integration (auto-injects `DATABASE_URL`)
3. `lib/db.ts` already has the env-aware factory — it uses `@vercel/postgres` when `DATABASE_URL` is present and falls back to `better-sqlite3` locally
