const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/', (req, res) => {
  res.json({ status: 'STILL server running' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript, sessionNumber, profile, numerology, history, lang } = req.body;
    const isHebrew = lang !== 'en';

    const historyText = history && history.length > 0
      ? history.map(h => `Session ${h.session}: "${h.transcript}" → thread: "${h.result?.thread}"`).join('\n')
      : '';

    const prompt = isHebrew
      ? `אתה מקשיב לאדם במסגרת מסע פנימי עמוק בשם STILL.

פרטי המשתמש:
- שם: ${profile?.name || 'לא ידוע'}
- תאריך לידה: ${profile?.birthdate || 'לא ידוע'}
- נתיב חיים (נומרולוגיה): ${numerology?.lifePath || 'לא ידוע'}
- מספר נשמה: ${numerology?.soul || 'לא ידוע'}

זה מפגש מספר ${sessionNumber} מתוך 8.

${historyText ? `היסטוריה מהמפגשים הקודמים:\n${historyText}\n` : ''}

מה שהאדם אמר במפגש זה:
"${transcript}"

המשימה שלך:
1. זהה את המילה האחת שחזרה או הייתה הכי טעונה רגשית
2. זהה רגע אחד שבו משהו השתנה
3. החזר משפט אחד שעלה מתוך דבריו

החזר JSON בלבד:
{
  "keyword": "מילה אחת",
  "moment": "תיאור קצר",
  "thread": "משפט קצה החוט"
}`
      : `You are listening to a person on a deep inner journey called STILL.

User: ${profile?.name}, born ${profile?.birthdate}, life path ${numerology?.lifePath}, soul ${numerology?.soul}

Session ${sessionNumber} of 8.
${historyText ? `Previous sessions:\n${historyText}\n` : ''}

What they said: "${transcript}"

Tasks:
1. Identify the one most emotionally charged word
2. Identify one moment something shifted
3. Return one sentence revealing their thread

CRITICAL: All values in English only.

Return JSON only:
{
  "keyword": "one word",
  "moment": "brief description",
  "thread": "thread sentence"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const clean = content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/report', async (req, res) => {
  try {
    const { profile, numerology, history, lang } = req.body;
    const isHebrew = lang !== 'en';

    const historyText = history.map(h =>
      `מפגש ${h.session} — "${h.question}"\nתשובה: "${h.transcript}"\nחוט: "${h.result?.thread}" | מילה: "${h.result?.keyword}"`
    ).join('\n\n');

    const prompt = isHebrew
      ? `אתה מסכם מסע פנימי של ${profile?.name} (נתיב חיים ${numerology?.lifePath}, נשמה ${numerology?.soul}).

שמונת המפגשים:
${historyText}

צור מפה אישית מלאה:
1. מי הוא — משפט אחד מתוך מה שאמר
2. מה מניע אותו — הרצון האמיתי שעלה
3. מה עוצר אותו — הדפוס שחזר
4. מה לשחרר — מה שהמסע גילה
5. הצעד האחד — במילותיו שלו

ואז בחר קטע אמיתי מאיגרות קודש של הרבי מליובאוויטש שמדבר ישירות לסוגיה שעלתה. הצג את הקטע בעברית ומשפט מחבר אחד.

החזר JSON בלבד:
{
  "who": "משפט",
  "drives": "משפט",
  "blocks": "משפט",
  "release": "משפט",
  "step": "משפט",
  "igrot_text": "הקטע",
  "igrot_source": "מקור",
  "igrot_connection": "משפט מחבר"
}`
      : `You are completing a STILL journey for ${profile?.name} (life path ${numerology?.lifePath}, soul ${numerology?.soul}).

Eight sessions:
${historyText}

Create a complete personal map:
1. Who they are — one sentence from what they said
2. What drives them — the real desire that emerged
3. What stops them — the recurring pattern
4. What to release — what the journey revealed
5. The one step — in their own words

Then choose a real passage from Igrot Kodesh of the Lubavitcher Rebbe that speaks directly to the main issue that emerged. Present the passage and one connecting sentence.

CRITICAL: All values in English only.

Return JSON only:
{
  "who": "sentence",
  "drives": "sentence",
  "blocks": "sentence",
  "release": "sentence",
  "step": "sentence",
  "igrot_text": "the passage",
  "igrot_source": "source",
  "igrot_connection": "connecting sentence"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const clean = content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`STILL server running on port ${PORT}`);
});