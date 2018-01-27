#!/usr/bin/env node

const path = require("path")
const _ = require("lodash")
const os = require("os")
const childProcess = require("child_process")
const commander = require("commander")
const inquirer = require("inquirer")
const chalk = require("chalk")
const jre = require("./../lib/node-jre")


const getLeinDownloadUrl = (platform) => {
  if (platform !== "win32") {
   return "https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein"
  }
  return "https://raw.githubusercontent.com/technomancy/leiningen/stable/bin/lein.bat"
}

const getJavaVersion = () => {
  const cmdRes = childProcess.spawnSync('java', ['-version'])
  if (cmdRes.status !== 0) {
    console.error("Error running 'java -version'")
    return process.exit(1)
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
  // let jreDir = childProcess.execSync("echo $JAVA_HOME")
  let jreDir = childProcess.execSync("echo $JAVA")
  jreDir = _.trim(jreDir.toString("utf-8"))
  return !jreDir ? false : jreDir
}

const prettyPlatform = platform => {
  if (platform === "darwin") return "macOS"
  if (platform === "win32") return "windows"
  return _.capitalize(platform)
}

const getDefaultJavaInstallLocation = (platform) => {
  if (platform === "darwin") return "/Library/Java/JavaVirtualMachines"
  if (platform === "win32") return "C:\\Program Files\\Java"
  if (platform === "linux") return "/usr/java"
}

const whenNoJavaHome = (platform) => [
  {
    type: "confirm",
    name: "userSaysJavaInstalled",
    message: "No $JAVA_HOME environment variable detected. Do you have Java installed?",
    default: false,
  },
  {
    type: "confirm",
    name: "installJava",
    message: "Would you like to install the recommended Java SDK?",
    when: answers => answers.userSaysJavaInstalled === false,
  },
  {
    type: "confirm",
    name: "installJavaDefaultOSLocation",
    message: "The default Java install location for "
             + prettyPlatform(platform) + " is:\n\n"
             + "  " + getDefaultJavaInstallLocation(platform)
             + "\n\n OK to install it here?",
    when: answers => answers.installJava === true,
  },

]

const whenJavaHome = (javaMajorVersionNumber, leinSemver) => [
  {
    type: "confirm",
    name: "validJavaAndLeinConfirmed",
    message: "Looks like you have Java version " + javaMajorVersionNumber
             + " and Leiningen " + leinSemver
             + ". Congratulations! \n\n Press Y or ENTER to confirm.",
    when: answers => javaMajorVersionNumber > 1.6 && leinSemver,
  },
  {
    type: "confirm",
    name: "wantsToInstallLein",
    message: "Looks like you have Java but no `lein` command on your path. Would you like to install Leiningen?",
    when: answers => javaMajorVersionNumber > 1.6 && !leinSemver,
  },
  {
    type: "confirm",
    name: "installNewerJavaToSatisfyRequirement",
    message: "Looks like you have Java version " + javaMajorVersionNumber
             + ". Clojure/Clojurescript require Java 1.6 or higher. \n\n"
             + "Would you like to install Java 1.8 now?",
    when: answers => javaMajorVersionNumber < 1.6,
  },

]

const javaHome = findJavaHome()
const platform = os.platform()

const findLeinVersion = () => {
  const versionCmd = childProcess.execSync("lein --version").toString("utf-8")
  if (!versionCmd) {
    return false
  }
  const words = versionCmd.split(" ")
  const semver = words[words.indexOf("Leiningen") + 1]
  return semver
}

const getShellRcFilePath = () => {
  const bashrcDefault = "$HOME/.bashrc"
  const zshrcDefault = "$HOME/.zshrc"
  if (fs.existsSync(zshrcDefault)) return zshrcDefault
  if (fs.existsSync(bashrcDefault)) return bashrcDefault
  return false
}

const addJavaHome = (rcPath, javaHomePath) => {
  childProcess.execSync(
    `# Added by create-cljs-app
     echo "export JAVA_HOME=${javaHomePath}" >> ${rcPath}`)
}

const addJavaCommandToPath = (rcPath, javaHomePath) => {
  childProcess.execSync(
    `# Added by create-cljs-app
     echo "export PATH=$PATH:${javaHomePath}" >> ${rcPath}`)
}


if (!javaHome) {
  inquirer.prompt(whenNoJavaHome(platform))
          .then(answers => {
            if (answers.userSaysJavaInstalled) {
              console.log("Please set $JAVA_HOME to the path of your installation and try running the installer again.")
              return process.exit(0)
            }
            if (answers.installJava && answers.installJavaDefaultOSLocation) {
              const defaultLocation = getDefaultJavaInstallLocation(platform)
              jre.install(defaultLocation)
            }

            console.log(answers)
          })
} else {
  const { majorVersionNumber } = getJavaVersion()
  const leinVersion = findLeinVersion()

  inquirer.prompt(whenJavaHome(majorVersionNumber, leinVersion))
          .then(answers => console.log(answers))
}


