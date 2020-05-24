import React from "react"
import { Link } from "gatsby"
import { useStaticQuery, graphql } from "gatsby"
import Bio from "./bio"

import github from "../images/github.svg"
import twitter from "../images/twitter.svg"
import linkedin from "../images/linkedin.svg"
import medium from "../images/medium.svg"
import draftbit from "../images/draftbit.svg"
import instagram from "../images/instagram.svg"
import devto from "../images/devto.svg"

function getIcon(name) {
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

function SocialProfileList() {
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
            rel="nofollow noopener"
          >
            <img className="w-5 h-5" src={getIcon(profile.name)} />
          </a>
        </li>
      ))}
    </ul>
  )
}

function Container({ children }) {
  return (
    <div className="mx-auto p-4 max-w-xl text-gray-900 leading-relaxed">
      {children}
    </div>
  )
}

function Header({ title }) {
  return (
    <header className="flex items-center justify-between mb-12">
      <span className="font-bold text-2xl">
        <Link to={`/`}>{title}</Link>
      </span>
      <nav>
        <ul className="flex items-center">
          <li className="m-0 mr-3">
            <Link to="/about">About</Link>
          </li>
          <li className="m-0 mr-3">
            <Link to="/talks">Talks</Link>
          </li>
          <li className="m-0 mr-3">
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

const Layout = ({ title, children }) => {
  return (
    <Container>
      <Header title={title} />
      <main>{children}</main>
      <footer className="pt-2 mt-2 border-t font-bold">
        <Bio />
        <div className="flex items-center">
          <span className="leading-tight block mr-4">
            © {new Date().getFullYear()}
          </span>
          <SocialProfileList />
        </div>
      </footer>
    </Container>
  )
}

export default Layout
