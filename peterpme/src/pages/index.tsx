import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { graphql, Link } from "gatsby"

import { SEO as Seo } from "../components/seo"
import { Layout } from "../components/layout"

const IndexPage: React.FC<PageProps> = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  return (
    <Layout location={location} title={siteTitle}>
      <PostList posts={data.posts.nodes} />
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <Seo />

function PostList({ posts }): React.ReactNode {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li key={post.id} className="mb-8">
            <h3 className="antialiased font-sans mb-1 font-bold text-lg">
              <Link
                className="hover:underline underline-offset-8 hover:text-sky-700"
                to={post.fields.slug}
              >
                {post.frontmatter.title}
              </Link>
            </h3>
            <p
              className="subpixel-antialiased text-base font-sans font-regular"
              dangerouslySetInnerHTML={{
                __html: post.frontmatter.description || post.excerpt,
              }}
            />
          </li>
        )
      })}
    </ul>
  )
}

export const pageQuery = graphql`
  query Index {
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        id
        excerpt(pruneLength: 120)
        timeToRead
        wordCount {
          words
        }
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
