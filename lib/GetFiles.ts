const { resolve } = require('path')
const { readdir } = require('fs').promises

async function* GetFiles(dir: any): any {
  const dirents = await readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* GetFiles(res)
    } else {
      yield res
    }
  }
}

module.exports = { GetFiles }
