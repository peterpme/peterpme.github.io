const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const React = require("react")
const sharp = require("sharp")
const { Resvg } = require("@resvg/resvg-js")
const satoriModule = require("satori")

const TEMPLATE_VERSION = 1
const OG_CACHE = path.join(process.cwd(), "node_modules", ".astro", "og-cache")

const WIDTH = 1200
const HEIGHT = 630
const PADDING = 72
const INNER_W = WIDTH - PADDING * 2
const INNER_H = HEIGHT - PADDING * 2
const AVATAR = 88
const AUTHOR = "Peter Piekarczyk"
const SITE = "peterp.me"
const TAGLINE = "Building Backpack & products only possible with AI"

// Advance widths for Inter Bold, in ems. Unknown glyphs fall back to the average.
const BOLD_WIDTHS = {
  " ": 0.2368,
  "!": 0.3379,
  '"': 0.5518,
  "#": 0.6489,
  $: 0.6548,
  "%": 1.0156,
  "&": 0.6719,
  "'": 0.3389,
  "(": 0.377,
  ")": 0.377,
  "*": 0.5591,
  "+": 0.6787,
  ",": 0.334,
  "-": 0.4678,
  ".": 0.334,
  "/": 0.3882,
  0: 0.6743,
  1: 0.4312,
  2: 0.6299,
  3: 0.6455,
  4: 0.6763,
  5: 0.6221,
  6: 0.6494,
  7: 0.5815,
  8: 0.6509,
  9: 0.6494,
  ":": 0.334,
  ";": 0.3428,
  "<": 0.6787,
  "=": 0.6787,
  ">": 0.6787,
  "?": 0.5596,
  "@": 1.0161,
  A: 0.7466,
  B: 0.6616,
  C: 0.7397,
  D: 0.7222,
  E: 0.6074,
  F: 0.5869,
  G: 0.7505,
  H: 0.7471,
  I: 0.2808,
  J: 0.5845,
  K: 0.7192,
  L: 0.5654,
  M: 0.9316,
  N: 0.7622,
  O: 0.7705,
  P: 0.6479,
  Q: 0.7769,
  R: 0.6567,
  S: 0.6548,
  T: 0.6675,
  U: 0.7319,
  V: 0.7466,
  W: 1.0376,
  X: 0.7383,
  Y: 0.731,
  Z: 0.6641,
  a: 0.5806,
  b: 0.6304,
  c: 0.5884,
  d: 0.6304,
  e: 0.5957,
  f: 0.3979,
  g: 0.6318,
  h: 0.6226,
  i: 0.271,
  j: 0.271,
  k: 0.5801,
  l: 0.271,
  m: 0.9126,
  n: 0.6226,
  o: 0.6133,
  p: 0.6304,
  q: 0.6304,
  r: 0.4072,
  s: 0.5601,
  t: 0.3662,
  u: 0.6226,
  v: 0.5996,
  w: 0.8501,
  x: 0.5801,
  y: 0.6021,
  z: 0.5728,
  "\u2018": 0.3105,
  "\u2019": 0.3105,
  "\u2013": 0.5,
  "\u2014": 1,
  "\u2026": 1.002,
}

function loadSatori() {
  return typeof satoriModule === "function" ? satoriModule : satoriModule.default
}

function loadFonts() {
  const dir = path.join(process.cwd(), "src/og/fonts")
  return [
    {
      name: "Inter",
      data: fs.readFileSync(path.join(dir, "Inter-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: fs.readFileSync(path.join(dir, "Inter-Bold.ttf")),
      weight: 700,
      style: "normal",
    },
  ]
}

function textWidth(text, fontSize) {
  const tracking = -0.025 * fontSize
  let width = 0
  for (const char of text) {
    width += (BOLD_WIDTHS[char] ?? 0.62) * fontSize
  }
  if (text.length > 1) width += tracking * (text.length - 1)
  return width
}

function wrapLines(title, fontSize, maxWidth) {
  const words = title.trim().split(/\s+/)
  const lines = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (textWidth(next, fontSize) <= maxWidth) {
      current = next
      continue
    }
    if (current) lines.push(current)
    current = word
  }
  if (current) lines.push(current)
  return lines
}

function layoutTitle(title) {
  const maxWidth = INNER_W
  for (let fontSize = 78; fontSize >= 32; fontSize -= 2) {
    const lines = wrapLines(title, fontSize, maxWidth)
    const overflows = lines.some(line => textWidth(line, fontSize) > maxWidth)
    if (lines.length <= 3 && !overflows) {
      return { fontSize, lines }
    }
  }

  const fontSize = 32
  const lines = wrapLines(title, fontSize, maxWidth).slice(0, 3)
  return { fontSize, lines }
}

function element(type, props, ...children) {
  return React.createElement(
    type,
    props,
    ...children.filter(child => child != null && child !== false)
  )
}

async function circleAvatar(displaySize) {
  const size = displaySize * 3
  const avatarPath = path.join(process.cwd(), "content/assets/profile-pic.jpg")
  const photo = await sharp(avatarPath)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer()
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${
      size / 2
    }" r="${size / 2}" fill="#fff"/></svg>`
  )
  const png = await sharp(photo)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer()
  return `data:image/png;base64,${png.toString("base64")}`
}

