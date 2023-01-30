import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import github from "../images/github.svg"
import twitter from "../images/twitter.svg"
import linkedin from "../images/linkedin.svg"
import medium from "../images/medium.svg"
import draftbit from "../images/draftbit.svg"
import instagram from "../images/instagram.svg"
import devto from "../images/devto.svg"

function getIcon(name: string) {
  switch (name) {
    case "DEV":
      return devto
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

export function SocialProfileList() {
  const data = useStaticQuery(graphql`
    query SocialProfiles {
      socialProfiles: allSocialProfilesJson {
        nodes {
          id
          name
          url
        }
      }
    }
  `)

  const socialProfiles = data.socialProfiles.nodes

  return (
    <ul className="flex py-2">
      {socialProfiles.map(profile => (
        <li key={profile.id} className="pr-2">
          <a
            title={profile.name}
            href={profile.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <img
              alt="Avatar for Peter"
              className="w-5 h-5"
              src={getIcon(profile.name)}
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
