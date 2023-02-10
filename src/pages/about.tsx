import React from "react"
import { graphql } from "gatsby"

import { Layout } from "../components/layout"
import { Seo } from "../components/seo"

function Ahref({ href, target = "_blank", children }) {
  return (
    <a
      target={target}
      className="text-indigo-500 underline decoration-1 decoration-indigo-500 underline-offset-4"
      href={href}
    >
      {children}
    </a>
  )
}

function Section({ title, children }) {
  return (
    <section className="pb-6 leading-relaxed">
      <h2 className="mb-2 text-xl font-bold font-headline border-0">{title}</h2>
      {children}
    </section>
  )
}

export default function AboutPage({ data, location }) {
  const siteTitle = data.site.siteMetadata.title
  const FAVORITES = [
    {
      label: "Expo",
      href: "https://expo.io/",
    },
    {
      label: "React Native",
      href: "https://reactnative.dev/",
    },
    {
      label: "ChatGPT",
      href: "https://chat.openai.com",
    },
    {
      label: "Stable Diffusion",
      href: "https://stable.ai/",
    },
  ]

  return (
    <Layout>
      <Section title="About Peter">
        <p className="pb-4">
          Hello! I'm working on building the best mobile wallet at{" "}
          <Ahref href="https://backpack.app">Backpack</Ahref>. Prior to that, I
          was the co-founder & CTO of{" "}
          <Ahref href="https://draftbit.com">Draftbit</Ahref>.
        </p>
        <p className="pb-4">
          I always knew I wanted to build things. At the age of 12 I started my
          first business selling templated logos and websites on Ebay. As you
          could imagine, client phone calls didn't go as planned.
        </p>
        <p className="pb-4">
          Several companies and *lots* of learning, experiences and mistakes
          later, I'm working on a new way to build apps.
        </p>
        <p>
          <Ahref href="https://draftbit.com">Draftbit</Ahref> is a platform
          backed by <Ahref href="https://ycombinator.com">Y-Combinator</Ahref>{" "}
          that gives teams the ability to build fully native experiences without
          having to worry about writing any code, giving anyone the opportunity
          to build anything they imagine.
        </p>
      </Section>
      <Section title="Favorites">
        <p>
          Some of the software and frameworks I've been obsessed with recently:
          <ul className="mt-3">
            {FAVORITES.map(favorite => {
              return (
                <li className="mb-1">
                  <Ahref href={favorite.href}>{favorite.label}</Ahref>
                </li>
              )
            })}
          </ul>
        </p>
      </Section>
      <Section title="Community">
        <p>
          People and relationships are what made me the person I am today,
          building a rich and striving tech community in Chicago is a
          vision/passion of mine. These are some of the awesome communities that
          are making my vision come true:
        </p>
        <ul className="mt-2">
          <li className="mb-1">
            <Ahref href="https://chicagojs.org">ChicagoJS Community</Ahref>
          </li>
        </ul>
      </Section>
    </Layout>
  )
}

export const Head = () => <Seo />

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
