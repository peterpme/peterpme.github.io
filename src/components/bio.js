import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
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
    <aside className="flex items-center my-4">
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        className="w-12 h-12 mr-4 rounded-full"
      />

      <div class="flex flex-col justify-center">
        <span className="pb-0 mb-0 text-2xl font-bold leading-tight font-headline">
          Peter Piekarczyk
        </span>
        <span className="font-light leading-tight">
         Building Backpack
        </span>
      </div>
    </aside>
  )
}

export default Bio
