// 根据角度计算终点坐标
function rotate(cx, cy, x, y, angle) {
    const radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) + sin * (y - cy) + cx,
      ny = cos * (y - cy) - sin * (x - cx) + cy;
  
    return { x: nx, y: ny };
  }

// 获取坐标  
const rotatePoint = (c, p, angle) => rotate(c.x, c.y, p.x, p.y, angle)

// 获取角度
const rotation = (source, target) => (Math.atan2(target.y - source.y, target.x - source.x) * 180) / Math.PI

// 根据线长获取终点坐标
function unitaryVector(source, target, newLength) {
  var length =
    Math.sqrt(
      Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)
    ) / Math.sqrt(newLength || 1) || 1;

  return {
    x: (target.x - source.x) / length,
    y: (target.y - source.y) / length
  };
}

// 获取相对坐标的实际坐标点
function unitaryNormalVector(source, target, newLength) {
  var center = { x: 0, y: 0 },
    vector = unitaryVector(source, target, newLength);
  return rotatePoint(center, vector, 90);
}

export default {
  rotate,
  rotation,
  rotatePoint,
  unitaryNormalVector,
  unitaryVector
}