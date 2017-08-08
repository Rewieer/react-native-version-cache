/**
 * Copyright (c) 2017-present, Evosphere.
 * All rights reserved.
 */

jest.mock("react-native", () => {
  let store = {};

  return {
    AsyncStorage: {
      setItem: function(key, value){
        return new Promise((accept) => {
          store[key] = value;
          accept();
        })
      },
      getItem: function(key){
        return new Promise((accept) => {
          accept(store[key] || null);
        })
      },
      clear: function(){
        store = {};
      }
    }
  }
});

const VersionCache = require('../index');
const AsyncStorage = require('react-native').AsyncStorage;

afterEach(function() {
  AsyncStorage.clear();
});

it('should init the VersionCache', async () => {
  await VersionCache.setInitialVersion(1);
  expect(await AsyncStorage.getItem("rnvc::version")).toBe(1);
});

it('should not change the Version because its already defined', async () => {
  await AsyncStorage.setItem("rnvc::version", 2);
  await VersionCache.setInitialVersion(1);
  expect(await AsyncStorage.getItem("rnvc::version")).toBe(2);
});

it('should throw because the version isnt defined', async () => {
  let flag = false;
  try {
    await VersionCache.check(2);
  } catch (e) {
    flag = true;
  }

  expect(flag).toBe(true);
});

it('should execute the function when bumping', async () => {
  await AsyncStorage.setItem("rnvc::version", 1);

  const fn = jest.fn();
  VersionCache.onChange(1, 2, fn);
  await VersionCache.check(2);

  expect(fn).toHaveBeenCalled();
});

it('should execute the function in between', async () => {
  await AsyncStorage.setItem("rnvc::version", 1);

  // (1 + 2) * 2 = 6
  // 1 * 2 + 2 = 4
  // It allows to check order of call

  let i = 1;
  const fnA = jest.fn(() => i += 2);
  const fnB = jest.fn(() => i *= 2);
  VersionCache.onChange(1, 2, fnA);
  VersionCache.onChange(2, 3, fnB);
  await VersionCache.check(3);

  expect(i).toBe(6);
});

it('should execute the function when', async () => {
  await AsyncStorage.setItem("rnvc::version", 1);

  const fn = jest.fn();
  VersionCache.onChange(1, 3, fn);
  await VersionCache.check(3);

  expect(fn).toHaveBeenCalled();
});

it('should execute the function when bumping from middle', async () => {
  await AsyncStorage.setItem("rnvc::version", 2);

  const fn = jest.fn();
  VersionCache.onChange(1, 3, fn);
  await VersionCache.check(3);

  expect(fn).toHaveBeenCalled();
});

it('should not call because versions are the same', async () => {
  await AsyncStorage.setItem("rnvc::version", 3);

  const fn = jest.fn();
  VersionCache.onChange(1, 2, fn);
  VersionCache.onChange(2, 3, fn);
  await VersionCache.check(3);

  expect(fn).not.toHaveBeenCalled();
});

it('should skip the first because version starts from 2', async () => {
  await AsyncStorage.setItem("rnvc::version", 2);

  const fnA = jest.fn();
  const fnB = jest.fn();
  VersionCache.onChange(1, 2, fnA);
  VersionCache.onChange(2, 3, fnB);
  await VersionCache.check(4);

  expect(fnA).not.toHaveBeenCalled();
  expect(fnB).toHaveBeenCalled();
  expect(fnB.mock.calls.length).toBe(1);
});