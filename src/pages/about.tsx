import React from "react"
import { PageProps, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

function Ahref({ href, target = "_blank", children }) {
  return (
    <a target={target} className="border-b-2 border-black" href={href}>
      {children}
    </a>
  )
}

function Section({ title, children }) {
  return (
    <section className="pb-2">
      <h2 className="pt-3 pb-3 text-2xl font-bold leading-normal font-headline border-0">
        {title}
      </h2>
      {children}
    </section>
  )
}

type Data = {
  site: {
    siteMetadata: {
      title: string
    }
  }
  allMarkdownRemark: {
    edges: {
      node: {
        excerpt: string
        frontmatter: {
          title: string
          date: string
          description: string
        }
        fields: {
          slug: string
        }
      }
    }[]
  }
}

export default function AboutPage({ data, location }) {
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="About Peter Piekarczyk" />
      <Section title="Software & Startups">
        <p className="pb-3">
          I always knew I wanted to build things. At the age of 12 I started my
          first business selling templated logos and websites on Ebay. As you
          could imagine, client phone calls didn't go as planned.
        </p>
        <p className="pb-3">
          Several companies and *lots* of learning, experiences and mistakes
          later, I'm working on a new way to build apps.{" "}
        </p>
        <p className="pb-3">
          <Ahref href="https://draftbit.com">Draftbit</Ahref> is a platform
          backed by <Ahref href="https://ycombinator.com">Y-Combinator</Ahref>{" "}
          that gives teams the ability to build fully native experiences without
          having to worry about writing any code, giving anyone the opportunity
          to build anything they imagine.
        </p>
        <p>
          Some of the software and frameworks I've been obsessed with recently:
          <ul className="mt-2">
            <li className="mb-1">
              <Ahref href="https://reasonml.github.io/">ReasonML</Ahref>
            </li>
            <li className="mb-1">
              <Ahref href="https://expo.io">Expo</Ahref>
            </li>
            <li className="mb-1">React Native</li>
            <li className="mb-1">React</li>
            <li className="mb-1">GraphQL</li>
          </ul>
        </p>
      </Section>
      <Section title="Community">
        <p>
          People and relationships are what made me the person I am today,
          building a rich and striving tech community in Chicago is a
          vision/passion of mine. These are some of the awesome communities that
          are making my vision come true
        </p>
        <ul className="mt-2">
          <li className="mb-1">
            <Ahref href="https://chicagojscamp.org">Chicago JSCamp</Ahref>
          </li>
          <li className="mb-1">
            <Ahref href="https://chicagojs.org">ChicagoJS Community</Ahref>
          </li>
          <li className="mb-1">
            <Ahref href="https://reason-conf.us">Reason Conf US</Ahref>
          </li>
          <li className="mb-1">
            <Ahref href="http://www.chicagotechslack.com">
              Chicago Tech Slack
            </Ahref>
          </li>
        </ul>
      </Section>
    </Layout>
  )
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
