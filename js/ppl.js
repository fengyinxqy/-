const ballsData = [];
const oBallArea = $(".ball-area");
const oGameArea = $(".game-area");
const oArrow = $(".arrow");
const oBullet = $(".bullet");
const size = 44;
const maxH = oBallArea.offsetHeight;
const maxW = oBallArea.offsetWidth;
const maxRows = ~~(maxH / size);
const maxColumns = ~~(maxW / size);
let bullet = { color: "red" };
let idx = 0;
init();
initArrow();
initBullte();

/**
 * @description: 初始化小球并将其隐藏
 * @return {*}
 */
function init() {
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < maxRows; i++) {
    let isOdd = !(i % 2 === 0);
    for (let j = 0; j < maxColumns - Number(isOdd); j++) {
      let ele = document.createElement("div");
      ele.classList.add("ball");
      ele.innerText = idx;
      let left = size * (j + (i % 2) / 2);
      let top = i * (size - (i && 6));
      let color = randomColor();
      let ball = new Proxy(
        {
          left,
          top,
          color,
          ele,
          connect: false,
          idx,
          row: i,
        },
        {
          set(target, key, value) {
            if (key === "connect" && value === false) {
              dropOff(ballsData[target.idx].ele);
            }
            target[key] = value;
          },
        }
      );
      fragment.appendChild(ele);
      ballsData.push(ball);
      idx++;
    }
  }
  oBallArea.append(fragment);
}

/**
 * @description: 初始化炮台的位置
 * @return {*}
 */
function initArrow() {
  setStyle(oArrow, {
    //初始化发射器的位置居中
    left: oBallArea.offsetWidth / 2 - oArrow.offsetWidth / 2 + "px",
    top: oBallArea.offsetHeight - 30 + "px",
  });
}

/**
 * @description: 初始化子弹的位置
 * @return {*}
 */
function initBullte() {
  let color = randomColor();
  oBullet.style.cssText = "";
  bullet.color = color;
  setStyle(oBullet, {
    display: "block",
    backgroundColor: color,
    left: oBallArea.offsetWidth / 2 - size / 2 + "px",
    top: oBallArea.offsetHeight + 5 + "px",
  });
}

/**
 * @description: 球的碰撞检测
 * @param {*} x
 * @param {*} y
 * @return {Object} balls 返回一个下标和最短距离
 */
function collisionBall({ x = 0, y = 0 } = {}) {
  //筛选出有连接的球
  let balls = ballsData.filter((item) => item.connect);
  //获取最短距离的位置
  balls = getCollisionsDistance(balls, x, y);
  if (balls.length === 0 && y < size / 2) {
    let topBall = ballsData.slice(0, 10).reduce((acc, curr) => {
      if (Math.abs(acc.left - x) >= Math.abs(curr.left - x)) {
        acc = curr;
      }
      return acc;
    });
    balls[0] = {
      idx: topBall.idx,
      distance: 0,
    };
  }
  return balls;
}

/**
 * @description: 获取球离六边形的球的距离(不为null的)
 * @param {*} balls
 * @param {*} x
 * @param {*} y
 * @return {Object}  一个对象包含球的下标和距离
 */
function getCollisionsDistance(balls, x, y) {
  return balls
    .map((item) => {
      let _x = item.left - x;
      let _y = item.top - y;
      let distance = Math.sqrt(_x * _x + _y * _y);
      if (distance < size) {
        return {
          idx: item.idx,
          distance,
        };
      }
      return null;
    })
    .filter((item) => item !== null);
}

/**
 * @description: 获取最短距离
 * @param {*} arr
 * @return {*}
 */
function getShortDistance(arr = []) {
  if (arr.length === 0) {
    return arr;
  }
  if (arr.length === 1) {
    return arr[0].idx;
  }
  return arr.reduce((acc, curr) => {
    if (acc.distance >= curr.distance) {
      acc = curr;
    }
    return acc;
  }).idx;
}

/**
 * @description: 根据下标寻找兄弟中距离目标最近的空位
 * @param {*} idx
 * @param {*} x
 * @param {*} y
 * @return {*}
 */
