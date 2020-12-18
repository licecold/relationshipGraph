export const options = {
  arrowSize: 4,                                   // 箭头尺寸
  colors: colors(),                               // 默认颜色
  dragAble: true,                                 // 节点是否可拖拽
  highlight: undefined,                           // 是否开启选中高亮
  showIcons: true,
  iconMap: fontIcons(),                           // svg图标映射
  icons: undefined,                               // svg
  imageMap: {},
  images: undefined,
  minCollision: undefined,                        // 最小间距(默认两倍实体半径)
  data: undefined,                                // 图谱数据
  nodeOutlineFillColor: undefined,                // 节点填充色(默认类型)
  nodeOutlineStrokColor: undefined,               // 节点边框色(默认类型)
  nodeRadius: 60,                                 // 节点半径
  relationshipColor: "#a5abb6",                   // 关系线颜色(默认类型)
  zoomFit: false,                                 // 是否开启自动适配(引起图布局计算后自动居中缩放)
  zoomFitImmediate: false,                        // 是否开启初次布局后直接适配(仅在首次布局计算后执行)
  nodeOptions: {},                                // 节点配置(根据实体类型指定对应配置)
  linkOptions: {}                                 // 关系配置(根据实体类型指定对应配置)
}

export function colors() {
  return [
    "#68bdf6", // light blue
    "#6dce9e", // green #1
    "#faafc2", // light pink
    "#f2baf6", // purple
    "#ff928c", // light red
    "#fcea7e", // light yellow
    "#ffc766", // light orange
    "#405f9e", // navy blue
    "#a5abb6", // dark gray
    "#78cecb", // green #2,
    "#b88cbb", // dark purple
    "#ced2d9", // light gray
    "#e84646", // dark red
    "#fa5f86", // dark pink
    "#ffab1a", // dark orange
    "#fcda19", // dark yellow
    "#797b80", // black
    "#c9d96f", // pistacchio
    "#47991f", // green #3
    "#70edee", // turquoise
    "#ff75ea" // pink
  ];
}

export function fontIcons () {
  return {
    Self: 'f052'
  }
}

export function icon(d) {
  let code;
  if (options.iconMap && options.showIcons && options.icons) {
    if (options.icons[d.type] && options.iconMap[options.icons[d.type]]) {
      code = options.iconMap[options.icons[d.type]];
    } else if (options.iconMap[d.type]) {
      code = options.iconMap[d.type];
    } else if (options.icons[d.type]) {
      code = options.icons[d.type];
    }
  }

  return code;
}

export function image(d) {
  let i,
    imagesForLabel,
    img,
    imgLevel,
    label,
    labelPropertyValue,
    property,
    value;

  if (options.images) {
    imagesForLabel = options.imageMap[d.type];

    if (imagesForLabel) {
      imgLevel = 0;

      for (i = 0; i < imagesForLabel.length; i++) {
        labelPropertyValue = imagesForLabel[i].split("|");

        switch (labelPropertyValue.length) {
          case 3:
            value = labelPropertyValue[2];
          /* falls through */
          case 2:
            property = labelPropertyValue[1];
          /* falls through */
          case 1:
            label = labelPropertyValue[0];
        }

        if (
          d.labels[0] === label &&
          (!property || d.properties[property] !== undefined) &&
          (!value || d.properties[property] === value)
        ) {
          if (labelPropertyValue.length > imgLevel) {
            img = options.images[imagesForLabel[i]];
            imgLevel = labelPropertyValue.length;
          }
        }
      }
    }
  }

  return img;
}