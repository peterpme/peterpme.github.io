import { graphql, useStaticQuery } from "gatsby"

export const useSiteMetadata = () => {
  const data = useStaticQuery(graphql`
    query SiteMetadata {
      site {
        siteMetadata {
          title
          siteUrl
          description
          keywords
          titlePrefix
          titleSuffix
          og {
            type
            image {
              alt
              height
              width
              type
              url
            }
          }
          author {
            name
            summary
          }
        }
      }
    }
  `)

  return data.site.siteMetadata
}
