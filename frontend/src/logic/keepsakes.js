// Things you take away from HALFBUILT: a city deed (your account and buildings
// as a small file, to move to another browser) and a postcard of one building.

const DEED_KIND = 'halfbuilt-city-deed'

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'building'

// ---------- City deed ----------

export function exportDeed({ users, projects, events }, userId) {
  const user = users.find((u) => u.id === userId)
  if (!user) return
  const deed = {
    kind: DEED_KIND,
    version: 1,
    savedOn: new Date().toISOString(),
    user,
    projects: projects.filter((p) => p.ownerId === userId),
    events: events.filter((e) => e.userId === userId),
  }
  download(new Blob([JSON.stringify(deed, null, 2)], { type: 'application/json' }), `${user.username}-city-deed.json`)
}

// Returns { ok, deed } or { ok: false, error }
export async function readDeed(file) {
  try {
    const deed = JSON.parse(await file.text())
    if (deed?.kind !== DEED_KIND || !deed.user?.id || !Array.isArray(deed.projects)) {
      return { ok: false, error: 'That file is not a HALFBUILT city deed.' }
    }
    return { ok: true, deed: { ...deed, events: Array.isArray(deed.events) ? deed.events : [] } }
  } catch {
    return { ok: false, error: 'We could not read that file. Try saving the deed again.' }
  }
}

// ---------- Building postcard ----------

const PAINT_ATTRS = ['fill', 'stroke', 'stop-color', 'stop-opacity', 'opacity', 'fill-opacity', 'stroke-opacity']

// CSS variables do not exist inside a standalone image, so copy the resolved colours in.
function bakeSvg(svg, width) {
  const clone = svg.cloneNode(true)
  const from = [svg, ...svg.querySelectorAll('*')]
  const to = [clone, ...clone.querySelectorAll('*')]
  from.forEach((el, i) => {
    const css = getComputedStyle(el)
    for (const attr of PAINT_ATTRS) {
      const v = el.getAttribute(attr)
      if (v && v.includes('var(')) to[i].setAttribute(attr, css.getPropertyValue(attr))
    }
    const style = el.getAttribute('style')
    if (style && style.includes('var(')) {
      for (const prop of el.style) to[i].style.setProperty(prop, css.getPropertyValue(prop))
    }
  })
  const [, , vw, vh] = svg.getAttribute('viewBox').split(/\s+/).map(Number)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', width)
  clone.setAttribute('height', Math.round((width * vh) / vw))
  clone.removeAttribute('class')
  return { xml: new XMLSerializer().serializeToString(clone), ratio: vh / vw }
}

function loadImage(xml) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => { resolve(img); URL.revokeObjectURL(url) }
    img.onerror = reject
    img.src = url
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// lines: { name, status, score, floors } already worded for the card
export async function saveBuildingPostcard(svg, { name, status, score, floors }) {
  const W = 1080
  const H = 1350
  // always the light palette, so the card reads the same whatever theme it was saved in
  const ink = '#1f1e1f'
  const paper = '#f7f7f3'
  const frame = getComputedStyle(svg.closest('[data-postcard-frame]') ?? document.documentElement)
  const skyTop = frame.getPropertyValue('--sky-top').trim() || '#ffffff'
  const skyBottom = frame.getPropertyValue('--sky-bottom').trim() || '#eef3f8'
  const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", sans-serif'

  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H })
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, W, H)

  // sky card
  const pad = 60
  const cardH = 860
  roundRect(ctx, pad, pad + 70, W - pad * 2, cardH, 44)
  const sky = ctx.createLinearGradient(0, pad + 70, 0, pad + 70 + cardH)
  sky.addColorStop(0, skyTop)
  sky.addColorStop(1, skyBottom)
  ctx.fillStyle = sky
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = ink
  ctx.stroke()

  // building
  const { xml, ratio } = bakeSvg(svg, 900)
  const img = await loadImage(xml)
  const maxW = W - pad * 2 - 120
  const maxH = cardH - 100
  const bw = Math.min(maxW, maxH / ratio)
  const bh = bw * ratio
  ctx.drawImage(img, (W - bw) / 2, pad + 70 + cardH - bh - 40, bw, bh)

  // words
  ctx.fillStyle = ink
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 30px ${font}`
  ctx.fillText('HALF', pad, pad + 34)
  const half = ctx.measureText('HALF').width
  ctx.globalAlpha = 0.45
  ctx.fillText('BUILT', pad + half, pad + 34)
  ctx.globalAlpha = 1
  ctx.textAlign = 'right'
  ctx.font = `500 26px ${font}`
  ctx.fillText(status.toUpperCase(), W - pad, pad + 34)
  ctx.textAlign = 'left'

  const textTop = pad + 70 + cardH + 90
  ctx.font = `700 64px ${font}`
  let title = name
  while (ctx.measureText(title).width > W - pad * 2 - (score != null ? 220 : 0) && title.length > 4) title = `${title.slice(0, -2)}…`
  ctx.fillText(title, pad, textTop)
  ctx.font = `400 32px ${font}`
  ctx.globalAlpha = 0.65
  ctx.fillText(floors, pad, textTop + 56)
  ctx.fillText('Bring it back at HALFBUILT', pad, textTop + 104)
  ctx.globalAlpha = 1

  if (score != null) {
    const cx = W - pad - 90
    const cy = textTop - 10
    ctx.lineWidth = 14
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.15
    ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.stroke()
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#f5b942'
    ctx.beginPath(); ctx.arc(cx, cy, 80, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100); ctx.stroke()
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.font = `700 56px ${font}`
    ctx.fillText(String(score), cx, cy + 18)
    ctx.font = `500 20px ${font}`
    ctx.globalAlpha = 0.6
    ctx.fillText('REVIVAL', cx, cy + 128)
    ctx.globalAlpha = 1
    ctx.textAlign = 'left'
  }

  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'))
  download(blob, `${slug(name)}-postcard.png`)
}
