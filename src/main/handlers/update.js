/**
 * 应用升级
 */

'use strict';

const { dialog, shell, app, nativeImage } = require('electron');
const https = require('https');
const path = require('path');
const Common = require('../common');

class UpdateHandler {
  checkForUpdate (version, silent) {
    UpdateHandler.CHECKED = true;
    const promise = new Promise((resolve, reject) => {
      if (Common.ELECTRON === app.getName()) {
        reject(Common.UPDATE_ERROR_ELECTRON);
      }
      const req = https.get({
        host: Common.GITHUB_API_HOST,
        headers: { 'user-agent': Common.USER_AGENT },
        path: Common.GITHUB_API_RELEASE_LATEST_PATH
      }, (response) => {
        let body = '';
        response.on('data', (d) => {
          body += d;
        });
        response.on('end', () => {
          this._parseUpdateData(body, version, resolve, reject);
        });
      });
      req.on('error', () => {
        reject(Common.UPDATE_ERROR_NETWORK);
      });
      req.end();
    }).then((fetched) => {
      this.showDialog(fetched.name, fetched.description, 'Update', (response) => {
        if (!response) return;
        shell.openExternal(fetched.url);
      });
    }).catch((message) => {
      if (silent) return;
      if (!message) {
        message = Common.UPDATE_ERROR_UNKNOWN;
      }
      this.showDialog(Common.UPDATE_NA_TITLE, message, 'OK');
    });
  }

  showDialog (message, detail, positiveButton, callback) {
    const iconImage = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));

    dialog.showMessageBox({
      type: 'info',
      buttons: ['Cancel', positiveButton],
      defaultId: 1,
      cancelId: 0,
      title: message,
      message,
      detail,
      icon: iconImage
    }, callback);
  }

  _parseUpdateData (body, version, resolve, reject) {
    const data = JSON.parse(body);
    if (!data || !data.tag_name) reject(Common.UPDATE_ERROR_EMPTY_RESPONSE);
    const fetched = {
      version: data.tag_name,
      is_prerelease: data.prerelease,
      name: data.name,
      url: data.html_url,
      description: data.body
    };

    const versionRegex = /^v[0-9]+\.[0-9]+\.*[0-9]*$/;
    if (versionRegex.test(fetched.version) && fetched.version > version && !fetched.is_prerelease) {
      resolve(fetched);
    } else {
      reject(Common.UPDATE_ERROR_LATEST(version));
    }
  }
}

UpdateHandler.CHECKED = false;

module.exports = UpdateHandler;
