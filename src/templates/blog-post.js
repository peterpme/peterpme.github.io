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
        <header>
          <h1 className="subpixel-antialiased mb-4 text-xl font-sans font-bold">
            {post.frontmatter.title}
          </h1>
          {post.frontmatter.date && (
            <time dateTime={post.frontmatter.isoDate} className="text-sm text-gray-500">
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

export const Head = ({ location, data }) => {
  const { title, description, isoDate } = data.markdownRemark.frontmatter
  const slug = data.markdownRemark.fields.slug

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    datePublished: isoDate,
    author: {
      "@type": "Person",
      name: "Peter Piekarczyk",
      url: "https://peterp.me",
    },
    url: `https://peterp.me${slug}`,
  }

  return (
    <Seo location={location} title={title} description={description}>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Seo>
  )
}

export const query = graphql`
  query BlogPostPage($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      fields {
        slug
      }
      frontmatter {
        title
        description
        date(formatString: "MMMM DD, YYYY")
        isoDate: date
      }
      html
    }
  }
`
