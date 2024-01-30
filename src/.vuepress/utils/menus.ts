import { App } from "vuepress"

interface BuildMenuOptions {
  reverse?: boolean
  includeReadme?: boolean
  groups?: boolean
}

const defaultBuildMenuOptions: BuildMenuOptions = {
  reverse: false,
  includeReadme: false,
  groups: false
}

export function buildMenu(app: App, text: string, prefix: string, options: BuildMenuOptions = {}) {
  options = {
    ...defaultBuildMenuOptions,
    ...options
  }

  const pages = app.pages
    .filter(page => page.filePathRelative?.startsWith(prefix))
    .filter(page => options.includeReadme || page.filePathRelative !== `${prefix}/README.md`)

  pages.sort((a, b) => (b.filePathRelative! > a.filePathRelative! ? -1 : 1) * (options.reverse ? -1 : 1))

  return {
    text,
    children: options.groups ? objectMap(groupBy(pages, "filePathRelative"), (group, pages) => ({
      text: group,
      children: pages.map(page => page.filePathRelative)
    })) : pages.map(page => page.filePathRelative)
  }
}

function groupBy<T extends Record<string | number, any>, K extends keyof T>(items: T[], key: K): Record<T[K], T[]> {
  return items.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<T[K], T[]>)
}

function objectMap<V, O>(items: Record<string, V>, map: (key: string, value: V) => O): O[] {
  return Object.keys(items).map(key => map(key, items[key]))
}
