import { useState, useEffect } from 'react'
import './App.css'

const TRANSLATIONS = {
  es: {
    lang: 'EN',
    tagline: 'EVENTO PRIVADO · SOLO CON RESERVA',
    date: 'Viernes 27 de Marzo',
    time: '16:00 — 23:00',
    location: 'Barcelona',
    newCatalog: 'NUEVO CATÁLOGO',
    description: [
      'Durante la velada podrás conocer artistas, descubrir obras en vivo y dejarte envolver por una atmósfera cuidada al detalle, entre colores, sensaciones y encuentros que inspiran.',
      'La experiencia contará con la presencia musical de DJ Juampis (Colombia), acompañada por una puesta en escena artística con body paint y danza de fuego a cargo de Bicho Mulher, creando una fusión vibrante entre arte visual, performance y energía.',
      'También podrás disfrutar de artistas pintando en directo, entre ellos Brukin, Free Birds y Urco, además de una bienvenida especial con arte de distintas partes del mundo.',
      'A lo largo del evento habrá un espacio pensado para el encuentro entre artistas, coleccionistas, fotógrafos y amantes del arte, así como venta de obras y convocatoria para el nuevo catálogo.',
      'Como parte de la experiencia, al final del evento se realizará la entrega de la obra rifada al número ganador. Quienes lo deseen podrán participar ese mismo día: cada número tiene un valor de 5 €, para una obra valorada en 800 €.',
      'La velada se completa con cócteles, cava y un ambiente selecto, diseñado para inspirar, compartir y crear nuevas oportunidades y conexiones.'
    ],
    highlights: [
      { icon: '♪', label: 'DJ Juampis (Colombia)' },
      { icon: '◈', label: 'Body Paint & Danza de Fuego — Bicho Mulher' },
      { icon: '◉', label: 'Arte en Vivo — Brukin, Free Birds & Urco' },
      { icon: '◇', label: 'Venta de Obras & Rifa (800 €)' },
      { icon: '◈', label: 'Cócteles & Cava' },
    ],
    formTitle: 'Reserva tu lugar',
    formSubtitle: 'Acceso exclusivo mediante reserva previa',
    name: 'Nombre completo',
    namePh: 'Tu nombre',
    email: 'Correo electrónico',
    emailPh: 'tu@email.com',
    instagram: 'Instagram',
    instagramPh: '@tuusuario',
    whatsapp: 'WhatsApp',
    whatsappPh: '+34 600 000 000',
    submit: 'Confirmar reserva',
    submitting: 'Enviando...',
    successTitle: '¡Reserva confirmada!',
    successMsg: 'Tu lugar está reservado. Nos vemos el viernes 27 de marzo. Hasta pronto.',
    errorMsg: 'Algo salió mal. Por favor inténtalo de nuevo.',
    required: 'Este campo es obligatorio',
    invalidEmail: 'Introduce un email válido',
    partners: 'Con el apoyo de',
    footer: 'Kaelix — Agencia de Arte · Barcelona',
  },
  en: {
    lang: 'ES',
    tagline: 'PRIVATE EVENT · BY RESERVATION ONLY',
    date: 'Friday, March 27th',
    time: '4:00 PM — 11:00 PM',
    location: 'Barcelona',
    newCatalog: 'NEW CATALOG',
    description: [
      'During the evening you will meet artists, discover live works and immerse yourself in a carefully crafted atmosphere filled with colour, sensation and inspiring encounters.',
      'The experience will feature the musical presence of DJ Juampis (Colombia), accompanied by an artistic showcase including body paint and fire dance by Bicho Mulher — a vibrant fusion of visual art, performance and energy.',
      'You will also enjoy artists painting live, including Brukin, Free Birds and Urco, plus a special welcome featuring art from around the world.',
      'Throughout the event there will be a dedicated space for encounters between artists, collectors, photographers and art lovers, as well as artwork sales and an open call for the new catalogue.',
      'As part of the experience, the raffle artwork will be awarded to the winning number at the end of the evening. Those who wish may participate on the day: each number is 5 €, for a work valued at 800 €.',
      'The evening is completed with cocktails, cava and a select atmosphere, designed to inspire, share and create new opportunities and connections.'
    ],
    highlights: [
      { icon: '♪', label: 'DJ Juampis (Colombia)' },
      { icon: '◈', label: 'Body Paint & Fire Dance — Bicho Mulher' },
      { icon: '◉', label: 'Live Art — Brukin, Free Birds & Urco' },
      { icon: '◇', label: 'Artwork Sales & Raffle (800 €)' },
      { icon: '◈', label: 'Cocktails & Cava' },
    ],
    formTitle: 'Reserve your place',
    formSubtitle: 'Exclusive access by prior reservation',
    name: 'Full name',
    namePh: 'Your name',
    email: 'Email address',
    emailPh: 'you@email.com',
    instagram: 'Instagram',
    instagramPh: '@yourusername',
    whatsapp: 'WhatsApp',
    whatsappPh: '+34 600 000 000',
    submit: 'Confirm reservation',
    submitting: 'Sending...',
    successTitle: 'Reservation confirmed!',
    successMsg: 'Your place is reserved. See you on Friday, March 27th. Until then.',
    errorMsg: 'Something went wrong. Please try again.',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    partners: 'Supported by',
    footer: 'Kaelix — Art Agency · Barcelona',
  }
}

