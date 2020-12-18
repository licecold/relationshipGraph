import graph from './graph/graph.js'
import { options } from './config/config.js'
import dataModel, { transformDataToD3Data, computeLinkNumber } from './dataModel/dataModel.js'

export function init(_selector, _options) {
  Object.assign(options, _options)
  const container = d3.select(_selector)
  container.attr('class', 'forceD3').html('')
  transformDataToD3Data(_options.data, 'replace')
  computeLinkNumber()
  graph.appendGraph(container)
  graph.createForceLayout()
  updateGraph()
}

export function updateGraph() {
  graph.link.updateLinks();
  graph.node.updateNodes();
  graph.force.nodes(dataModel.nodes);
  graph.force.force("link").links(dataModel.links);
  graph.force.alpha(1).restart();
}


export default {
  graph,
  dataModel
}