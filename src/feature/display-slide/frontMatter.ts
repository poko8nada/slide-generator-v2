export function parseFrontMatter(mdData: string) {
  const defaultFormattedData = {
    frontMatter: {
      common: '',
      layout: 'top', // 'top' or 'bottom'
      position: 'center', // 'left', 'center', or 'right'
      number: true, // true or false
      icon: '',
    },
    body: '',
  }

  if (!mdData) {
    return defaultFormattedData
  }

  const frontMatterRegex = /^\+\+\+\n([\s\S]*?)\n\+\+\+/g
  const frontMatterMatch = frontMatterRegex.exec(mdData)

  if (!frontMatterMatch) {
    return {
      frontMatter: { ...defaultFormattedData.frontMatter },
      body: mdData,
    }
  }

  const frontMatterContent = frontMatterMatch[1]
  const bodyContent = mdData.slice(
    frontMatterMatch.index + frontMatterMatch[0].length,
  )

  const lines = frontMatterContent.split('\n')
  const resultMatter = { ...defaultFormattedData.frontMatter }

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const [rawKey, ...rest] = trimmedLine.split(':')
    if (!rawKey || rest.length === 0) continue

    const key = rawKey.trim()
    const valueRaw = rest.join(':').trim()

    let value = valueRaw as string | boolean
    if (valueRaw === 'true') {
      value = true
    } else if (valueRaw === 'false') {
      value = false
    }

    if (key === 'layout' && (value === 'top' || value === 'bottom')) {
      resultMatter.layout = value
    } else if (
      key === 'position' &&
      (value === 'left' || value === 'center' || value === 'right')
    ) {
      resultMatter.position = value
    } else if (key === 'number' && typeof value === 'boolean') {
      resultMatter.number = value
    } else if (key === 'common') {
      resultMatter.common = String(value)
    } else if (key === 'icon') {
      resultMatter.icon = String(value)
    }
  }

  return {
    frontMatter: resultMatter,
    body: bodyContent.trim(),
  }
}
