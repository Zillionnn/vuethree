import * as THREE from 'three'

export const addBillboard = (scene, x, labelWidth, fontSize, nameArray, labelPosition, labelBgColor, labelOutlineColor, lineColor, linePositionArray, pointColor, pointPosition) => {
  const canvas = makeLabelCanvas(labelWidth, labelWidth / 2, fontSize, nameArray, labelBgColor, labelOutlineColor)

  const texture = new THREE.CanvasTexture(canvas)
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  const labelMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  })

  const root = new THREE.Object3D()
  root.position.x = x

  const label = new THREE.Sprite(labelMaterial)
  root.add(label)
  // canvas 位置
  label.position.x = labelPosition.x
  label.position.y = labelPosition.y
  label.position.z = labelPosition.z

  // if units are meters then 0.01 here makes size
  // of the label into centimeters.
  const labelBaseScale = 0.01
  label.scale.x = canvas.width * labelBaseScale
  label.scale.y = canvas.height * labelBaseScale

  scene.add(root)
  addLine(scene, lineColor, linePositionArray)
  addShape(scene, pointColor, pointPosition)

  return root
}

function makeLabelCanvas (baseWidth, height, fontSize, nameArray, backgroundColor, outlineColor) {
  const borderSize = 2
  const ctx = document.createElement('canvas').getContext('2d')
  const font = `${fontSize}px bold sans-serif`
  ctx.font = font
  // measure how long the name will be
  const textWidth = ctx.measureText(nameArray[0]).width

  const doubleBorderSize = borderSize * 2
  const width = baseWidth + doubleBorderSize
  ctx.canvas.width = width
  ctx.canvas.height = height

  // need to set font again after resizing canvas
  ctx.font = font
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 30
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeRect(0, 0, width, height)

  // scale to fit but don't stretch
  const scaleFactor = Math.min(1, baseWidth / textWidth)
  ctx.translate(width / 1.2, height / 2)
  ctx.scale(scaleFactor, 1)
  ctx.fillStyle = 'white'
  for (let i = 0; i < nameArray.length; i++) {
    const baseWidth = nameArray[i]
    ctx.fillText(baseWidth, 0, i * fontSize)
  }

  return ctx.canvas
}

function addShape (scene, color, position) {
  var circleRadius = 1
  var geometry = new THREE.CircleGeometry(circleRadius, 32)

  var material = new THREE.MeshBasicMaterial({ color: color })
  material.transparent = true
  material.opacity = 0.5

  var circle = new THREE.Mesh(geometry, material)
  circle.position.set(position[0], position[1], position[2])

  var circleRadius1 = 0.5
  var geometry1 = new THREE.CircleGeometry(circleRadius1, 32)

  var material1 = new THREE.MeshBasicMaterial({ color: color })

  var circle1 = new THREE.Mesh(geometry1, material1)
  circle1.position.set(position[0], position[1], position[2])

  scene.add(circle)
  scene.add(circle1)
}
// 添加线
function addLine (scene, color, pointsArray) {
  var material = new THREE.LineBasicMaterial({ color: color })

  let points = []
  for (let item of pointsArray) {
    points.push(new THREE.Vector3(item[0], item[1], item[2]))
  }

  var geometry = new THREE.BufferGeometry().setFromPoints(points)
  var line = new THREE.Line(geometry, material)
  scene.add(line)
}
