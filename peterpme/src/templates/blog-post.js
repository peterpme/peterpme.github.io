import React from "react"
import { graphql } from "gatsby"

import { SEO as Seo } from "../components/seo"
import { Layout } from "../components/layout"

export default function BlogPost({ data }) {
  const post = data.markdownRemark

  return (
    <Layout>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article className="mb-12">
        <header>
          <h1 className="subpixel-antialiased mb-2 text-3xl font-sans font-bold ">
            {post.frontmatter.title}
          </h1>
        </header>
        <section
          className="markdown font-sans font-regular leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </Layout>
  )
}

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
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
