'use strict';

import store from '../store'
const { ipcRenderer, webFrame } = require('electron');
const BadgeCount = require('./badge_count');
const Common = require('../../common');

class Injector {
  init () {
    if (Common.DEBUG_MODE) {
      Injector.lock(window, 'console', window.console);
    }
    // this.initInjectBundle();
    this.initVueInjection();
  }
  initVueInjection () {
    console.log(123455677)
    ipcRenderer.send('wx-rendered', true);
  }
  initInjectBundle () {
    const initModules = () => {
      if (!window.$) {
        return setTimeout(initModules, 3000);
      }
      BadgeCount.init();
    };

    window.onload = () => {
      initModules();
      window.addEventListener('online', () => {
        ipcRenderer.send('reload', true);
      });
    };
  }

  static lock (object, key, value) {
    return Object.defineProperty(object, key, {
      get: () => value,
      set: () => {}
    });
  }
}

new Injector().init();
