import graph from "../graph.js";
import dataModel from "../../dataModel/dataModel.js";
import { options, icon, image } from '../../config/config.js'
import { textEllipsis } from '../../helper/text.js'
const node = {};

// 数据的任何更新都要对连线做更新 
node.updateNodes = function () {
    const data = node.updateData();
    node.removeElements(data.exit());
    node.addNewElements(data.enter());
    node.updateElements();
};

// node的更新集合
node.updateData = function () {
    const data = graph.svg.select('.nodes').selectAll(".node").data(dataModel.nodes, d => d.id);
    return data;
};

// 移除exit集合node
node.removeElements = function (exitingData) {
    exitingData.remove()
};

// 新增node结构和固有属性
node.addNewElements = function (enteringData) {

    var gNewNodeElements = enteringData
        .append("g")
        .attr("class", "node")
        .on("click", function(d) {
          if(options.dragAble){
            d.fx = d.fy = null;
          }
          if (typeof options.onNodeClick === "function") {
            options.onNodeClick(d);
          }
        })
        .on("contextmenu", function(d, i) {
          const el = window.event.target;
          d.fx = d.fy = null;
          if (typeof options.onNodeRightClick === "function") {
            const { menu, handler } = options.onNodeRightClick(d, i, el);
            if (!menu.length) return;

            d3.contextMenu(menu, {
              theme: function() {
                return "d3-context-menu-theme";
              },
              onOpen: handler(d, i, el),
              onClose: function(data, index) {
                // console.log('Menu Closed!', 'element:', this, 'data:', data, 'index:', index);
              },
              position: function(data, index) {
                var bounds = el.getBoundingClientRect();
                if (data === "green") {
                  // first circle will have the menu aligned top-right
                  return {
                    left: bounds.left + bounds.width + 10,
                    top: bounds.top
                  };
                }
              }
            })(d, i, this);
          }
        })
        .on("dblclick", function(d) {
          // stickNode(d)

          if (typeof options.onNodeDoubleClick === "function") {
            options.onNodeDoubleClick(d)
          }
        })
        .on("mouseenter", function(d) {
          if (typeof options.onNodeMouseEnter === "function") {
            options.onNodeMouseEnter(d);
          }
          d3.event.stopPropagation()
        }, true)
        .on("mouseleave", function(d) {
          if (typeof options.onNodeMouseLeave === "function") {
            options.onNodeMouseLeave(d);
          }
          d3.event.stopPropagation()
        }, true)
        .on('mousemove', function(d) {
          if (typeof options.onNodeMouseMove === "function") {
            options.onNodeMouseMove(d);
          }
        })

      // if(options.dragAble) {
      //   g.call(
      //     d3
      //       .drag()
      //       .on("start", dragStarted)
      //       .on("drag", dragged)
      //       .on("end", dragEnded)
      //   )
      // }
    node.appendOutlineToNode(gNewNodeElements);
    node.appendTextToNode(gNewNodeElements);
};

// 节点更新
node.updateElements = function () {
    var toUpdateElem = graph.svg.select('.nodes').selectAll(".node");
    toUpdateElem.attr("id", (d) => "node_" + d.id);
    toUpdateElem.attr("class", (d) => {
      let highlight,
        i,
        classes = `node node-${d.id}`;

      if (icon(d)) {
        classes += " node-icon";
      }

      if (image(d)) {
        classes += " node-image";
      }

      if (options.highlight) {
        for (i = 0; i < options.highlight.length; i++) {
          highlight = options.highlight[i];
          if (
            d.properties[highlight.property] === highlight.value
          ) {
            classes += " node-highlighted";
            break;
          }
        }
      }
      return classes;
    })

    node.updateTextToNode(toUpdateElem)
    node.updateOutlineToNode(toUpdateElem)

    toUpdateElem.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    function dragstarted(d) {
        if (!d3.event.active) graph.force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) graph.force.alphaTarget(0);
        if (d.fixed === false) {
            d.fx = null;
            d.fy = null;
        }
    }
};

// 节点circle path嵌入
node.appendOutlineToNode = function(node) {
  node
      .append("circle")
      .attr("class", "node_outline")
}

// 节点文字元素嵌入
node.appendTextToNode = function(node) {
  node
    .append('text')
    .attr('class', 'node_text')
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
}

