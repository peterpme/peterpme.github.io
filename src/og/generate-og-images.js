const fs = require("fs")
const path = require("path")
const React = require("react")
const sharp = require("sharp")

const WIDTH = 1200
const HEIGHT = 630
const AUTHOR = "Peter Piekarczyk"
const TAGLINE = "Building Backpack and products AI made possible"

function loadSatori() {
  const mod = require("satori")
  return typeof mod === "function" ? mod : mod.default
}

function loadFonts() {
  const dir = path.join(__dirname, "fonts")
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

async function circleAvatar(size) {
  const avatarPath = path.join(process.cwd(), "content/assets/profile-pic.jpg")
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${
      size / 2
    }" r="${size / 2}" fill="#fff"/></svg>`
  )
  const png = await sharp(avatarPath)
    .resize(size, size)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer()
  return `data:image/png;base64,${png.toString("base64")}`
}

function titleFontSize(title) {
  const length = title.length
  if (length > 90) return 46
  if (length > 70) return 52
  if (length > 48) return 58
  return 66
}

function element(type, props, ...children) {
  return React.createElement(
    type,
    props,
    ...children.filter(child => child != null && child !== false)
  )
}

function OgCard({ title, date, subtitle, avatar, footer = AUTHOR }) {
  return element(
    "div",
    {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f6f6f4",
        color: "#111111",
        fontFamily: "Inter",
        padding: "56px 68px 52px",
      },
    },
    element(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      element(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.2,
          },
        },
        element("div", {
          style: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#4f46e5",
            marginRight: 12,
          },
        }),
        "peterp.me"
      ),
      date
        ? element(
            "div",
            { style: { fontSize: 22, color: "#6b7280" } },
            date
          )
        : null
    ),
    element(
      "div",
      {
        style: {
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          width: 1064,
        },
      },
      element(
        "div",
        {
          style: {
            fontSize: titleFontSize(title),
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1.6,
            color: "#111111",
          },
        },
        title
      ),
      subtitle
        ? element(
            "div",
            {
              style: {
                marginTop: 22,
                fontSize: 32,
                lineHeight: 1.35,
                color: "#3f3f46",
                letterSpacing: -0.4,
              },
            },
            subtitle
          )
        : null
    ),
    element(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #e4e4e7",
          paddingTop: 28,
        },
      },
      element("img", {
        src: avatar,
        width: 84,
        height: 84,
        style: { marginRight: 20 },
      }),
      element(
        "div",
        {
          style: {
            display: "flex",
            width: 920,
            fontSize: footer === AUTHOR ? 30 : 28,
            fontWeight: footer === AUTHOR ? 700 : 400,
            letterSpacing: -0.3,
            color: footer === AUTHOR ? "#111111" : "#3f3f46",
            lineHeight: 1.25,
          },
        },
        footer
      )
    )
  )
}

async function renderOgPng({ title, date, subtitle, avatar, fonts }) {
  const satori = loadSatori()
  const svg = await satori(
    React.createElement(OgCard, { title, date, subtitle, avatar }),
    { width: WIDTH, height: HEIGHT, fonts }
  )
  const { Resvg } = require("@resvg/resvg-js")
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
  return resvg.render().asPng()
}

function ogSlug(slug) {
  const parts = String(slug).split("/").filter(Boolean)
  return parts[parts.length - 1]
}

async function generateOgImages({ graphql, reporter }) {
  const avatar = await circleAvatar(168)
  const fonts = loadFonts()
  const root = process.cwd()
  const publicDir = path.join(root, "public")
  const ogDir = path.join(publicDir, "og")
  fs.mkdirSync(ogDir, { recursive: true })

  const defaultPng = await renderOgPng({
    title: AUTHOR,
    footer: TAGLINE,
    avatar,
    fonts,
  })
  fs.writeFileSync(path.join(publicDir, "og.png"), defaultPng)

  const result = await graphql(`
    {
      allMarkdownRemark {
        nodes {
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            ogImage
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw new Error(result.errors.map(error => error.message).join("\n"))
  }

  const seen = new Map()
  let count = 0

  for (const node of result.data.allMarkdownRemark.nodes) {
    const slug = node.fields && node.fields.slug
    const title = node.frontmatter && node.frontmatter.title
    if (!slug || !title) continue
    if (node.frontmatter.ogImage) continue

    const leaf = ogSlug(slug)
    const previous = seen.get(leaf)
    if (previous && previous !== slug) {
      throw new Error(`OG image slug collision for "${leaf}": ${previous} and ${slug}`)
    }
    seen.set(leaf, slug)

    const png = await renderOgPng({
      title,
      date: node.frontmatter.date,
      avatar,
      fonts,
    })
    fs.writeFileSync(path.join(ogDir, `${leaf}.png`), png)
    count += 1
  }

  if (reporter) {
    reporter.info(`Wrote ${count} article OG images and public/og.png`)
  }

  return count
}

module.exports = {
  AUTHOR,
  HEIGHT,
  TAGLINE,
  WIDTH,
  generateOgImages,
  ogSlug,
  renderOgPng,
}

if (require.main === module) {
  async function preview() {
    const avatar = await circleAvatar(168)
    const fonts = loadFonts()
    const out = path.join(process.cwd(), "static")
    fs.mkdirSync(out, { recursive: true })
    const post = await renderOgPng({
      title: "What actually happens when you message Grok Bot",
      date: "October 14, 2026",
      avatar,
      fonts,
    })
    const fallback = await renderOgPng({
      title: AUTHOR,
      footer: TAGLINE,
      avatar,
      fonts,
    })
    const long = await renderOgPng({
      title: "Working Through cannot find module unicode/category/So in Keystone",
      date: "March 12, 2017",
      avatar,
      fonts,
    })
    fs.writeFileSync(path.join(out, "og.png"), fallback)
    fs.writeFileSync("/tmp/og-post.png", post)
    fs.writeFileSync("/tmp/og-long.png", long)
    console.log("preview written")
  }

  preview().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
