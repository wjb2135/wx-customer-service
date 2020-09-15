// 通过remote模块取的原本在主进程中才能使用的session模块
const session = require('electron').remote.session
const Cookie = {}
const Session = session
const Url = 'http://crmapi.wwj.fanwe.com'

/**
 * 获取cookie
 */
Cookie.getCookies = (name) => {
  let data = []
  return new Promise(function (resolve, reject) {
    Session.defaultSession.cookies.get({
      url: Url,
      name: name
    }, function (error, cookies) {
      error && console.error(error)
      if (cookies.length > 0) {
        data = cookies
      }
      resolve((cookies && cookies[0] && cookies[0].value) || '')
    })
  })
};
/**
 * 清空缓存
 */
Cookie.clearCookies = (url) => {
  Session.defaultSession.clearStorageData({
    origin: Url,
    storages: ['cookies']
  }, function (error) {
    if (error) console.error(error);
  })
};

/**
 * 保存cookie
 * @param name  cookie名称
 * @param value cookie值
 */
Cookie.setCookie = (name, value) => {
  let Days = 30;
  let exp = new Date();
  let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
  const cookie = {
    url: Url,
    name: name,
    value: value,
    expirationDate: date
  };
  Session.defaultSession.cookies.set(cookie, (error) => {
    if (error) console.error(error);
  });
};

// export default cookie
module.exports = Cookie
