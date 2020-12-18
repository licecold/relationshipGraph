const dataModel = {
  nodes: [],
  links: []
};

/**
 * 数据录入和转换
 * @param {*} data 传入的数据
 * @param {*} type update => 数据更新  replace => 数据覆盖
 */
export function transformDataToD3Data(data, type='update') {
  Object.keys(data).forEach(key => {
    if (/node/.test(key)) {
      type === 'update' ? graphDataUpdate(data[key], 'nodes') : dataModel.nodes = data[key]
    }
    if(/link|edge|relation/.test(key)) {
      type === 'update' ? graphDataUpdate(data[key], 'links') : dataModel.links = data[key]
    }
  })

  function graphDataUpdate(inputList, type) {
    inputList.forEach(item => {
      const idx = dataModel[type].findIndex(n => n.id === item.id)
      if(idx === -1) {
        dataModel[type].push(item)
      } else {
        dataModel[type][idx] = item
      }
    })
  }
}

// 计算linkNum 用于作用于相同的节点的连线间距计算
export function computeLinkNumber() {
  // 无论出入 只要 出入对应的id 一直则为一组
  let linkMap = new Map();
  dataModel.links.forEach(relationship => {
    relationship.source = relationship.from;
    relationship.target = relationship.to;
    //  将target from 通过正序和倒序 无论真虚倒序有一种相同则同属于一组
    const forward = `${relationship.target}${relationship.source}`,
      inverted = `${relationship.source}${relationship.target}`;
    if (linkMap.has(forward) || linkMap.has(inverted)) {
      let item = linkMap.has(forward)
        ? linkMap.get(forward)
        : linkMap.get(inverted);
      item.push(relationship);
    } else {
      linkMap.set(forward, [relationship]);
    }
    // dataModel.links.push(relationship);
  });
  for (const relationship of dataModel.links) {
    const forward = `${relationship.target}${relationship.source}`,
      inverted = `${relationship.source}${relationship.target}`;
    if (linkMap.has(forward) || linkMap.has(inverted)) {
      let group = linkMap.has(forward)
        ? linkMap.get(forward)
        : linkMap.get(inverted);

      setLinkNumber(group);
    }
  }
}

// 计算连接数(记录在relation上, 处理多条关系计算连线用)
function setLinkNumber(group) {
  if (group.length == 0) {
    return;
  }
  if (group.length == 1) {
    group[0].linknum = 0;
    return;
  }
  const maxLinkNumber =
    group.length % 2 == 0 ? group.length / 2 : (group.length - 1) / 2;

  if (group.length % 2 == 0) {
    let startLinkNum = -maxLinkNumber + 0.5;

    for (let i = 0; i < group.length; i++) {
      group[i].linknum = startLinkNum++;
    }
  } else {
    let startLinkNum = -maxLinkNumber;

    for (let i = 0; i < group.length; i++) {
      group[i].linknum = startLinkNum++;
    }
  }
}

export default dataModel