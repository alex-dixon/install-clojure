const fs = require("fs")
const childProcess = require("child_process")
const _ = require("lodash")


const getShellRcFilePath = () => {
  const homeDir = _.trim(childProcess.execSync("echo $HOME").toString("utf-8"))
  const bashrcDefault = homeDir + "/.bashrc"
  const zshrcDefault = homeDir + "/.zshrc"
  if (fs.existsSync(zshrcDefault)) return zshrcDefault
  if (fs.existsSync(bashrcDefault)) return bashrcDefault
  return false
}

const addEnvKVToRcFile = (rcPath, k, v) =>
  childProcess.execSync(
    `echo '\n# Added by create-cljs-app\nexport ${k}=${v}' >> ${rcPath}`)


const addToPath = (rcFilepath, x) =>
  childProcess.execSync(
    `echo '\n# Added by create-cljs-app\nexport PATH="${x}:$PATH"' >> ${rcFilepath}`)



const hasCommand = (cmd) => childProcess.spawnSync("which", [cmd]).status !== 1


const download = (url, filepath) => new Promise((resolve, reject) => {
  const wrt = fs.createWriteStream(filepath)

  const httpLib = url.startsWith("https://") ? require("https") : require("http")

  httpLib.get(url, (res => {
    res.pipe(wrt)
    wrt.on("finish", () => wrt.close((e) => e ? reject() : resolve()))
  })).on("error", e => {
    fs.unlinkSync(filepath)
    reject(e)
  })
})


const prettyPlatform = platform => {
  if (platform === "darwin") return "macOS"
  if (platform === "win32") return "windows"
  return _.capitalize(platform)
}


module.exports = {
  getShellRcFilePath,
  addEnvKVToRcFile,
  addToPath,
  hasCommand,
  download,
  prettyPlatform,
}
