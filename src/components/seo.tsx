import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

type Props = {
  title?: string
  description?: string
  pathname?: string
  children?: React.ReactNode
  location?: any
}

export function Seo({
  title,
  description,
  pathname,
  children,
  location,
}: Props): JSX.Element {
  const {
    title: defaultTitle,
    siteUrl,
    description: defaultDescription,
    keywords,
    og,
    author,
    image,
  } = useSiteMetadata()

  const seo = {
    title: title ? `${title} | ${defaultTitle}` : defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || ``}`,
    keywords,
    twitterUsername: author.name,
  }
  console.log("s.title", seo.title)

  const canonicalUrl = siteUrl + (location?.pathname ?? "")

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="image" content={seo.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:creator" content={seo.twitterUsername} />

      {/* Open Graph */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={og.title} />
      <meta property="og:type" content={og.type} />
      <meta property="og:image" content={og.image.url} />
      <meta property="og:image:alt" content={og.image.alt} />
      <meta property="og:image:type" content={og.image.type} />
      <meta property="og:image:width" content={og.image.width} />
      <meta property="og:image:height" content={og.image.height} />
      {children}
    </>
  )
}
