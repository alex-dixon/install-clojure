const util = require("./util")
const java = require("./java")


const whenNoJavaHome = ({ platform, prettyPlatform, javaBin, installedJavaVersion, sampleJavaInstallPath}) => [{
  type: "confirm",
  name: "userSaysJavaInstalled",
  message: "No JAVA_HOME environment variable detected. Do you have Java installed?",
  default: false,
}, {
  type: "confirm",
  name: "wantsToInstallJava",
  message: "Would you like to install the recommended Java runtime?",
  when: answers => !answers.userSaysJavaInstalled,
}, {
  type: "confirm",
  name: "addJavaToPath",
  message: "Would you like to add the `java` command to your PATH?",
  when: answers => answers.userSaysJavaInstalled && javaBin,
}, {
  type: "input",
  name: "validJavaExecutablePath",
  message: "Please enter the absolute path to your Java executable. For "
           + prettyPlatform + " this typically looks like:\n\n"
           + "  "
           + sampleJavaInstallPath,
  validate: (x) => {
    return x
    //TODO. Run java version command on the provided response
    // Verify it's the recommended version
  },
  when: answers =>  answers.userSaysJavaInstalled && !javaBin
}, {
  type: "confirm",
  name: "installJavaDefaultOSLocation",
  message: "The default Java install location for "
           + util.prettyPlatform(platform) + " is:\n\n"
           + "  " + java.getDefaultJavaInstallPath(platform)
           + "\n\n OK to install it here?",
  when: answers => answers.wantsToInstallJava === true,
}]

const setJavaHome = (platform, shellRcFilepath, validJavaExecutablePath) => [{
  type: "confirm",
  name: "okToSetJavaHome",
  message: "Great. Would you like to set JAVA_HOME in " + shellRcFilepath
           + " to "
           + java.pathToJavaBinToJavaHome(platform, validJavaExecutablePath)
           + "?",
  default: true,
}]

const addJavaToPath = (javaHome) => [{
  type: "confirm",
  name: "ok",
  message: "Looks like you have JAVA_HOME defined as " + javaHome
           + " but no `java` command available. "
           + "Would you like to add the `java` command to your shell?",
  default: true,
}]

const downloadLein = (defaultLocation) => [{
  type: "confirm",
  name: "wantsToInstallLein",
  message: "We recommend installing Leiningen, the most popular Clojure package manager. "
           + "We didn't find the `lein` command on your path. "
           + "Would you like to set up Leiningen now?",
  default: true,
}, {
  type: "confirm",
  name: "downloadLeinToDefaultLocation",
  message: `The default Leiningen download location is ${defaultLocation}. OK download it here?`,
  default: true,
  when: answers => answers.wantsToInstallLein,
}, {

  type: "input",
  name: "customLocation",
  message: "Enter the absolute path to where you'd like Leiningen downloaded.",
  when: answers => answers.wantsToInstallLein && !answers.downloadLeinToDefaultLocation,
}]

const whenJavaHome = (javaMajorVersionNumber, leinSemver,
  isJavaVersionRequirementMet) => [{
  type: "confirm",
  name: "validJavaAndLeinConfirmed",
  message: "Looks like you have Java version " + javaMajorVersionNumber
           + " and Leiningen " + leinSemver
           + ". Congratulations! \n\n Press Y or ENTER to confirm.",
  when: answers => isJavaVersionRequirementMet && leinSemver,
}, {
  type: "confirm",
  name: "wantsToInstallLein",
  message: "We recommend installing Leiningen, the most popular Clojure package manager. "
           + "We didn't find the `lein` command on your path. "
           + "Would you like to install Leiningen now?",
  when: answers => isJavaVersionRequirementMet && !leinSemver,
}, {
  type: "confirm",
  name: "downloadLeinToDefaultLocation",
  message: "The default lein download location is tmp. Is this OK?",
  when: answers => answers.wantsToInstallLein,
}, {
  type: "confirm",
  name: "installNewerJavaToSatisfyRequirement",
  message: "Looks like you have Java version " + javaMajorVersionNumber
           + ". Clojure/Clojurescript require Java 1.6 or higher. \n\n"
           + "Would you like to install Java 1.8 now?",
  when: answers => !isJavaVersionRequirementMet,
}]

module.exports = {
  downloadLein,
  whenNoJavaHome,
  whenJavaHome,
  addJavaToPath,
  setJavaHome,
}
