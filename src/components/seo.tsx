import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

type OpenGraphType = "website" | "article"

type Props = {
  title?: string
  description?: string
  pathname?: string
  children?: React.ReactNode
  location?: { pathname?: string }
  image?: string
  imageAlt?: string
  type?: OpenGraphType
  publishedTime?: string
  tags?: string[]
}

function joinUrl(siteUrl: string, pathname: string): string {
  if (!pathname) return siteUrl
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${siteUrl}${path}`
}

function articleTags(type: OpenGraphType, tags: string[] | undefined): React.ReactNode {
  switch (type) {
    case "website":
      return null
    case "article":
      return tags?.map(tag => (
        <meta property="article:tag" content={tag} key={tag} />
      ))
    default: {
      const exhaustive: never = type
      return exhaustive
    }
  }
}

export function Seo({
  title,
  description,
  pathname,
  children,
  location,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  tags,
}: Props): JSX.Element {
  const {
    title: defaultTitle,
    siteUrl,
    description: defaultDescription,
    twitterUsername,
    og,
  } = useSiteMetadata()

  const pagePath = pathname ?? location?.pathname ?? ""
  const pageUrl = joinUrl(siteUrl, pagePath)
  const imageUrl = image ? joinUrl(siteUrl, image) : og.image.url
  const alt = imageAlt || og.image.alt || defaultTitle

  const seo = {
    title: title ? `${title} | ${defaultTitle}` : defaultTitle,
    description: description || defaultDescription,
  }

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{seo.title}</title>
      <link rel="canonical" href={pageUrl} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${defaultTitle} RSS Feed`}
        href={`${siteUrl}/rss.xml`}
      />
      <meta name="description" content={seo.description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={alt} />
      <meta name="twitter:creator" content={twitterUsername} />

      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={alt} />
      <meta property="og:image:type" content={og.image.type} />
      <meta property="og:image:width" content={og.image.width} />
      <meta property="og:image:height" content={og.image.height} />
      {type === "article" && publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {type === "article" ? (
        <meta property="article:author" content={siteUrl} />
      ) : null}
      {articleTags(type, tags)}
      {children}
    </>
  )
}
