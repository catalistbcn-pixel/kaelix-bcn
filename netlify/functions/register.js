// netlify/functions/register.js
// Handles reservation POST → saves to Supabase + appends to Google Sheet

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

// ── Supabase insert ──
async function insertToSupabase(data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      instagram: data.instagram,
      whatsapp: data.whatsapp,
      created_at: new Date().toISOString()
    })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase error: ${err}`)
  }
}

// ── Google Sheets JWT helper ──
// Signs a JWT using the Web Crypto API (available in Node 18+)
async function getGoogleAccessToken() {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const signingInput = `${encode(header)}.${encode(claim)}`

  // Import the RSA private key
  const keyData = GOOGLE_PRIVATE_KEY
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryKey = Buffer.from(keyData, 'base64')
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  )

  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error('Google auth failed: ' + JSON.stringify(tokenData))
  return tokenData.access_token
}

// ── Google Sheets append ──
async function appendToSheet(data) {
  const accessToken = await getGoogleAccessToken()

  const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
  const row = [timestamp, data.name, data.email, data.instagram, data.whatsapp]

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/A:E:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [row] })
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sheets error: ${err}`)
  }
}

// ── Main handler ──
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, instagram, whatsapp } = data
  if (!name || !email || !instagram || !whatsapp) {
    return { statusCode: 400, body: 'Missing required fields' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { statusCode: 400, body: 'Invalid email' }
  }

  try {
    // Run both in parallel for speed
    await Promise.all([
      insertToSupabase(data),
      appendToSheet(data)
    ])

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    }
  } catch (err) {
    console.error('Registration error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
