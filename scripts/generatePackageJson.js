const fs = require('fs')

const readFile = async () => {
  const packageContents = await fs.promises.readFile('package.json', {
    encoding: 'utf-8',
  })

  return JSON.parse(packageContents)
}

const writeFile = async (jsonData) => {
  await fs.writeFileSync('package.json', JSON.stringify(jsonData, null, 2))
}

const setupDev = async () => {
  console.log(`👩‍💻 Generating for development`)
  const jsonPackageContents = await readFile()
  if (jsonPackageContents.name.includes('-dev')) {
    console.log(`\n⚠️ Looks like package.json is already setup for development`)
    return
  }
  jsonPackageContents.name = appendDev(jsonPackageContents.name)
  jsonPackageContents.displayName = appendDev(jsonPackageContents.displayName)
  jsonPackageContents.contributes.commands =
    jsonPackageContents.contributes.commands.map((obj) => ({
      ...obj,
      command: appendDev(obj.command),
      title: appendDev(obj.title),
    }))

  jsonPackageContents.contributes.keybindings =
    jsonPackageContents.contributes.keybindings.map((binding) => ({
      ...binding,
      command: appendDev(binding.command),
    }))
  await writeFile(jsonPackageContents)
  console.log(`\n✓ package.json updated for development`)
}

const revertDev = async () => {
  console.log(`🤞 Reverting development changes in package.json\n`)
  const jsonData = await readFile()
  jsonData.name = removeDev(jsonData.name)
  jsonData.displayName = removeDev(jsonData.displayName)
  jsonData.contributes.commands = jsonData.contributes.commands.map((obj) => ({
    ...obj,
    command: removeDev(obj.command),
    title: removeDev(obj.title),
  }))
  jsonData.contributes.keybindings = jsonData.contributes.keybindings.map(
    (binding) => ({
      ...binding,
      command: removeDev(binding.command),
    })
  )
  await writeFile(jsonData)
  console.log(`✓ package.json development changes reverted!`)
}

const appendDev = (value) => value.replace(/pullflow/i, '$&-dev')
const removeDev = (value) => value.replace('-dev', '')

process.argv[2] === 'development' ? setupDev() : revertDev()
