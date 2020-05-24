import React from "react"
import { Link } from "gatsby"

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

          <li className="m-0">
            <a target="_blank" href="https://twitter.com/peterpme">
              Follow Me
            </a>
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
        © {new Date().getFullYear()}
        {` peterpme`}
      </footer>
    </Container>
  )
}

export default Layout
