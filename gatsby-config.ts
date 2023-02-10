import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Peter Piekarczyk`,
    siteUrl: "https://peterp.me",
    description:
      "Peter Piekarczyk - Engineer, Investor, Advisor. Building Backpack for mobile",
    twitterUsername: "@peterpme",
    keywords:
      "Startups, Engineering, Software Development, Investing, Advising, React, Node, Leadership, Automation",
    titlePrefix: "",
    titleSuffix: " | Peter Piekarczyk",
    author: {
      name: `Peter Piekarczyk`,
      summary: `Building Backpack for mobile`,
    },
    og: {
      type: "website",
      image: {
        alt: "Peter Piekarczyk",
        height: "630",
        width: "1200",
        type: "image/png",
        url: "./src/images/og.png",
      },
    },
    social: {
      twitter: `peterpme`,
      github: `peterpme`,
      instagram: `peterpme`,
    },
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sitemap",
    "gatsby-transformer-json",
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [
          `https://fonts.googleapis.com`,
          `https://fonts.gstatic.com`,
        ],
        web: [
          {
            name: "Inter",
            file: `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`,
          },
          {
            name: "Fira Code",
            file: `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap`,
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Peter Piekarczyk`,
        short_name: `peterpme`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#000`,
        display: `minimal-ui`,
        icon: `./src/images/android-chrome-512x512.png`,
        icons: [
          {
            src: `./src/images/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `./src/images/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    "gatsby-plugin-mdx",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },

    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "blog",
        path: "./src/content/blog",
      },
      __key: "blog",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "assets",
        path: "./src/content/assets",
      },
      __key: "assets",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: "./src/data",
      },
      __key: "data",
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 500,
              withWebp: true,
              // showCaptions: true,
              quality: 80,
            },
          },
          {
            resolve: "gatsby-remark-responsive-iframe",
            // options: {
            //   wrapperStyle: "margin-bottom: 1.0725rem",
            // },
          },
          "gatsby-remark-prismjs",
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-smartypants",
          "gatsby-remark-autolink-headers",
        ],
      },
    },
    "gatsby-plugin-postcss",
    `gatsby-plugin-netlify`,
  ],
}

export default config
