const childProcess = require("child_process")
const os = require('os')
const util = require("./util")
const path = require('path')


const findLeinVersion = () => {
  // return false
  try {
    const versionCmd = childProcess.execSync("lein --version").toString("utf-8")
    if (!versionCmd) {
      return false
    }
    const words = versionCmd.split(" ")
    const semver = words[words.indexOf("Leiningen") + 1]
    return semver
  } catch (e) {
    return false
  }
}

const getLeinDownloadUrl = (platform) => {
  if (platform !== "win32") {
    return "https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein"
  }
  return "https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein.bat"
}

const getDefaultDownloadDir = (platform) =>
  path.resolve(__dirname+'./../tmp')

module.exports = {
  findLeinVersion,
  getDefaultDownloadDir,
  getLeinDownloadUrl,
}
