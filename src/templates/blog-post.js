import React from "react"
import { Link, graphql } from "gatsby"

import { SEO as Seo } from "../components/seo"
import { Layout } from "../components/layout"

function Navigator({ previous, next }) {
  if (previous && next) {
    return (
      <nav className="mb-4">
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

  return null
}

export default function BlogPost({ data, pageContext, location }) {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article className="mb-12">
        <header>
          <h1 className="subpixel-antialiased mb-4 text-2xl font-sans font-bold">
            {post.frontmatter.title}
          </h1>
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

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
      html
    }
  }
`
