// netlify/functions/register.js
// CommonJS format for maximum Netlify compatibility

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_SHEET_ID = (process.env.GOOGLE_SHEET_ID || '').trim()
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

function getPrivateKey() {
  const raw = process.env.GOOGLE_PRIVATE_KEY || ''
  return raw.replace(/\\n/g, '\n').trim()
}

async function insertToSupabase(data) {
  const url = SUPABASE_URL + '/rest/v1/reservations'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
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
    throw new Error('Supabase error: ' + err)
  }
}

async function getGoogleAccessToken() {
  const privateKey = getPrivateKey()

  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const now = Math.floor(Date.now() / 1000)
  const payload = btoa(JSON.stringify({
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const signingInput = header + '.' + payload

  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '')

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

  const sig = Buffer.from(signature).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const jwt = signingInput + '.' + sig

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
  })

  const tokenData = await tokenRes.json()
  console.log('Token status:', tokenRes.status, 'has_token:', !!tokenData.access_token)
  if (!tokenData.access_token) throw new Error('Google auth failed: ' + JSON.stringify(tokenData))
  return tokenData.access_token
}

async function appendToSheet(data) {
  const accessToken = await getGoogleAccessToken()
  const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
  const row = [timestamp, data.name, data.email, data.instagram, data.whatsapp]

  // Build URL by concatenation only — no template literals
  const sheetsBase = 'https://sheets.googleapis.com'
  const sheetsPath = '/v4/spreadsheets/' + GOOGLE_SHEET_ID + '/values/A%3AE/append'
  const sheetsQuery = '?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS'
  const sheetsURL = sheetsBase + sheetsPath + sheetsQuery

  console.log('Calling Sheets URL:', sheetsURL)
  console.log('Sheet ID used:', GOOGLE_SHEET_ID)

  const res = await fetch(sheetsURL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  })

  console.log('Sheets response status:', res.status)
  if (!res.ok) {
    const err = await res.text()
    throw new Error('Sheets error: ' + err)
  }
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch(e) {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, instagram, whatsapp } = data
  if (!name || !email || !instagram || !whatsapp) {
    return { statusCode: 400, body: 'Missing required fields' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: 'Invalid email' }
  }

  try {
    await Promise.all([
      insertToSupabase(data),
      appendToSheet(data)
    ])
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    }
  } catch(err) {
    console.error('Registration error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
