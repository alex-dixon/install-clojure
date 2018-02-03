const childProcess = require("child_process")
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

const getDefaultDownloadLocation = (platform) =>
  path.resolve(__dirname + './../tmp/lein')


const downloadLein = async ({
  url,
  downloadPath,
  installedJavaBinPath,
}) => {

  await util.download(url, downloadPath)

  childProcess.execSync("chmod 777 " + downloadPath)
  childProcess.execSync("export " + "PATH=" + installedJavaBinPath + ":$PATH"
                        + " && " + downloadPath)
  childProcess.execSync(`mv ${downloadPath} /usr/local/bin`)
}


module.exports = {
  findLeinVersion,
  getDefaultDownloadLocation,
  getLeinDownloadUrl,
  downloadLein,
}
