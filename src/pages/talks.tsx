import React from "react"
import { PageProps, graphql } from "gatsby"

import { Layout } from "../components/layout"
import { SEO as Seo } from "../components/seo"

function Section({ title, children }) {
  return (
    <section className="pb-6 leading-relaxed">
      <h2 className="mb-2 text-xl font-bold font-headline border-0">{title}</h2>
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

const Talk = ({ year, title, venue, youtubeUrl, url, slideUrl }) => {
  return (
    <li className="mb-4 last:mb-0">
      <div className="flex items-center">
        <span className="text-sm inline-block mr-2 text-indigo-500">
          {year}
        </span>
        <span className="inline-block font-bold">{venue}</span>
      </div>
      <span className="block">{title}</span>
    </li>
  )
}

export default function AboutPage({ data, location }) {
  const siteTitle = data.site.siteMetadata.title
  const talks = data.talks && data.talks.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="Speaking & Appearances" />
      <Section title="Speaking & Appearances">
        <ul className="mt-4 list-horizontal">
          {talks.map(talk => (
            <Talk key={talk.id} {...talk} />
          ))}
        </ul>
      </Section>
    </Layout>
  )
}

export const pageQuery = graphql`
  query Talks {
    site {
      siteMetadata {
        title
      }
    }

    talks: allTalksJson {
      nodes {
        slideUrl
        title
        venue
        visible
        year
        youtubeUrl
      }
    }
  }
`