function OgCard({ title, date, avatar }) {
  const { fontSize, lines } = layoutTitle(title)
  const lineHeight = 1.12

  return element(
    "div",
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
      },
    },
    element(
      "div",
      {
        style: {
          width: INNER_W,
          height: INNER_H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      },
      element(
        "div",
        { style: { display: "flex", flexDirection: "column", width: INNER_W } },
        ...lines.map(line =>
          element(
            "div",
            {
              style: {
                display: "flex",
                width: INNER_W,
                height: Math.ceil(fontSize * lineHeight),
                fontSize,
                fontWeight: 700,
                lineHeight,
                letterSpacing: -0.025 * fontSize,
                color: "#fafafa",
              },
            },
            line
          )
        )
      ),
      element(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            width: INNER_W,
            height: AVATAR,
          },
        },
        element("img", {
          src: avatar,
          width: AVATAR,
          height: AVATAR,
        }),
        element(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: 18,
              height: AVATAR,
            },
          },
          element(
            "div",
            {
              style: {
                fontSize: 26,
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: -0.4,
                lineHeight: 1.1,
              },
            },
            AUTHOR
          ),
          element(
            "div",
            {
              style: {
                fontSize: 18,
                fontWeight: 400,
                color: "#a1a1aa",
                marginTop: 4,
                lineHeight: 1.1,
              },
            },
            SITE
          )
        ),
        element("div", { style: { display: "flex", flexGrow: 1 } }),
        date
          ? element(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "flex-end",
                  width: 280,
                  fontSize: 22,
                  fontWeight: 400,
                  color: "#a1a1aa",
                },
              },
              date
            )
          : null
      )
    )
  )
}

async function renderOgPng({ title, date, avatar, fonts }) {
  const satori = loadSatori()
  const svg = await satori(
    React.createElement(OgCard, { title, date, avatar }),
    { width: WIDTH, height: HEIGHT, fonts }
  )
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
  const rendered = resvg.render()
  return rendered.asPng()
}

function ogSlug(slug) {
  const parts = String(slug).split("/").filter(Boolean)
  return parts[parts.length - 1]
}

function fileHash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
}

function cardKey(input, fonts, avatar) {
  return crypto.createHash("sha256").update(JSON.stringify({
    template: TEMPLATE_VERSION,
    title: input.title,
    date: input.date ?? null,
    fonts,
    avatar,
  })).digest("hex")
}

async function generateOgImages(posts) {
  const root = process.cwd()
  const publicDir = path.join(root, "public")
  const ogDir = path.join(publicDir, "og")
  fs.mkdirSync(ogDir, { recursive: true })

  const fontHash = [
    fileHash(path.join(root, "src/og/fonts/Inter-Regular.ttf")),
    fileHash(path.join(root, "src/og/fonts/Inter-Bold.ttf")),
  ].join(":")
  const avatarHash = fileHash(path.join(root, "content/assets/profile-pic.jpg"))

  const jobs = [{
    title: TAGLINE,
    date: null,
    out: path.join(publicDir, "og.png"),
  }]
  const seen = new Map()
  for (const post of posts) {
    const leaf = post.leaf
    const title = post.title
    if (!leaf || !title) continue
    const previous = seen.get(leaf)
    if (previous && previous !== post.href) {
      throw new Error(`OG image slug collision for "${leaf}": ${previous} and ${post.href}`)
    }
    seen.set(leaf, post.href)
    jobs.push({
      title,
      date: post.date,
      out: path.join(ogDir, `${leaf}.png`),
    })
  }

  let regenerated = 0
  let reused = 0
  const misses = []
  for (const job of jobs) {
    const key = cardKey(job, fontHash, avatarHash)
    const cached = path.join(OG_CACHE, `${key}.png`)
    if (fs.existsSync(cached)) {
      fs.copyFileSync(cached, job.out)
      reused += 1
      continue
    }
    misses.push({ ...job, cached })
  }

  if (misses.length > 0) {
    const avatar = await circleAvatar(AVATAR)
    const fonts = loadFonts()
    fs.mkdirSync(OG_CACHE, { recursive: true })
    for (const job of misses) {
      const png = await renderOgPng({
        title: job.title,
        date: job.date ?? undefined,
        avatar,
        fonts,
      })
      fs.writeFileSync(job.cached, png)
      fs.writeFileSync(job.out, png)
      regenerated += 1
    }
  }

  console.log(`OG cache: regenerated=${regenerated} reused=${reused}`)
  return regenerated
}

module.exports = {
  AUTHOR,
  AVATAR,
  HEIGHT,
  INNER_W,
  PADDING,
  TAGLINE,
  WIDTH,
  generateOgImages,
  layoutTitle,
  ogSlug,
  renderOgPng,
}

if (require.main === module) {
  const posts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/generated/og-posts.json"), "utf8"))
  generateOgImages(posts).catch(error => {
    console.error(error)
    process.exit(1)
  })
}
