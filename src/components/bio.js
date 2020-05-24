/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

import github from "../images/github.svg"
import twitter from "../images/twitter.svg"
import linkedin from "../images/linkedin.svg"
import medium from "../images/medium.svg"
import draftbit from "../images/draftbit.svg"
import instagram from "../images/instagram.svg"

function getIcon(name) {
  switch (name) {
    case "Instagram":
      return instagram
    case "Github":
      return github
    case "Medium":
      return medium
    case "Twitter":
      return twitter
    case "LinkedIn":
      return linkedin
    default:
      return draftbit
  }
}

function SocialProfile({ name, url }) {
  return (
    <li className="pr-3">
      <a title={name} href={url} target="_blank" rel="nofollow noopener">
        <img className="w-5 h-5" src={getIcon(name)} />
      </a>
    </li>
  )
}

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

      socialProfiles: allSocialProfilesJson {
        nodes {
          id
          name
          url
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata
  const socialProfiles = data.socialProfiles && data.socialProfiles.nodes
  return (
    <aside className="flex p-4 bg-primary-400">
      <div class="flex-shrink-0">
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={author.name}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            minWidth: 50,
            borderRadius: `100%`,
          }}
          imgStyle={{
            borderRadius: `50%`,
          }}
        />
      </div>

      <div class="ml-6 flex flex-col items-start justify-center">
        <span className="pb-0 mb-0 text-3xl font-bold leading-tight font-headline">
          Peter Piekarczyk
        </span>
        <p>Co-founder & CTO of Draftbit</p>
        <ul className="flex pt-2">
          {socialProfiles.map(profile => (
            <SocialProfile key={profile.id} {...profile} />
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default Bio
