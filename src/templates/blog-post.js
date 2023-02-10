import React from "react"
import { Link, graphql } from "gatsby"
import { Layout } from "../components/layout"
import { Seo } from "../components/seo"

function Navigator({ previous, next }) {
  if (previous && next) {
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

  return null
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
  return (
    <Seo
      location={location}
      title={data.markdownRemark.frontmatter.title}
      description={data.markdownRemark.frontmatter.description}
    />
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
      }
      html
    }
  }
`
