import type {UserConfig} from "@vuepress/cli"
import type {App, Page, PageHeader} from "@vuepress/core"
import {DefaultThemeOptions, NavbarGroup} from '@vuepress/theme-default'
import {join} from "path"

function buildNavMenu(app: App, text: string, prefix: string): NavbarGroup {
  const children = app.pages.filter(p => p.path?.startsWith(prefix) && !p.filePathRelative?.endsWith("README.md"))

  const ungroupedChildren = children.filter(page => !page.frontmatter.group)
  const childGroups = children.filter(page => page.frontmatter.group).reduce((groups, page) => {
    const group = <string>page.frontmatter.group
    groups[group] = groups[group] || [];
    groups[group].push(page)
    return groups
  }, <{ [group: string]: Page[] }>{});

  return {
    text,
    children: [
      ...ungroupedChildren.map(p => p.path),
      ...Object.keys(childGroups).map(group => ({
        text: group,
        children: childGroups[group].map(p => p.path)
      }))
    ]
  }
}

function htmlDecode(input: string): string {
  return input.replace("&#39;", "'").replace("&amp;", "&")
}

function fixPageHeader(header: PageHeader) {
  header.title = htmlDecode(header.title)
  header.children.forEach(child => fixPageHeader(child))
}

const config: UserConfig = {
  lang: 'en-GB',
  title: 'Sierra Softworks Blog',
  description: 'The official Sierra Softworks blog.',

  head: [
    ['meta', { name: "description", content: "The official Sierra Softworks blog, written by Benjamin Pannell." }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // ['script', { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-WJQ1PVYVH0" }],
    // ['script', {}, "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}; gtag('js', new Date()); gtag('config', 'G-WJQ1PVYVH0');"]
  ],

  theme: join(__dirname, "theme", "index.ts"),

  extendsMarkdown(md, app) {
    md
      .use(require("markdown-it-footnote"))
      .use(require("markdown-it-abbr"))
  },

  onInitialized(app) {
    app.options.themeConfig.navbar = [
      "/archive/",
      buildNavMenu(app, "Projects", "/projects/"),
      buildNavMenu(app, "Licenses", "/licenses/"),
      {
        text: "About Me",
        link: "https://ben.pannell.dev"
      }
    ]
  },

  extendsPageData(page, app) {
    const fixedHeaders = page.headers || []
    fixedHeaders.forEach(header => fixPageHeader(header))

    return {
      headers: fixedHeaders,
      frontmatter: {
        ...page.frontmatter,
        layout: page.frontmatter.layout || (page.filePathRelative?.startsWith("posts/") ? "BlogPost" : "Layout")
      }
    }
  },

  themeConfig: <DefaultThemeOptions>{
    logo: 'https://cdn.sierrasoftworks.com/logos/icon.png',

    repo: "https://github.com/SierraSoftworks",
    repoLabel: "GitHub",

    docsRepo: "SierraSoftworks/blog",
    docsDir: "src",

    editLinkText: "Suggest a change to this page",

    lastUpdated: true,
    contributors: false,

    navbar: [
      {
        text: "Projects",
        children: []
      },
      {
        text: "Licenses",
        link: "/licenses/",
      }
    ]
  },

  plugins: [
    ["@vuepress/plugin-google-analytics", { id: "G-WJQ1PVYVH0" }]
  ]
}

export = config