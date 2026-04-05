"""Web app for viewing and quizzing saved translations."""
from flask import Flask, render_template, jsonify, request, redirect, url_for
from database import get_connection, delete_translation, init_db

app = Flask(__name__)

QUIZ_THRESHOLD = 3   # correct answers needed to graduate a word
QUIZ_SIZE = 5        # cards shown per session

LANG_NAMES = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'ru': 'Russian',
    'zh': 'Chinese', 'zh-Hans': 'Chinese (Simplified)',
    'zh-Hant': 'Chinese (Traditional)', 'ja': 'Japanese', 'ko': 'Korean',
    'ar': 'Arabic', 'hi': 'Hindi', 'tr': 'Turkish', 'pl': 'Polish',
    'sv': 'Swedish', 'da': 'Danish', 'fi': 'Finnish', 'no': 'Norwegian',
    'cs': 'Czech', 'ro': 'Romanian', 'uk': 'Ukrainian', 'vi': 'Vietnamese',
}

app.jinja_env.globals['lang_name'] = lambda c: LANG_NAMES.get(c, c.upper())


@app.route('/')
def home():
    with get_connection() as conn:
        rows = conn.execute('''
            SELECT source_language,
                   COUNT(*) AS total,
                   SUM(CASE WHEN quiz_correct >= ? THEN 1 ELSE 0 END) AS learned
            FROM translations
            GROUP BY source_language
            ORDER BY total DESC
        ''', (QUIZ_THRESHOLD,)).fetchall()
    return render_template('home.html', languages=[dict(r) for r in rows],
                           threshold=QUIZ_THRESHOLD)


@app.route('/language/<lang>')
def language_view(lang):
    with get_connection() as conn:
        rows = conn.execute(
            'SELECT * FROM translations WHERE source_language = ? ORDER BY created_at DESC',
            (lang,)
        ).fetchall()
    return render_template('language.html', lang=lang,
                           translations=[dict(r) for r in rows],
                           threshold=QUIZ_THRESHOLD)


@app.route('/translations/<int:tid>', methods=['DELETE'])
def delete_route(tid):
    delete_translation(tid)
    return jsonify({'ok': True})


@app.route('/quiz/<lang>')
def quiz(lang):
    with get_connection() as conn:
        rows = conn.execute('''
            SELECT * FROM translations
            WHERE source_language = ? AND quiz_correct < ?
            ORDER BY quiz_correct ASC, RANDOM()
            LIMIT ?
        ''', (lang, QUIZ_THRESHOLD, QUIZ_SIZE)).fetchall()
    items = [dict(r) for r in rows]
    if not items:
        return redirect(url_for('language_view', lang=lang))
    return render_template('quiz.html', lang=lang, items=items,
                           threshold=QUIZ_THRESHOLD)


@app.route('/quiz/answer', methods=['POST'])
def quiz_answer():
    data = request.get_json()
    if data.get('correct'):
        with get_connection() as conn:
            conn.execute(
                'UPDATE translations SET quiz_correct = MIN(quiz_correct + 1, ?) WHERE id = ?',
                (QUIZ_THRESHOLD, data['id'])
            )
            conn.commit()
    return jsonify({'ok': True})


if __name__ == '__main__':
    init_db()
    print("Starting webapp at http://localhost:5001")
    app.run(debug=False, port=5001)
