import { useState, useRef } from 'react'

const CONTENT = {
  he: {
    dir: 'rtl',
    logo_sub: 'מסע אישי — עם עצמך',
    intro_body: 'יש קול בתוכך שאתה כבר לא שומע.\nאנחנו כאן כדי לעזור לך לשמוע אותו.',
    ready: 'אני מוכן',
    before: 'לפני שמתחילים',
    register_title: 'כדי שנוכל להקשיב לך\nברמה העמוקה ביותר',
    name_label: 'שם פרטי',
    name_placeholder: 'השם שלך',
    birth_label: 'תאריך לידה',
    time_label: 'שעת לידה (אם ידוע)',
    start: 'להתחיל',
    breath_body: 'קח שלוש נשימות עמוקות.\nאנחנו לא ממהרים.',
    breath_ready: 'מוכן',
    session_of: 'מתוך',
    session_label: 'מפגש',
    hint: 'דבר בחופשיות. אין תשובה נכונה או שגויה.',
    speak: 'התחל לדבר',
    listening: '🎙 מקשיב...',
    done_speaking: 'סיימתי',
    what_came: 'מה עלה',
    analyzing: 'מקשיב לעומק...',
    keyword_label: 'המילה שעלתה',
    moment_label: 'הרגע שהשתנה',
    thread_label: 'קצה החוט',
    next: 'המפגש הבא',
    finish: 'סיום המסע',
    generating: 'מכין את המפה האישית שלך...',
    report_title: 'המפה האישית שלך',
    who_label: 'מי אתה',
    drives_label: 'מה מניע אותך',
    blocks_label: 'מה עוצר אותך',
    release_label: 'מה הגיע הזמן לשחרר',
    step_label: 'הצעד האחד',
    igrot_label: 'רמיזה',
    igrot_source_prefix: 'מתוך',
    done_body: 'קצה החוט בידיך.\nמה שתעשה איתו — זה שלך לגמרי.',
    life_path: 'נתיב חיים',
    soul: 'נשמה',
    questions: [
      "מי אתה ללא כל מה שעשית עד כה?",
      "מה אתה מגן עליו הכי חזק — ומדוע הוא צריך הגנה?",
      "מה אתה שונא באחרים — שקיים גם בך?",
      "מה היית עושה אם אף אחד לא היה רואה?",
      "תאר רגע שבו הרגשת הכי חי — לא הכי מצליח.",
      "מה אתה יודע שנכון לך — ולא עושה?",
      "מה אתה מוכן לשחרר סוף סוף?",
      "עכשיו — אחרי כל זה — מה אתה רוצה באמת?"
    ]
  },
  en: {
    dir: 'ltr',
    logo_sub: 'A personal journey — with yourself',
    intro_body: 'There is a voice inside you that you no longer hear.\nWe are here to help you listen to it.',
    ready: "I'm ready",
    before: 'Before we begin',
    register_title: 'So we can listen to you\nat the deepest level',
    name_label: 'First name',
    name_placeholder: 'Your name',
    birth_label: 'Date of birth',
    time_label: 'Time of birth (if known)',
    start: 'Begin',
    breath_body: 'Take three deep breaths.\nWe are not in a hurry.',
    breath_ready: 'Ready',
    session_of: 'of',
    session_label: 'Session',
    hint: 'Speak freely. There is no right or wrong answer.',
    speak: 'Start speaking',
    listening: '🎙 Listening...',
    done_speaking: 'Done',
    what_came: 'What came up',
    analyzing: 'Listening deeply...',
    keyword_label: 'The word that arose',
    moment_label: 'The moment that shifted',
    thread_label: 'The thread',
    next: 'Next session',
    finish: 'Complete the journey',
    generating: 'Preparing your personal map...',
    report_title: 'Your Personal Map',
    who_label: 'Who you are',
    drives_label: 'What drives you',
    blocks_label: 'What stops you',
    release_label: 'What is time to release',
    step_label: 'The one step',
    igrot_label: 'A hint',
    igrot_source_prefix: 'From',
    done_body: 'The thread is in your hands.\nWhat you do with it — is entirely yours.',
    life_path: 'Life path',
    soul: 'Soul',
    questions: [
      "Who are you without everything you have done so far?",
      "What do you protect most fiercely — and why does it need protection?",
      "What do you dislike in others — that also exists in you?",
      "What would you do if no one was watching?",
      "Describe a moment when you felt most alive — not most successful.",
      "What do you know is right for you — that you are not doing?",
      "What are you finally ready to let go of?",
      "Now — after all of this — what do you truly want?"
    ]
  }
}