const PARTNERS = [
  'Kaelix', 'Vida', 'Molotow Barcelona', 'ZohArt Gallery', 'Catalist BCN', 'Vidal Pons', 'Arco TCG'
]

export default function App() {
  const [lang, setLang] = useState('es')
  const [form, setForm] = useState({ name: '', email: '', instagram: '', whatsapp: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [mounted, setMounted] = useState(false)

  const t = TRANSLATIONS[lang]

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = t.required
    if (!form.email.trim()) e.email = t.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invalidEmail
    if (!form.instagram.trim()) e.instagram = t.required
    if (!form.whatsapp.trim()) e.whatsapp = t.required
    return e
  }

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }))
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setStatus('submitting')
    try {
      const res = await fetch('/.netlify/functions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Server error')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`page ${mounted ? 'mounted' : ''}`}>

      {/* ── LANGUAGE TOGGLE ── */}
      <button className="lang-toggle" onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}>
        {t.lang}
      </button>

      {/* ── HERO ── */}
      <header className="hero">
        <div className="hero-ornament top" />
        <p className="tagline">{t.tagline}</p>
        <div className="title-block">
          <h1 className="title-main">EXPOSICIÓN</h1>
          <h1 className="title-brand">KAELIX <span className="title-bcn">BCN</span></h1>
        </div>
        <div className="hero-meta">
          <span className="hero-date">{t.date}</span>
          <span className="hero-sep">·</span>
          <span className="hero-time">{t.time}</span>
          <span className="hero-sep">·</span>
          <span className="hero-loc">{t.location}</span>
        </div>
        <div className="catalog-badge">{t.newCatalog}</div>
        <div className="hero-ornament bottom" />
      </header>

      {/* ── DESCRIPTION ── */}
      <section className="description">
        <div className="desc-rule" />
        {t.description.map((p, i) => (
          <p key={i} className="desc-para">{p}</p>
        ))}
        <div className="desc-rule" />
      </section>

      {/* ── HIGHLIGHTS ── */}
      <section className="highlights">
        {t.highlights.map((h, i) => (
          <div key={i} className="highlight-item">
            <span className="h-icon">{h.icon}</span>
            <span className="h-label">{h.label}</span>
          </div>
        ))}
      </section>

      {/* ── FORM ── */}
      <section className="form-section" id="reserva">
        <div className="form-header">
          <div className="form-rule" />
          <h2 className="form-title">{t.formTitle}</h2>
          <p className="form-subtitle">{t.formSubtitle}</p>
        </div>

        {status === 'success' ? (
          <div className="success-card">
            <div className="success-icon">✦</div>
            <h3 className="success-title">{t.successTitle}</h3>
            <p className="success-msg">{t.successMsg}</p>
          </div>
        ) : (
          <div className="form-card">
            <Field label={t.name} error={errors.name}>
              <input
                type="text"
                placeholder={t.namePh}
                value={form.name}
                onChange={handleChange('name')}
                className={errors.name ? 'has-error' : ''}
              />
            </Field>
            <Field label={t.email} error={errors.email}>
              <input
                type="email"
                placeholder={t.emailPh}
                value={form.email}
                onChange={handleChange('email')}
                className={errors.email ? 'has-error' : ''}
              />
            </Field>
            <div className="form-row">
              <Field label={t.instagram} error={errors.instagram}>
                <input
                  type="text"
                  placeholder={t.instagramPh}
                  value={form.instagram}
                  onChange={handleChange('instagram')}
                  className={errors.instagram ? 'has-error' : ''}
                />
              </Field>
              <Field label={t.whatsapp} error={errors.whatsapp}>
                <input
                  type="tel"
                  placeholder={t.whatsappPh}
                  value={form.whatsapp}
                  onChange={handleChange('whatsapp')}
                  className={errors.whatsapp ? 'has-error' : ''}
                />
              </Field>
            </div>

            {status === 'error' && (
              <p className="error-banner">{t.errorMsg}</p>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? t.submitting : t.submit}
            </button>
          </div>
        )}
      </section>

      {/* ── PARTNERS ── */}
      <section className="partners">
        <p className="partners-label">{t.partners}</p>
        <div className="partners-list">
          {PARTNERS.map((p, i) => (
            <span key={i} className="partner-name">{p}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-rule" />
        <p className="footer-text">{t.footer}</p>
      </footer>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
