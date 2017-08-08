const AsyncStorage = require('react-native').AsyncStorage;
let register = [];

/**
 * Return true if the current register matches versionning conditions
 * @param register
 * @param currentVersion
 * @returns {boolean}
 */
function registerSatisfyConditions(register, currentVersion) {
  return (register.from <= currentVersion && register.to >= currentVersion) && register.to === (currentVersion + 1);
}

/**
 * Check every register and call them if they match conditions
 * @param currentVersion
 * @returns {Promise.<void>}
 */
async function checkRegisters(currentVersion) {
  for (let i = 0; i < register.length; i++) {
    if (registerSatisfyConditions(register[i], currentVersion)) {
      await register[i].callback();
    }
  }
}

/**
 * Get the application's stored version
 * @returns {Promise.<*>}
 */
async function getCurrentVersion() {
  return await AsyncStorage.getItem("rnvc::version")
}

function ensureRegisterIsAnArray() {
  if(!register)
    register = [];
}

ReactNativeVersionCache = {
  setInitialVersion: async function(version) {
    const currentVersion = await getCurrentVersion();
    if(currentVersion){
      return;
    }

    return await AsyncStorage.setItem("rnvc::version", version);
  },
  onChange: function(fromVersion, toVersion, callback) {
    ensureRegisterIsAnArray();
    register.push({
      from: fromVersion,
      to: toVersion,
      callback,
    })
  },
  check: async function(currentVersion, clearRegisters = true) {
    let currentAppVersion;
    currentAppVersion = await getCurrentVersion();
    if(!currentAppVersion){
      throw new Error("Can't look for version in the Storage. Please call the setInitialVersion function before calling check");
    }

    do {
      await checkRegisters(currentAppVersion);
      currentAppVersion++;
    } while (currentAppVersion < currentVersion);

    if(clearRegisters){
      register = null;
    }
  }
};

module.exports = ReactNativeVersionCache;