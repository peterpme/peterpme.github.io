import * as React from "react"

import Bio from "./bio"
import { SocialProfileList } from "./social-profiles"
import { useSiteMetadata } from "../hooks/use-site-metadata"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

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
  {
    label: "Ideas",
    path: "/ideas",
  },
]

function NavHeader({ title }: { title: string }) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <Link
          to={`/`}
          className="transition-colors font-bold text-l md:text-xl py-2 px-4 md:px-2 bg-black hover:bg-indigo-500 text-white"
        >
          {title}
        </Link>
        <a
          href="https://twitter.com/peterpme"
          className="link-follow-me hidden md:block px-3 text-sm text-slate-400 hover:text-indigo-500"
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

export function Layout({
  pageTitle,
  children,
}: {
  pageTitle?: string
  children: React.ReactNode
}) {
  const { title } = useSiteMetadata()
  return (
    <>
      <StaticImage
        src="../images/bg.png"
        alt="background"
        className="hidden lg:block"
        height={800}
        layout="fixed"
        placeholder="none"
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          zIndex: -1,
        }}
      />
      <Container>
        <NavHeader title={title} />
        {pageTitle ? (
          <h1 className="mb-4 text-xl font-bold font-headline border-0">
            {pageTitle}
          </h1>
        ) : null}
        <main className="mb-6">{children}</main>
        <Footer />
      </Container>
    </>
  )
}