// 节点文案更新
node.updateTextToNode = function(node) {
  node.select('.node_text')
    .attr('id', d => `node_text_${d.id}`)
    .attr("font-size", function(d) {
      return icon(d) ? options.nodeRadius + "px" : "10px";
    })
    .attr("y", function(d) {
      return icon(d)
        ? parseInt(Math.round(options.nodeRadius * 0.32)) + "px"
        : "4px";
    })
    .attr("font-size", function(d) {
      return "8px";
    })
    .attr("fill", function(d) {
      if (typeof options.nodeOptions[d.type]?.textColor === "function")
        return options.nodeOptions[d.type].textColor(d);
      return options.nodeOptions[d.type]?.textColor || "#";
    })
    .select(function(d) {
      const text = d.properties.name || ''
      const result = textEllipsis(text, options.nodeRadius * 1.4, 8, 5)
      d3.select(this).html('')
      result.forEach((t, i) => {
        const spliceCount = result.length
        const gap = 10
        const center = 4
        d3.select(this).append('tspan').attr('x', 0).attr('y', () => spliceCount % 2 ? center - parseInt(spliceCount / 2) * gap + gap * i : center - (gap / 2) - ((spliceCount / 2) -1) * gap + gap * i ).text(t)
      })

      // TODO: 图表对外提供配置入口
      if(d.self && !(window.graphExcept && window.graphExcept.edge.includes(d.selfType))) {
        appendIcon(d3.select(this.parentElement),d.selfType)
      }
    })

    function appendIcon(selectoin, type) {
      let fill = options.linkOptions[type].fill || options.relationshipColor
      if(typeof fill === 'function') fill = fill()
      selectoin.append('text')
      .attr('class', 'text icon')
      .attr('fill', fill)
      .attr('font-size', '20px')
      .attr('x', options.nodeRadius * 0.414)
      .attr('y', -options.nodeRadius * 0.414)
      .append(function (d) {
        var _icon = icon(d)
        const iconStr = '&#x' + _icon
        const div = document.createElement('div')
        div.innerHTML = '<svg>' + iconStr + '</svg>'
        const iconChildNodes = div.childNodes[0].childNodes
        return iconChildNodes[0]
      })
    }
}

// 节点基础样式更新
node.updateOutlineToNode = function (node) {
  node.select('.node_outline')
    .attr('id', d => `node_outline_${d.id}`)
    .attr("r", options.nodeRadius)
      .style("fill", function(d) {
        if(options.nodeOptions[d.type]?.fill) {
          if (typeof options.nodeOptions[d.type].fill === 'function') {
            return options.nodeOptions[d.type].fill(d)
          } else {
            return options.nodeOptions[d.type].fill
          }
        } else {
          return options.nodeOutlineFillColor;
        }
      })
      .style("stroke", function(d) {
        if(options.nodeOptions[d.type]?.stroke) {
          if (typeof options.nodeOptions[d.type].stroke === 'function') {
            return options.nodeOptions[d.type].stroke(d)
          } else {
            return options.nodeOptions[d.type].stroke
          }
        } else {
          return options.nodeOutlineStrokColor;
        }
      })
      // .append("title")
      // .text(function(d) {
      //   return toString(d);
      // });

}

/**
 * Function called to expand a node containing values.
 * This function will create the value nodes with the clicked node internal data.
 * Only nodes corresponding to the current page index will be generated.
 *
 * @param clickedNode
 */
node.expandNode = function (clickedNode) {

    // Get subset of node corresponding to the current node page and page size
    var lIndex = clickedNode.page * node.PAGE_SIZE;
    var sIndex = lIndex - node.PAGE_SIZE;

    var dataToAdd = clickedNode.data.slice(sIndex, lIndex);
    var parentAngle = graph.computeParentAngle(clickedNode);

    // Then each node are created and dispatched around the clicked node using computed coordinates.
    var i = 1;
    dataToAdd.forEach(function (d) {
        var angleDeg;
        if (clickedNode.parent) {
            angleDeg = (((360 / (dataToAdd.length + 1)) * i));
        } else {
            angleDeg = (((360 / (dataToAdd.length)) * i));
        }

        var nx = clickedNode.x + (100 * Math.cos((angleDeg * (Math.PI / 180)) - parentAngle)),
            ny = clickedNode.y + (100 * Math.sin((angleDeg * (Math.PI / 180)) - parentAngle));

        var n = {
            "parent": clickedNode,
            "x": nx,
            "y": ny,
        };

        dataModel.nodes.push(n);
        dataModel.links.push(
            {
              source: clickedNode,
              target: n,
            }
        );

        i++;
    });

    // Pin clicked node and its parent to avoid the graph to move for selection, only new value nodes will blossom around the clicked node.
    clickedNode.fixed = true;
    clickedNode.fx = clickedNode.x;
    clickedNode.fy = clickedNode.y;
    if (clickedNode.parent && clickedNode.parent.type !== node.NodeTypes.ROOT) {
        clickedNode.parent.fixed = true;
        clickedNode.parent.fx = clickedNode.parent.x;
        clickedNode.parent.fy = clickedNode.parent.y;
    }
    // Change node state
    clickedNode.valueExpanded = true;
    update();
};

export default node;