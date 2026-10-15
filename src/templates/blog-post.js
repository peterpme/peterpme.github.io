import React from "react"
import { Link, graphql } from "gatsby"
import { Layout } from "../components/layout"
import { Seo } from "../components/seo"

function Navigator({ previous, next }) {
  if (!previous && !next) return null

  return (
    <nav className="my-4">
      <ul className="flex flex-wrap justify-between list-none p-0">
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← Previous
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              Next →
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default function BlogPost({ data, pageContext }) {
  const post = data.markdownRemark
  const { previous, next } = pageContext

  return (
    <Layout>
      <article className="mb-12">
        <header className="mb-4">
          <h1 className="subpixel-antialiased mb-1 text-xl font-sans font-bold">
            {post.frontmatter.title}
          </h1>
          {post.frontmatter.date && (
            <time dateTime={post.frontmatter.isoDate} className="block text-sm text-gray-500">
              {post.frontmatter.date}
            </time>
          )}
        </header>
        <section
          className="markdown font-sans font-regular leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
      <Navigator previous={previous} next={next} />
    </Layout>
  )
}

function tagList(keywords) {
  if (!keywords) return []
  return Array.isArray(keywords) ? keywords.filter(Boolean) : [keywords]
}

function absoluteUrl(siteUrl, value) {
  if (!value) return `${siteUrl}/og.png`
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`
}

function ogImagePath(slug, ogImage) {
  if (ogImage) return ogImage
  const leaf = slug.split("/").filter(Boolean).pop()
  return `/og/${leaf}.png`
}

export const Head = ({ location, data }) => {
  const { title, description, isoDate, keywords, ogImage } =
    data.markdownRemark.frontmatter
  const slug = data.markdownRemark.fields.slug
  const siteUrl = data.site.siteMetadata.siteUrl
  const authorName = data.site.siteMetadata.author.name
  const pageUrl = `${siteUrl}${slug}`
  const imageUrl = absoluteUrl(siteUrl, ogImagePath(slug, ogImage))
  const tags = tagList(keywords)
  const author = {
    "@type": "Person",
    name: authorName,
    url: siteUrl,
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: isoDate,
    dateModified: isoDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author,
    publisher: author,
    url: pageUrl,
    ...(description ? { description } : {}),
  }

  return (
    <Seo
      pathname={slug}
      location={location}
      title={title}
      description={description}
      image={imageUrl}
      imageAlt={title}
      type="article"
      publishedTime={isoDate}
      tags={tags}
    >
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Seo>
  )
}

export const query = graphql`
  query BlogPostPage($slug: String!) {
    site {
      siteMetadata {
        siteUrl
        author {
          name
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      fields {
        slug
      }
      frontmatter {
        title
        description
        keywords
        ogImage
        date(formatString: "MMMM DD, YYYY")
        isoDate: date
      }
      html
    }
  }
`
