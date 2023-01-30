import * as React from "react"

import Bio from "./bio"
import { SocialProfileList } from "./social-profiles"
import { Link } from "gatsby"

function Container({ children }) {
  return <div className="mx-auto p-6 max-w-2xl text-gray-900">{children}</div>
}

function Header({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between mb-12">
      <span className="font-bold text-3xl">
        <Link to={`/`}>{title}</Link>
      </span>
      <nav>
        <ul className="flex items-center">
          <li className="m-0 mr-3">
            <Link to="/about">About</Link>
          </li>
          <li className="m-0">
            <Link to="/talks">Talks</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export function Layout({ title, children }) {
  return (
    <Container>
      <Header title={title} />
      <main>{children}</main>
      <footer className="p-2 mt-2 border-t font-bold">
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
