#!/usr/bin/env node
const path = require("path")
const _ = require("lodash")
const os = require("os")
const childProcess = require("child_process")
const { prompt } = require("inquirer")
const jre = require("./../lib/node-jre")
const prompts = require("./prompts")
const util = require('./util')
const java = require("./java")
const lein = require("./lein")


class Exception extends Error {
  constructor(message, data) {
    super()
    this.name = "Exception"
    this.data = data
    this.message = message + " " + JSON.stringify(this.data, null, 2)
  }
}

const downloadAndInstallJava = async ({ binPath, platform, installPath, shellRcFilepath, javaHome }) => {

  await jre.install(installPath)
           .catch(e => {
             console.error("Error installing Java", e)
             return process.exit(1)
           })

  // TODO. Verify java bin works

  // Add JAVA_HOME
  const { okToSetJavaHome } = await prompt(prompts.setJavaHome(platform, shellRcFilepath, binPath))
  if (!okToSetJavaHome) {
    console.log("Please set JAVA_HOME manually and try running the installer again.")
    return process.exit(0)
  }


  util.addEnvKVToRcFile(shellRcFilepath, "JAVA_HOME", javaHome)

  // Add java bin to PATH
  const { ok } = await prompt(prompts.addJavaToPath(javaHome))
  if (!ok) {
    console.log("Please make the java command accessible with `java` and try running the installer again.")
    return process.exit(0)
  }
  util.addToPath(shellRcFilepath, javaHome + "/bin")
}

const main = async () => {
  const javaHome = java.findJavaHome()
  const platform = os.platform()

  if (!javaHome) {
    const {
      userSaysJavaInstalled,
      installJava,
      installJavaDefaultOSLocation,
      validJavaExecutablePath,
    } = await prompt(prompts.whenNoJavaHome(platform))

    if (validJavaExecutablePath) {
      // prompt to set java home
    }

    if (userSaysJavaInstalled) {
      console.log("Please set JAVA_HOME manually and try running the installer again.")
      return process.exit(0)
    }

    if (installJava && installJavaDefaultOSLocation) {
      const shellRcFilepath = util.getShellRcFilePath()
      const installPath = java.getDefaultJavaInstallPath(platform)
      const binPath = java.pathToJavaBin(installPath, jre.jreDirname, platform)
      const javaHome = java.pathToJavaBinToJavaHome(platform, binPath)

      await downloadAndInstallJava({
        binPath,
        installPath,
        shellRcFilepath,
        platform,
        javaHome,
      })

      // Prompt donwload lein
      const defaultLeinDownloadLocation = lein.getDefaultDownloadDir(platform)
      const { downloadLeinToDefaultLocation, customLocation } = await prompt(
        prompts.downloadLein(defaultLeinDownloadLocation))

      // Download lein
      const leinDownloadPath = downloadLeinToDefaultLocation
        ? defaultLeinDownloadLocation
        : customLocation
      const url = lein.getLeinDownloadUrl(platform)
      await util.download(url, leinDownloadPath)

      // Install lein

    }
  } else {

    const { majorVersionNumber } = java.getJavaVersion()

    if (!majorVersionNumber) {
      const { userRequestsAddJavaToPath } =
        await prompt(prompts.addJavaToPath(javaHome))

      if (!userRequestsAddJavaToPath) {
        console.log("Please make the `java` command available on your shell and rerun the installer.")
        return process.exit(0)
      }
      util.addToPath(util.getShellRcFilePath(), javaHome)
    }

    // Install lein
    const leinVersion = lein.findLeinVersion()
    const isJavaVersionRequirementMet = java.meetsVersionRequirement(majorVersionNumber)

    const {
      validJavaAndLeinConfirmed,
      wantsToInstallLeinToDefaultLocation,
    } = await prompt(prompts.whenJavaHome(
      majorVersionNumber,
      leinVersion,
      isJavaVersionRequirementMet,
    ))

    if (validJavaAndLeinConfirmed) {
      console.log('Install more stuff')
      process.exit(0)

    } else if (wantsToInstallLeinToDefaultLocation) {
      //FIXME. this is repeated above
      console.log('fixme')
      // try {
      //   const x = await lein.downloadLein(platform,downloadDir)
      // } catch (e) {
      //   console.error("Error downloading lein", e)
      // }
      //
      // childProcess.execSync("chmod +x " + filepath)
      //
      // const rcFilepath = util.getShellRcFilePath()
      //
      // console.log('adding to path', rcFilepath, filepath)
      // util.addToPath(rcFilepath, filepath)
      //
      // console.log('sourcing rcfile', rcFilepath)
      //
      // childProcess.execSync("source " + rcFilepath)

      // childProcess.execSync("lein2")
    }
  }
}

module.exports = {
  main,
}