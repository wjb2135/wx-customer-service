exports.install = function (Vue, options) {
  // 新窗口
  Vue.prototype.newWindows = function (url, options) {
    const ipc = require('electron').ipcRenderer
    ipc.send('newWindows', { url: url, options: options })
    return false
  }
  // 右下角新窗口
  Vue.prototype.rightBottomWindows = function (url, options) {
    const ipc = require('electron').ipcRenderer
    options.x = screen.width - options.width
    options.y = screen.height - options.height - 80
    options.movable = false
    options.resizable = false
    options.frame = false
    ipc.send('newWindows', { url: url, options: options })
    return false
  }
}
