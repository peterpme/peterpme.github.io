const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const { generateOgImages } = require(`./src/og/generate-og-images`)

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemarkFrontmatter {
      ogImage: String
    }
  `)
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  createRedirect({
    fromPath: `/sitemap.xml`,
    toPath: `/sitemap-index.xml`,
    isPermanent: true,
  })


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

  const allPosts = result.data.allMarkdownRemark.edges
  const isTranscript = post =>
    post.node.fileAbsolutePath.includes("/transcripts/")
  const posts = allPosts.filter(post => !isTranscript(post))

  allPosts.filter(isTranscript).forEach(post => {
    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: { slug: post.node.fields.slug, previous: null, next: null },
    })
  })

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

exports.onPostBuild = async ({ graphql, reporter }) => {
  await generateOgImages({ graphql, reporter })
}

// Creates under node { fields { slug }} and not frontmatter
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const isIdea = node.fileAbsolutePath.includes("ideas")
    const isTranscript = node.fileAbsolutePath.includes("/transcripts/")
    const value = createFilePath({
      node,
      getNode,
    })

    createNodeField({
      name: `slug`,
      node,
      value: isTranscript
        ? `/transcripts${value}`
        : isIdea
        ? `/ideas${value}`
        : `/articles${value}`,
    })
  }
}
