import * as React from "react"
import { graphql, Link } from "gatsby"

import { Seo } from "../components/seo"
import { Layout } from "../components/layout"

export default function IndexPage({ data, location }) {
  return (
    <Layout>
      <PostList posts={data.posts.nodes} />
    </Layout>
  )
}

function PostList({ posts }): React.ReactNode {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li key={post.id} className="mb-8">
            <h3 className="antialiased font-sans mb-1 font-bold text-lg">
              <Link
                className="transition-colors hover:text-indigo-500 hover:underline decoration-2 decoration-indigo-500 underline-offset-4"
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

export const Head = ({ location }) => <Seo location={location} />

export const pageQuery = graphql`
  query IndexPage {
    posts: allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fileAbsolutePath: { regex: "/blog/" } }
    ) {
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
