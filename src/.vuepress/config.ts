import { defineUserConfig, PageHeader } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { path } from '@vuepress/utils'
import katex from 'katex/dist/katex.mjs'

import mitfootnote from "markdown-it-footnote"
import mitabbr from "markdown-it-abbr"
import mittexmath from "markdown-it-texmath"

import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics"
import { registerComponentsPlugin } from "@vuepress/plugin-register-components"
import { feedPlugin } from "@vuepress/plugin-feed";
import { seoPlugin } from '@vuepress/plugin-seo'
import { sitemapPlugin } from '@vuepress/plugin-sitemap'

import { buildPageCache } from './utils/pageCache'
import { fixPageHeader, mermaidCodeFencePlugin } from './utils/formatting'

export default defineUserConfig({
  lang: 'en-GB',
  title: 'Sierra Softworks Blog',
  description: 'The official Sierra Softworks blog.',

  head: [
    ['meta', { name: "description", content: "The official Sierra Softworks blog, written by Benjamin Pannell." }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'me', href: 'https://mastodon.online/@notheotherben' }],
    ['link', { rel: 'me', href: 'https://hachyderm.io/@notheotherben' }],
    ['script', { defer: '', src: 'https://analytics.sierrasoftworks.com/script.js' }]
  ],

  bundler: viteBundler(),

  extendsMarkdown(md, app) {
    md
      .use(mitfootnote)
      .use(mitabbr)
      .use(mittexmath, {
        engine: katex,
        delimiters: 'dollars',
        katexOptions: {
          output: 'html'
        }
      })
      .use(mermaidCodeFencePlugin)
  },

  extendsPage(page, app) {
    const fixedHeaders = page.headers || []
    fixedHeaders.forEach(header => fixPageHeader(header))

    page.headers = fixedHeaders
    page.frontmatter.layout = page.frontmatter.layout || (page.filePathRelative?.startsWith("posts/") ? "BlogPost" : "Layout")
    page.frontmatter.head = page.frontmatter.head || []
    page.frontmatter.head.push(['link', { rel: 'canonical', href: `https://sierrasoftworks.com${page.permalink || page.pathInferred || page.path}` }])
  },

  async onPrepared(app) {
    await buildPageCache(app, "posts", "posts/", { reverse: true })
    await buildPageCache(app, "projects", "projects/")
    await buildPageCache(app, "licenses", "licenses/")
  },

  theme: defaultTheme({
    logo: 'https://cdn.sierrasoftworks.com/logos/icon.png',
    logoDark: 'https://cdn.sierrasoftworks.com/logos/icon_light.png',

    repo: "https://github.com/SierraSoftworks",
    repoLabel: "GitHub",

    docsRepo: "SierraSoftworks/blog",
    docsDir: "src",

    editLinkText: "Suggest a change to this page",

    lastUpdated: true,
    contributors: false,

    navbar: [
      '/archive.md',
      {
        text: "Projects",
        children: [
          {
            text: "Services",
            children: [
              "/projects/bender.md",
              "/projects/tailservice.md"
            ]
          },
          {
            text: "Tooling",
            children: [
              "/projects/git-tool.md",
              "/projects/github-backup.md",
              "/projects/minback.md"
            ]
          },
          {
            text: "Libraries",
            children: [
              "/projects/bash-cli.md",
              "/projects/human-errors.md"
            ]
          },
          {
            text: "Legacy",
            children: [
              "/projects/arma2ml.md",
              "/projects/coremonitor.md",
              "/projects/expressgate.md",
              "/projects/wkd.md",
            ]
          }
        ]
      },
      {
        text: "Licenses",
        children: [
          {
            text: "Open Source",
            children: [
              "/licenses/mit.md",
              "/licenses/gpl3.md",
            ]
          },
          {
            text: "Commercial",
            children: [
              "/licenses/general.md",
            ]
          }
        ]
      },
      {
        text: "About Me",
        link: "https://benjamin.pannell.dev"
      }
    ]
  }),

  plugins: [
    googleAnalyticsPlugin({ id: "G-WJQ1PVYVH0" }),
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './components'),
    }),
    seoPlugin({
      hostname: "https://sierrasoftworks.com",
      author: {
        name: "Benjamin Pannell",
        url: "https://benjamin.pannell.dev"
      },
      isArticle(page) {
        return page.filePathRelative?.startsWith("posts/") || page.filePathRelative?.startsWith("projects/") || false
      },
    }),
    sitemapPlugin({
      hostname: "https://sierrasoftworks.com",
      excludePaths: [
        "/404.html",
      ],
      changefreq: "monthly",
    }),
    feedPlugin({
      hostname: "https://sierrasoftworks.com",
      atom: true,
      rss: true,
      channel: {
        copyright: `Copyright © ${new Date().getUTCFullYear()} Sierra Softworks`,
        icon: "https://cdn.sierrasoftworks.com/logos/icon.png",
        author: {
          name: "Benjamin Pannell",
          url: "https://benjamin.pannell.dev"
        }
      },
      filter(page) {
        return page.filePathRelative?.startsWith("posts/") || false
      },
      getter: {
        content(page) {
          return page.contentRendered.includes("<!-- more -->") ? page.contentRendered.split("<!-- more -->")[0] : ""
        }
      }
    })
  ]
})
