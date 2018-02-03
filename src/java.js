const _ = require("lodash")
const childProcess = require("child_process")


const getDefaultJavaInstallPath = (platform) => {
  if (platform === "darwin") return "/Library/Java/JavaVirtualMachines"
  if (platform === "win32") return "C:\\Program Files\\Java"
  if (platform === "linux") return "/usr/java"
}

const getJavaVersion = () => {
  const cmdRes = childProcess.spawnSync('java', ['-version'])
  if (cmdRes.status !== 0) {
    console.error("Error running 'java -version'")
    return {}
  }
  const str = cmdRes.stderr.toString("utf-8")
  const regexp = /java version "(.*?)"/
  const match = regexp.exec(str)
  const versionStr = match[1]
  const majorVersionNumber =
    parseFloat(
      _.take(
        _.first(versionStr.split("_"))
         .split(".")
        , 2).join("."))

  return { versionStr, majorVersionNumber }
}

const findJavaHome = () => {
  let jreDir = childProcess.execSync("echo $JAVA_HOME")
  // let jreDir = childProcess.execSync("echo $JAVA")
  jreDir = _.trim(jreDir.toString("utf-8"))
  return !jreDir ? false : jreDir
}

const pathToJavaExecutable = (installDir, jreDirname, osPlatform) => {
  if (osPlatform === "darwin") return installDir
                                      + "/" + jreDirname
                                      + '/Contents/Home/bin/java'
  if (osPlatform === "win32") return installDir
                                     + "\\" + jreDirname
                                     + '\\bin\\javaw.exe'
  if (osPlatform === "linux") return installDir
                                     + "/" + jreDirname
                                     + "/bin/java"
}

const pathToJavaBinToJavaHome = (platform, pathToBin) => {
  const javaHomeEnd = platform === "win32" ? "\\bin\\java" : "/bin/java"
  return pathToBin.substring(0, pathToBin.indexOf(javaHomeEnd))
}

const getDefaultJavaHome = (platform, jreVersionDirname) => {
  const installDir = getDefaultJavaInstallPath(platform)
  const pathToBin = pathToJavaExecutable(installDir, jreVersionDirname, platform)
  return pathToJavaBinToJavaHome(platform, pathToBin)
}
const meetsVersionRequirement = (version) => version >= 1.6


module.exports = {
  findJavaHome,
  getDefaultJavaHome,
  getDefaultJavaInstallPath,
  getJavaVersion,
  pathToJavaExecutable,
  pathToJavaBinToJavaHome,
  meetsVersionRequirement
}