function getFreeSpace(idx, { x = 0, y = 0 } = {}) {
  if (ballsData[idx].connect === false) {
    return idx;
  }
  let balls = Object.entries(findSiblings(idx))
    .map(([key, value]) => value)
    .filter((item) => {
      return ballsData[item]?.connect === false;
    })
    .map((item) => ballsData[item]);
  return getShortDistance(getCollisionsDistance(balls, x, y));
}

oGameArea.addEventListener(
  "mousemove",
  function (e) {
    let ex = e.clientX,
      ey = e.clientY;
    let { top: oy, left: ox } = getPosition(oArrow);
    ox += oArrow.offsetWidth / 2;
    oy += 56;
    //计算箭头旋转中心与鼠标点的夹角
    let iAngle = Math.abs((Math.atan2(ey - oy, ex - ox) * 180) / Math.PI); //0-180 10-170
    iAngle = Math.min(170, Math.max(10, iAngle));
    iAngle = (-iAngle * Math.PI) / 180;
    iAngle += Math.PI / 2;
    oArrow.style.transform = `rotate(${(iAngle * 180) / Math.PI}deg)`;
  },
  false
);

oBallArea.addEventListener(
  "mousedown",
  function () {
    let timer,
      speed = 18;
    let _speedX = speed;
    //发射子弹，子弹发射角度
    let iAngle = Number(oArrow.style.transform.match(/rotate\((.+)deg\)/)?.[1]);
    clearInterval(timer);
    timer = setInterval(() => {
      let x = oBullet.offsetLeft,
        y = oBullet.offsetTop;
      if (x < 0 || x > oBallArea.offsetWidth - size) {
        _speedX *= -1;
      }

      let collisionBalls = collisionBall({ x, y });
      if (collisionBalls?.length > 0) {
        //最短距离的球的下标数组
        let collisionIdx = getShortDistance(collisionBalls);
        //寻找碰撞到的球的最近的非连接的兄弟球的下标
        let targetIdx = getFreeSpace(collisionIdx, { x, y });
        //命中处理
        hitTarget(targetIdx);
        clearInterval(timer);
        return false;
      }

      //判断是否发生碰撞
      x += _speedX * Math.cos(((iAngle - 90) * Math.PI) / 180);
      y += speed * Math.sin(((iAngle - 90) * Math.PI) / 180);

      oBullet.style.left = x + "px";
      oBullet.style.top = y + "px";
    }, 1000 / 60);
  },
  false
);

/**
 * @description: 命中目标后处理置换球 三色消除 失根消除 重置子弹
 * @param {*} idx
 */
function hitTarget(idx) {
  let target = ballsData[idx];
  placeBall(target, bullet.color);
  let colorBalls = findSeriesNode([idx], true);
  if (colorBalls.length >= 3) {
    colorBalls.forEach((item) => (ballsData[item].connect = false));
    traceConnect().forEach((item) => {
      ballsData[item].connect = false;
    });
  }
  initBullte();
}

/**
 * @description: 唤醒指定球放到对应位置
 * @param {*} ball
 * @param {*} color
 */
function placeBall(ball, color = "") {
  //将连接状态改为已连接
  ball.connect = true;
  //改变颜色
  ball.color = color || randomColor();
  ball.ele.style.cssText = "";
  //设置css属性
  setStyle(ball.ele, {
    display: "block",
    top: ball.top + "px",
    left: ball.left + "px",
    backgroundColor: ball.color,
  });
}

/**
 * @description: 小球掉落动画效果
 * @return {*}
 */
function animate({
  ele,
  styleJson = {},
  time = 300,
  speed = "linear",
  callback,
} = {}) {
  ele.style.transition = `${time}ms ${speed}`;
  setStyle(ele, styleJson);
  ele.addEventListener("transitionend", end, false);
  function end() {
    callback && callback();
    ele.removeEventListener("transitionend", end);
    ele.style.transition = "";
  }
}

/**
 * @description: 让对应dom 过渡样式( top增加 opacity减少
 * scale减少 ) 过渡结束之后 display:none
 * @param {*} ele
 */
function dropOff(ele) {
  animate({
    ele,
    styleJson: {
      top: ele.offsetTop + 40 + "px",
      opacity: 0,
      transform: "scale(.5)",
    },
    callback() {
      ele.style.cssText = "";
      setStyle(ele, {
        display: "none",
      });
    },
  });
}

