const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      query LoadPagesQuery {
        allMarkdownRemark {
          edges {
            node {
              id
              fileAbsolutePath
              frontmatter {
                title
              }
              fields {
                slug
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })

    if (!post.node.fileAbsolutePath.includes("ideas")) {
      const slugBefore = post.node.fields.slug?.replace("/articles/", "")
      const slugAfter = `/articles/${slugBefore}`
      createRedirect({
        fromPath: `/${slugBefore}`,
        toPath: slugAfter,
      })
    }
  })
}

// Creates under node { fields { slug }} and not frontmatter
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const isIdea = node.fileAbsolutePath.includes("ideas")
    const value = createFilePath({
      node,
      getNode,
    })

    createNodeField({
      name: `slug`,
      node,
      value: isIdea ? `/ideas${value}` : `/articles${value}`,
    })
  }
}
