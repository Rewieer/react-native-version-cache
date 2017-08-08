# react-native-version-cache

Caches your application version to allow doing operations when the user
updates his application.

It's based on version number. If your user has version 1 and you're deploying
version 2, you might want to execute bootstrapping code when your user updates
(for example to clear unused data or make an API call). This module comes handy
for this situation. It also allows to execute multiple functions if your user
comes from version 1, and you're deploying version 3. There might be a step to
get from 1 to 2, and an other step to get from 2 to 3.

It relies on AsyncStorage to save the cached version.

## Installation

`npm install react-native-version-cache`

## Usage

```js
import VersionCache from "react-native-version-cache";

VersionCache.setInitialVersion(1);

let i = 1;
const fnA = () => i += 2;
const fnB = () => i *= 2;

VersionCache.onChange(1, 2, fnA); // Called when going from v1 to v2
VersionCache.onChange(2, 3, fnB); // Called when going from v2 to v3

// Call check with your current App version
await VersionCache.check(3);

// i equals 6
// You an also do this

VersionCache.onChange(1, 3, () => {});
await VersionCache.check(3);
```

## Functions
### setInitialVersion(version : number)

Set the initial version of the application (basically it's the version you're
using at the moment you're installing this module). It must be called before
checking. It will only store the version to the AsyncStorage if it's not defined.

### onChange(from : number, to : number, callback : Function)

Call your function when your user goes "from" version "to" the next version.

### check(currentVersion : number)

Call this function with you app's current version to roll !