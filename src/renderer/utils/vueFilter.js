import Vue from 'vue'

Vue.filter('time', function (value) {
// value是整数，否则要parseInt转换
  var time = new Date((parseInt(value)) * 1000);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();

  return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
});

Vue.filter('times', function (value) {
  // value是整数，否则要parseInt转换
  var time = new Date((parseInt(value)) * 1000);
  var h = time.getHours();
  var m = time.getMinutes();
  var s = time.getSeconds();

  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
});

Vue.filter('fullTime', function (value) {
// value是整数，否则要parseInt转换
  var time = new Date((parseInt(value)) * 1000);
  var Y = time.getFullYear();
  var M = time.getMonth() + 1;
  var D = time.getDate();
  var h = time.getHours();
  var m = time.getMinutes();
  var s = time.getSeconds();

  return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
});

Vue.filter('getDateDiff', function (dateTimeStamp) {
  var minute = 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;

  var now = Date.parse(new Date()) / 1000;
  var diffValue = now - (parseInt(dateTimeStamp));
  if (diffValue < 0) {

    // 若日期不符则弹出窗口告之

    // alert("结束日期不能小于开始日期！");

  }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  let result;
  if (monthC >= 1) {
    result = '发表于' + parseInt(monthC) + '个月前';
  } else if (weekC >= 1) {
    result = '发表于' + parseInt(weekC) + '周前';
  } else if (dayC >= 1) {
    result = '发表于' + parseInt(dayC) + '天前';
  } else if (hourC >= 1) {
    result = '发表于' + parseInt(hourC) + '个小时前';
  } else if (minC >= 1) {
    result = '发表于' + parseInt(minC) + '分钟前';
  } else { result = '刚刚发表'; }
  return result;
});

/**
 * 金额格式化 添加“,”分隔符
 * @param {Number} money 金额
 * @param {Number} dcNum 保留几位小数、默认3位
 */
Vue.filter('formatMoney', function (money, dcNum = 3) {
  // 为空则返回空
  if (money === '') {
    return '';
  }
  // 判断money是否为有效数字
  money = parseFloat(money) + '';
  if (money === 'NaN') {
    return '0.000';
  }
  // 获取数字的符号 - 或 +
  var moneyFlag = '';
  if (money.indexOf('-') !== -1) {
    money = money.replace(/-/g, '');
    moneyFlag = '-';
  }
  // 小数位个数
  var moneyDecimals = '.'
  for (var i = 0; i < dcNum; i++) { moneyDecimals += '0' }

  var decimalsIndex = money.indexOf('.')
  // 获取小数部分
  if (decimalsIndex !== -1) {
    // 根据输入的位数截取小数
    moneyDecimals = money.substring(decimalsIndex, decimalsIndex + dcNum + 1)
    money = money.substr(0, decimalsIndex)
  }
  // 整数部分每三位加一个逗号
  var re = /(\d)(?=(?:\d{3})+$)/g;
  while (re.test(money)) {
    money = money.replace(re, '$1,');
  }
  // 拼接
  return moneyFlag + money + moneyDecimals;
});