/**
 * @description: 迭代获取balls中所有无法与根节点相连通的ball的下标
 * @return {*}
 */
function traceConnect() {
  let loseConnectBalls = [];
  for (let i = 0, len = ballsData.length; i < len; i++) {
    if (ballsData[i].connect === true) {
      let tempArr = findSeriesNode([i], false);
      let result = tempArr.some((item) => item < 10);
      if (!result) {
        loseConnectBalls.push(i);
      }
    }
  }
  return loseConnectBalls;
}
/* 
        同色消除
        失去支撑
      */

/**
 * @description: 递归寻找和点击ball的颜色相同的兄弟节点
 * @param {Array} sameColorSiblings
 * @param color
 * @return {Array} collectArr
 */
function findSeriesNode(sameColorSiblings = [], color) {
  let collectArr = sameColorSiblings.slice();
  recu(collectArr);
  function recu(arr) {
    for (let i = 0; i < arr.length; i++) {
      let siblings = getSameTypeSibilings(arr[i], color);
      siblings = siblings.filter(
        //过滤一下里面是不是已经有这个元素
        (item) => collectArr.indexOf(item) === -1
      );
      collectArr = collectArr.concat(siblings);
      if (siblings.length > 0) {
        recu(siblings);
      }
    }
  }
  return collectArr;
}

/**
 * @description: 寻找与中心点颜色相同的兄弟下标数组
 * @param {*} idx
 * @param color
 * @return {Array} 返回的是颜色一致的节点组成的数组
 */
function getSameTypeSibilings(idx, color = false) {
  return Object.entries(findSiblings(idx))
    .map(([key, value]) => value)
    .filter((item) => {
      //过滤出 对应下标 item 的ball的颜色是否和 ball[idx]的颜色是否一致
      if (!ballsData[item]) {
        return false;
      }
      let flag = ballsData[item].connect === true;
      if (color) {
        return flag && ballsData[item]?.color === ballsData[idx]?.color;
      }
      return flag;
    });
}

/**
 * @description: 传入下标 返回6角方向的兄弟节点
 * @param {*} idx
 * @return {*}
 */
function findSiblings(idx = 0) {
  let { tens, units } = getDigit(idx);
  return getRightSlot(idx, {
    tl: (tens - 1) * 10 + (units - 0),
    tr: (tens - 1) * 10 + (units + 1),
    ml: (tens - 0) * 10 + (units - 1),
    mr: (tens - 0) * 10 + (units + 1),
    bl: (tens + 1) * 10 + (units - 1),
    br: (tens + 1) * 10 + (units - 0),
  });
}

/**
 * @description: 将错误行或不存在行的项下标替换为null
 * @param {Number} idx
 * @param {Object} 六角兄弟节点的下标
 * @return {Object}重置后的兄弟下标对象
 */
function getRightSlot(idx = 0, { tl, tr, ml, mr, bl, br } = {}) {
  const diffRow = {
    t: -1,
    m: 0,
    b: 1,
  };
  let row = ballsData[idx].row;
  return Object.entries({ tl, tr, ml, mr, bl, br }).reduce(
    (acc, [key, value]) => {
      acc[key] =
        ballsData[value] &&
        isRightSlot(ballsData[value].row, row, diffRow[key[0]])
          ? value
          : null;
      return acc;
    },
    {}
  );
}

/**
 * @description: 判断某个兄弟节点的行号是否正确，防止点击边上的时候出现错行的情况
 * @param {*} sRow
 * @param {*} row
 * @param {*} padNum
 * @return {*}
 */
function isRightSlot(sRow, row, padNum) {
  return row + padNum === sRow;
}

/**
 * @description:  拆分数的十位和个位
 * @param {*} num
 * @return {*}
 */
function getDigit(num) {
  return {
    tens: ~~(num / 10),
    units: ~~(num % 10),
  };
}

/**
 * @description:  随机颜色
 * @return {*} 一个颜色
 */
function randomColor() {
  const COLORS = [
    "#fa5a5a",
    "#f0d264",
    "#82c8a0",
    "#7fccde",
    "#6698cb",
    "#cb99c5",
  ];
  return COLORS[~~(Math.random() * COLORS.length)];
}
