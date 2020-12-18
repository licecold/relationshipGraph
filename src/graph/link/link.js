import graph from "../graph.js"
import { options } from "../../config/config.js"
import dataModel from "../../dataModel/dataModel.js"

var link = {}

// 数据的任何更新都要对连线做更新
// TODO: 避免影响布局
link.updateLinks = function () {
  var data = link.updateData()
  link.removeElements(data.exit())
  link.addNewElements(data.enter())
  link.updateElements()
}

// link更新集合
link.updateData = function () {
  return graph.svg
    .select(".relationships")
    .selectAll(".relationship")
    .data(dataModel.links, (d) => d.id)
}

// 新增link结构和固有属性
link.addNewElements = function (enteringData) {
  const newLinkElements = enteringData
    .append("g")
    .attr("class", "relationship")
    .on("dblclick", function (d) {
      if (typeof options.onRelationshipDoubleClick === "function") {
        options.onRelationshipDoubleClick(d)
      }
    })
    .on("click", function (d) {
      if (typeof options.onRelationshipClick === "function") {
        options.onRelationshipClick(d)
      }
    })
    .on("mouseenter", function (d) {
      if (typeof options.onRelationshipMouseEnter === "function") {
        options.onRelationshipMouseEnter(d)
      }
    })
    .on("mouseleave", function (d) {
      if (typeof options.onRelationshipMouseLeave === "function") {
        options.onRelationshipMouseLeave(d)
      }
    })
    .on("mousemove", function (d) {
      if (typeof options.onRelationshipMouseMove === "function") {
        options.onRelationshipMouseMove(d)
      }
    })

  link.appendTextToRelationship(newLinkElements)
  link.appendOutlineToRelationship(newLinkElements)
  link.appendOverlayToRelationship(newLinkElements)
}

// 移除exit集合link
link.removeElements = function (exitingData) {
  exitingData.remove()
}

// 更新连线(动态属性)(新加入的 和 有修改的)
link.updateElements = function () {
  var toUpdateElem = graph.svg
    .select(".relationships")
    .selectAll(".relationship")

  toUpdateElem.attr("id", (d) => d.id)

  toUpdateElem
    .selectAll(".outline")
    .attr("id", (d) => "path_" + d.id)
    .attr("fill", (d) => {
      const { type } = d
      if (d.from === d.to) {
        return "none"
      }
      return options.linkOptions[type]?.fill || options.relationshipColor
    })
    .attr("stroke", (d) => {
      if (d.from === d.to) {
        return "#000"
      }
      return "none"
    })

  toUpdateElem
    .selectAll("text")
    .attr("id", (d) => "text_" + d.id)
    .text((d) => d.properties.text)
}

// 文字样式
link.appendTextToRelationship = function (relationship) {
  relationship
    .append("text")
    .attr("class", "text")
    .attr("fill", "#000000")
    .attr("font-size", "8px")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
}

// 连线样式
link.appendOutlineToRelationship = function (relationship) {
  relationship.append("path").attr("class", "outline")
}

// 连线覆盖层样式
link.appendOverlayToRelationship = function (relationship) {
  relationship.append("path").attr("class", "overlay")
}

export default link
