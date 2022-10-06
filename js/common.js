/*
 * @Author: Petrichor 572752189@qq.com
 * @Date: 2022-08-27 21:19:45
 * @LastEditors: fengyinxqy 572752189@qq.com
 * @LastEditTime: 2022-09-24 22:11:24
 * @FilePath: \肖祺彦_JS_20220924.48\js\common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/**
 * @description: 获取DOM元素对象下标
 * @param {*} item
 * @return {*}	返回下标
 * @Date: 2022-08-27 22:10:11
 */
function getElementIdx(item) {
  var elements = item.parentNode.children;
  for (var i = 0, len = elements.length; i < len; i++) {
    if (item === elements[i]) {
      return i;
    }
  }
}

/**
 * @description: 设置标签中的内容，兼容性处理
 * @param {*} element
 * @param {*} text
 * @Date: 2022-08-27 22:10:50
 */
function setInnerText(element, text) {
  var key = element.textContent == 'undefined' ? 'innerText' : 'textContent';
  element[key] = text;
}

/**
 * @description: 获取元素实际样式
 * @param {*} obj	//对象
 * @param {*} attr	//样式属性
 * @return {*}	Bool值
 * @Date: 2022-08-27 22:11:19
 */
function getStyle(obj, attr) {
  return obj.currentStyle
    ? obj.currentStyle[attr]
    : getComputedStyle(obj, false)[attr];
}

/**
 * @description: 设置元素样式
 * @param {*} dom
 * @param {*} css
 * @return {*}
 * @Date: 2022-08-31 23:00:28
 */
function setStyle(dom, css) {
  for (var key in css) {
    dom['style'][key] = css[key];
  }
}
/**
 * @description: querySelector的简便写法
 * @return {*}	返回获得的dom对象
 * @Date: 2022-08-27 22:12:29
 */
function $(ele) {
  return document.querySelector(ele);
}

/**
 * @description: querySelectorAll的简便写法
 * @return {*} 返回获得的dom对象
 * @Date: 2022-08-27 22:13:16
 */
function $$(ele) {
  return document.querySelectorAll(ele);
}

/**
 * @description:
 * @param {*} element	标签
 * @param {*} type	事件类型
 * @param {*} fn	True|False(默认为False)	是捕获阶段还是冒泡阶段
 * @Date: 2022-08-27 22:13:45
 */
function addEventListener(element, type, fn) {
  if (element.addEventListener) {
    //标准浏览器写法
    element.addEventListener(type, fn, false);
  } else if (element.attachEvent) {
    //IE兼容写法
    element.attachEvent('on' + type, fn);
  } else {
    //on绑定写法
    element['on' + type] = fn;
  }
}

/**
 * @description:
 * @param {*} element	标签
 * @param {*} type	事件类型
 * @param {*} fn	True|False(默认为False)
 * @return {*}
 * @Date: 2022-08-27 22:14:31
 */
function removeEventListener(element, type, fn) {
  if (element.removeEventListener) {
    element.removeEventListener(type, fn, false);
  } else if (element.detachEvent) {
    element.detachEvent('on' + type, fn);
  } else {
    element['on' + type] = null;
  }
}

/**
 * @description: 监听事件
 * @param {Object} element 需要监听的DOM对象
 * @param {String} type 事件类型 click mouseenter
 * @param {Function} fn 监听绑定的回调函数
 * @param {Boolean} capture true 捕获阶段监听 false 冒泡阶段监听
 * @return {JSON} "remove":Function 返回一个用于解除监听的函数
 * @Date: 2020-08-10 22:45:25
 */
function eventListener(element, type, fn, capture) {
  capture = capture || false; //处理capture的默认值为 false
  if (element.addEventListener) {
    //标准浏览器写法
    element.addEventListener(type, fn, capture);
  } else {
    //IE兼容写法
    element.attachEvent('on' + type, fn);
  }

  return {
    remove: function () {
      if (element.removeEventListener) {
        element.removeEventListener(type, fn, false);
      } else {
        element.detachEvent('on' + type, fn);
      }
    },
  };
}

/**
 * @description: 获取距离window视窗的坐标
 * @param {*} element
 * @return {*} pos对象
 * @Date: 2022-08-28 22:04:05
 */
function getPosition(element) {
  var pos = {
    left: 0,
    top: 0,
  };
  while (element.offsetParent) {
    pos.left += element.offsetLeft;
    pos.top += element.offsetTop;
    element = element.offsetParent;
  }
  return pos;
}
/**
 * @description: 元素占用的空间尺寸和位置兼容处理(IE只返回 top right bottom left)
 * @param {*} elem
 * @return {*}
 * @Date: 2022-09-01 20:53:57
 */
