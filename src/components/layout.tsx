import * as React from "react"

import Bio from "./bio"
import { SocialProfileList } from "./social-profiles"
import { Link } from "gatsby"

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased mx-auto p-6 max-w-2xl text-gray-900">
      {children}
    </div>
  )
}

const LINKS = [
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Talks",
    path: "/talks",
  },
]

function Header({ title }: { title: string }) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link
          to={`/`}
          className="transition-colors font-bold text-xl p-2 bg-black hover:bg-indigo-500 text-white"
        >
          {title}
        </Link>
        <a
          href="https://twitter.com/peterpme"
          className="hidden md:block p-2 text-sm text-slate-400"
          target="_blank"
          title="Follow Peter on Twitter"
        >
          Follow me
        </a>
      </div>
      <nav>
        <ul className="flex items-center space-x-4 font-bold">
          {LINKS.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                activeClassName="text-indigo-500 underline decoration-2 decoration-indigo-500 underline-offset-4"
                className="transition-colors hover:text-indigo-500"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="md:flex items-center justify-between pt-3 border-t font-bold">
      <Bio />
      <SocialProfileList />
    </footer>
  )
}

// <div className="flex items-center">
//   <span className="leading-tight block mr-4">
//     © {new Date().getFullYear()}
//   </span>
// </div>

export function Layout({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  // const data = useStaticQuery(graphql`
  //   query BackgroundQuery {
  //     bg: file(absolutePath: { regex: "/bg-plants.jpg/" }) {
  //       bgImage: childImageSharp {
  //         gatsbyImageData(layout: FIXED, height: 800)
  //       }
  //     }
  //   }
  // `)

  return (
    <Container>
      <Header title={title} />
      <main>{children}</main>
      <Footer />
    </Container>
  )
}