function calcNumerology(birthdate, name) {
  const digits = birthdate.replace(/\D/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0)
  }
  const nameVal = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  let soul = nameVal % 9 || 9
  return { lifePath: sum, soul }
}

export default function App() {
  const [lang, setLang] = useState(null)
  const [screen, setScreen] = useState('intro')
  const [profile, setProfile] = useState({ name: '', birthdate: '', birthtime: '' })
  const [numerology, setNumerology] = useState(null)
  const [session, setSession] = useState(0)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [report, setReport] = useState(null)
  const recognitionRef = useRef(null)

  const t = lang ? CONTENT[lang] : CONTENT.he

  const startJourney = () => {
    if (!profile.name || !profile.birthdate) return
    const num = calcNumerology(profile.birthdate, profile.name)
    setNumerology(num)
    setScreen('breath')
  }

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Please use Chrome'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'en' ? 'en-US' : 'he-IL'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setTranscript(text)
    }
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setRecording(false)
  }

  const analyze = async () => {
    if (!transcript) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, sessionNumber: session + 1, profile, numerology, history, lang })
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.result)
        setHistory(h => [...h, { session: session + 1, question: t.questions[session], transcript, result: data.result }])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const nextSession = () => {
    if (session < t.questions.length - 1) {
      setSession(s => s + 1)
      setTranscript('')
      setResult(null)
      setScreen('question')
    } else {
      generateReport()
    }
  }

  const generateReport = async () => {
    setScreen('generating')
    try {
      const res = await fetch('http://localhost:3001/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, numerology, history, lang })
      })
      const data = await res.json()
      if (data.success) {
        setReport(data.result)
        setScreen('report')
      }
    } catch (e) {
      console.error(e)
      setScreen('done')
    }
  }

  if (!lang) return (
    <div style={s.page}>
      <div style={s.center}>
        <div style={s.logo}>STILL<span style={s.dot}>●</span></div>
        <p style={{...s.sub, marginBottom:'3rem'}}>Choose your language / בחר שפה</p>
        <div style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
          <button style={s.langBtn} onClick={() => setLang('he')}>עברית</button>
          <button style={s.langBtn} onClick={() => setLang('en')}>English</button>
        </div>
      </div>
    </div>
  )

  if (screen === 'intro') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.center}>
        <div style={s.logo}>STILL<span style={s.dot}>●</span></div>
        <p style={s.sub}>{t.logo_sub}</p>
        <p style={s.body}>{t.intro_body.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}</p>
        <button style={s.btn} onClick={() => setScreen('register')}>{t.ready}</button>
      </div>
    </div>
  )

  if (screen === 'register') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.center}>
        <span style={s.eyebrow}>{t.before}</span>
        <h2 style={s.question}>{t.register_title.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}</h2>
        <div style={s.field}>
          <label style={s.label}>{t.name_label}</label>
          <input style={s.input} value={profile.name}
            onChange={e => setProfile(p => ({...p, name: e.target.value}))}
            placeholder={t.name_placeholder} />
        </div>
        <div style={s.field}>
          <label style={s.label}>{t.birth_label}</label>
          <input style={s.input} value={profile.birthdate} type="date"
            onChange={e => setProfile(p => ({...p, birthdate: e.target.value}))} />
        </div>
        <div style={s.field}>
          <label style={s.label}>{t.time_label}</label>
          <input style={s.input} value={profile.birthtime} type="time"
            onChange={e => setProfile(p => ({...p, birthtime: e.target.value}))} />
        </div>
        <button style={s.btn} onClick={startJourney}>{t.start}</button>
      </div>
    </div>
  )

  if (screen === 'breath') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.center}>
        <p style={s.greeting}>{lang === 'he' ? `שלום, ${profile.name}` : `Hello, ${profile.name}`}</p>
        <div style={s.ring}></div>
        <p style={s.body}>{t.breath_body.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}</p>
        <button style={s.btn} onClick={() => setScreen('question')}>{t.breath_ready}</button>
      </div>
    </div>
  )

  if (screen === 'question') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.wrap}>
        <span style={s.eyebrow}>{t.session_label} {session + 1} {t.session_of} 8</span>
        <h2 style={s.question}>{t.questions[session]}</h2>
        <p style={s.hint}>{t.hint}</p>
        {!recording && !transcript && (
          <button style={s.btn} onClick={startRecording}>{t.speak}</button>
        )}
        {recording && (
          <div>
            <div style={s.pulse}>{t.listening}</div>
            <button style={{...s.btn, borderColor:'#c0392b', color:'#c0392b'}} onClick={stopRecording}>{t.done_speaking}</button>
          </div>
        )}
        {transcript && !recording && !result && (
          <div>
            <p style={s.transcript}>"{transcript}"</p>
            {loading ? <p style={s.hint}>{t.analyzing}</p>
              : <button style={s.btn} onClick={analyze}>{t.what_came}</button>}
          </div>
        )}
        {result && (
          <div style={s.result}>
            <div style={s.resultItem}>
              <span style={s.labelGold}>{t.keyword_label}</span>
              <span style={s.value}>{result.keyword}</span>
            </div>
            <div style={s.resultItem}>
              <span style={s.labelGold}>{t.moment_label}</span>
              <span style={s.value}>{result.moment}</span>
            </div>
            <div style={s.thread}>
              <span style={s.labelGold}>{t.thread_label}</span>
              <p style={s.threadText}>{result.thread}</p>
            </div>
            <button style={s.btn} onClick={nextSession}>
              {session < 7 ? t.next : t.finish}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (screen === 'generating') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.center}>
        <div style={s.ring}></div>
        <p style={s.body}>{t.generating}</p>
      </div>
    </div>
  )

  if (screen === 'report' && report) return (
    <div style={s.page} dir={t.dir}>
      <div style={s.wrap}>
        <div style={s.logo}>STILL<span style={s.dot}>●</span></div>
        <h2 style={{...s.question, marginTop:'1.5rem'}}>{t.report_title}, {profile.name}.</h2>
        {numerology && (
          <p style={{...s.hint, marginBottom:'2.5rem'}}>
            {t.life_path} {numerology.lifePath} · {t.soul} {numerology.soul}
          </p>
        )}

        <div style={s.reportSection}>
          <span style={s.labelGold}>{t.who_label}</span>
          <p style={s.reportText}>{report.who}</p>
        </div>
        <div style={s.reportSection}>
          <span style={s.labelGold}>{t.drives_label}</span>
          <p style={s.reportText}>{report.drives}</p>
        </div>
        <div style={s.reportSection}>
          <span style={s.labelGold}>{t.blocks_label}</span>
          <p style={s.reportText}>{report.blocks}</p>
        </div>
        <div style={s.reportSection}>
          <span style={s.labelGold}>{t.release_label}</span>
          <p style={s.reportText}>{report.release}</p>
        </div>
        <div style={{...s.reportSection, borderBottom:'none'}}>
          <span style={s.labelGold}>{t.step_label}</span>
          <p style={s.threadText}>{report.step}</p>
        </div>

        {report.igrot_text && (
          <div style={s.igrot}>
            <span style={s.labelGold}>{t.igrot_label}</span>
            <p style={s.igrotSource}>{t.igrot_source_prefix} {report.igrot_source}</p>
            <p style={s.igrotText}>{report.igrot_text}</p>
            <p style={s.igrotConnection}>{report.igrot_connection}</p>
          </div>
        )}

        <p style={{...s.hint, marginTop:'3rem', textAlign:'center'}}>
          {t.done_body.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}
        </p>
      </div>
    </div>
  )

  if (screen === 'done') return (
    <div style={s.page} dir={t.dir}>
      <div style={s.center}>
        <div style={s.logo}>STILL<span style={s.dot}>●</span></div>
        <h2 style={s.question}>{lang === 'he' ? 'המסע הושלם' : 'The journey is complete'}, {profile.name}.</h2>
        <p style={s.body}>{t.done_body.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' },
  center: { textAlign:'center', padding:'2rem', maxWidth:'500px', width:'100%' },
  wrap: { padding:'2rem 2rem 4rem', maxWidth:'620px', margin:'0 auto', width:'100%' },
  logo: { fontSize:'3rem', fontWeight:900, color:'white', letterSpacing:'0.3em' },
  dot: { color:'#b8975a', fontSize:'0.4em', verticalAlign:'middle' },
  sub: { color:'#7a6338', fontSize:'0.8rem', letterSpacing:'0.2em', textTransform:'uppercase', margin:'0.5rem 0 2rem' },
  body: { color:'#6e6860', fontSize:'1rem', lineHeight:1.9, marginBottom:'2.5rem' },
  greeting: { color:'#b8975a', fontSize:'1rem', letterSpacing:'0.1em', marginBottom:'2rem' },
  btn: { padding:'1rem 3rem', border:'1px solid #b8975a', background:'transparent', color:'#b8975a', fontSize:'0.9rem', letterSpacing:'0.15em', cursor:'pointer', marginTop:'1.5rem' },
  langBtn: { padding:'0.9rem 2.5rem', border:'1px solid #b8975a', background:'transparent', color:'#b8975a', fontSize:'1rem', letterSpacing:'0.1em', cursor:'pointer' },
  ring: { width:'80px', height:'80px', borderRadius:'50%', border:'1px solid #7a6338', margin:'0 auto 3rem', opacity:0.7 },
  eyebrow: { display:'block', fontSize:'0.7rem', letterSpacing:'0.25em', color:'#b8975a', textTransform:'uppercase', marginBottom:'1.5rem' },
  question: { fontFamily:'serif', fontSize:'1.6rem', fontWeight:400, color:'white', lineHeight:1.5, marginBottom:'1.5rem' },
  hint: { color:'#6e6860', fontSize:'0.85rem', marginBottom:'2rem' },
  pulse: { color:'#b8975a', fontSize:'1.2rem', margin:'1rem 0', letterSpacing:'0.1em' },
  transcript: { color:'rgba(240,237,232,0.6)', fontStyle:'italic', fontSize:'0.95rem', lineHeight:1.8, margin:'1.5rem 0', borderRight:'2px solid #7a6338', paddingRight:'1rem' },
  result: { marginTop:'2rem', textAlign:'right' },
  resultItem: { borderBottom:'1px solid rgba(184,151,90,0.15)', padding:'1rem 0', display:'flex', flexDirection:'column', gap:'0.3rem' },
  labelGold: { fontSize:'0.7rem', letterSpacing:'0.2em', color:'#b8975a', textTransform:'uppercase', display:'block', marginBottom:'0.5rem' },
  label: { fontSize:'0.75rem', letterSpacing:'0.15em', color:'#b8975a', display:'block', marginBottom:'0.4rem' },
  value: { color:'white', fontSize:'1rem' },
  thread: { padding:'1.5rem 0', marginBottom:'2rem' },
  threadText: { color:'rgba(240,237,232,0.9)', fontSize:'1.15rem', fontFamily:'serif', lineHeight:1.7, marginTop:'0.5rem' },
  field: { marginBottom:'1.2rem', textAlign:'right' },
  input: { width:'100%', background:'transparent', border:'1px solid #3a3228', padding:'0.8rem 1rem', color:'white', fontSize:'1rem', fontFamily:'sans-serif', direction:'rtl', outline:'none', marginTop:'0.4rem' },
  reportSection: { borderBottom:'1px solid rgba(184,151,90,0.12)', padding:'1.5rem 0' },
  reportText: { color:'rgba(240,237,232,0.8)', fontSize:'1rem', lineHeight:1.8, marginTop:'0.3rem' },
  igrot: { marginTop:'3rem', padding:'2rem', border:'1px solid rgba(184,151,90,0.2)', background:'rgba(184,151,90,0.04)' },
  igrotSource: { color:'#7a6338', fontSize:'0.75rem', letterSpacing:'0.1em', marginBottom:'1rem' },
  igrotText: { color:'rgba(240,237,232,0.75)', fontSize:'1rem', fontFamily:'serif', lineHeight:1.8, marginBottom:'1.5rem', fontStyle:'italic' },
  igrotConnection: { color:'#b8975a', fontSize:'0.9rem', lineHeight:1.7 }
}