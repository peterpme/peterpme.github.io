import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

export default function Bio() {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        avatarImage: childImageSharp {
          gatsbyImageData(layout: FIXED, aspectRatio: 1, width: 44, height: 44)
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata

  return (
    <aside className="antialiased font-sans flex items-center my-4">
      <GatsbyImage
        image={data.avatar.avatarImage.gatsbyImageData}
        alt={author.name}
        className="w-12 h-12 mr-3 rounded-full overflow-hidden"
      />
      <div className="flex flex-col justify-center">
        <span className="pb-0 mb-0 text-xl font-bold leading-tight font-headline">
          {author.name}
        </span>
        <span className="text-sm font-light leading-tight">
          {author.summary}
        </span>
      </div>
    </aside>
  )
}