function getBoundingClientRect(elem) {
  var rect = elem.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width || rect.right - rect.left,
    height: rect.height || rect.bottom - rect.top,
    // x: rect.x,
    // y: rect.y,
  };
}
/**
 * @description: 计算元素的位置
 * @param {*} e
 * @return {*} 返回XY的坐标值
 * @Date: 2022-09-01 21:11:24
 */
function getElementPosition(e) {
  var x = 0,
    y = 0;
  while (e != null) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent; // 获取最近的祖先定位元素
  }
  return {
    x: x,
    y: y,
  };
}

/* 

ie/chrome: onmousewheel
 　　ev.wheelDelta:
      上：120
      下：-120
 
　ff: addEventListener('DOMMouseScroll',fn,false) 火狐用鼠标事件要用addEventListener绑定
　　ev.detail:
     上：-3
     下：3
 
 阻止默认事件：
     return false 用于阻止一般形式的事件（如：on+事件名称）的默认行为
     ev.preventDefault() 用于阻止addEventListener绑定的事件的默认行为 */
/**
 * @description: 鼠标滚轮事件
 * @param {*} obj
 * @param {*} fn
 * @return {*}
 * @Date: 2022-09-06 20:56:29
 */
function mousewheel(obj, fn) {
  obj.onmousewheel === null
    ? (obj.onmousewheel = fun)
    : obj.addEventListener('DOMMouseScroll', fun, false);

  function fun(e) {
    var e = e || event,
      num = 0;

    if (e.wheelDelta) {
      num = e.wheelDelta > 0 ? 1 : -1;
    } else {
      num = e.detail < 0 ? 1 : -1;
    }
    fn(num);

    if (e.preventDefault) e.preventDefault();
    return false;
  }
}

/**
 * @description: 运动框架
 * @param {*} ele
 * @param {*} json
 * @param {*} callback
 * @return {*}
 * @Date: 2022-09-06 20:56:59
 */
function animate(ele, json, callback) {
  clearInterval(ele.time); //保证每一次都只有一个定时器在运行
  var toggle = false;
  var currLeft = parseInt(getStyle(ele, 'left'));
  ele.time = setInterval(function () {
    //每次定时循环都暂且认为他们都可以达到最终结果
    toggle = true;
    for (var key in json) {
			//当有z-index的时候设置完跳出他，不然会很快就到，要单独处理
      if (key === 'zIndex') {	
        ele.style[key] = json[key];
        continue;
      }
      var target = parseInt(json[key]);
      curr = parseInt(getStyle(ele, key));
      speed = (target - curr) / 10;
      speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
      if (curr === target) {
        //width 先到了指定值了 定时器结束了
        ele.style[key] = target + 'px';
      }
      ele.style[key] = curr + speed + 'px';
      if (curr !== target) {
        //只要有某一个属性的值不到指定结果 关闭锁
        toggle = false;
      }
    }
    if (toggle) {
      clearInterval(ele.time);
      callback && callback();
    }
  }, 1000 / 60);
}



/**
 * @description: 设置cookie
 * @param {*} obj	对象
 * @param {*} time	设置时间
 * @Date: 2022-09-15 16:50:16
 */
function setCookie(obj, time) {
	for (key in obj) {
		var d = new Date();
		d.setDate(d.getDate() + time);
		document.cookie =
			key + '=' + obj[key] + ';expires=' + d.toUTCString();
	}
}

/**
 * @description: 获取cookie为一个对象
 * @return {*}	acc 对象
 * @Date: 2022-09-15 16:50:20
 */
function getCookie() {
	var cookie = document.cookie;
	var cookieArr = cookie.match(/[^=;\s]+=([^=;]+)(?:;?)/g);
	var argData = {};
	for (var key of arguments) {
		argData[key] = 1;
	}
	return cookieArr.reduce(function (acc, curr) {
		var tempStr = curr.replace(';', '');
		var tempArr = tempStr.split('=');
		if (tempArr[0] && argData[tempArr[0]]) {
			acc[tempArr[0]] = tempArr[1];
		}
		return acc;
	}, {});
}

/**
 * @description: 移除cookie
 * @Date: 2022-09-15 16:50:23
 */
function removeCookie() {
	for (key in arguments) {
		var json = {};
		json[arguments[key]] = null;
		setCookie(json, -1);
	}
}


/**
 * @description: 用于判断某个函数是否是bind的产物
 * @param {*} funs
 * @return {*} boolean
 * @Date: 2022-09-20 21:20:22
 */
function isBoundFuns(funs) {
	console.log(funs.name);
	return /bound/gi.test(funs.name);
}


/**
 * @description: 多重继承
 * @param {*} targetClass 
 * @param {*} parentClass
 * @param {*} otherParent
 * @return {*}
 */
function mixProto(targetClass, parentClass, otherParent) {
  targetClass.prototype = Object.create(parentClass.prototype);
  Object.assign(targetClass.prototype, otherParent.prototype);
}