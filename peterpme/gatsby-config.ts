import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Peter Piekarczyk`,
    description:
      "Peter Piekarczyk - Co-founder of Draftbit. Investor & Advisor. Building Backpack for mobile",
    twitterUsername: "@peterpme",
    keywords: `CTO, startups, Software Development, ReasonML, React, Node, Investing, Advising, No-Code, Low-Code`,
    siteUrl: "https://peterp.me",
    author: {
      name: `Peter Piekarczyk`,
      summary: `Building @xNFT_Backpack`,
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
    "gatsby-plugin-google-gtag",
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
            name: `Open Sans`,
            file: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap`,
          },
          {
            name: "Source Code Pro",
            file: `https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@600&display=swap`,
          },
          {
            name: "Libre Baskerville",
            file: `https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap`,
          },
          {
            name: "Inter",
            file: `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap`,
          }
        ],
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
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
      // options: {
      //   plugins: [
      //     {
      //       resolve: "gatsby-remark-images",
      //       options: {
      //         maxWidth: 590,
      //         withWebp: true,
      //         showCaptions: true,
      //         quality: 80,
      //       },
      //     },
      //     {
      //       resolve: "gatsby-remark-responsive-iframe",
      //       options: {
      //         wrapperStyle: "margin-bottom: 1.0725rem",
      //       },
      //     },
      //     "gatsby-remark-prismjs",
      //     "gatsby-remark-copy-linked-files",
      //     "gatsby-remark-smartypants",
      //     "gatsby-remark-autolink-headers",
      //   ],
      // },
    },
    "gatsby-plugin-postcss",
  ],
}

export default config
