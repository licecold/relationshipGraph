import dataModel, {
  transformDataToD3Data,
  computeLinkNumber
} from "../dataModel/dataModel.js";
import link from "./link/link.js";
import node from "./node/node.js";
import helper from "../helper/coordinate.js";
import { updateGraph } from "../index.js";
import { options } from "../config/config.js";

const { rotation, rotatePoint, unitaryNormalVector, unitaryVector } = helper;

const graph = {};

graph.link = link;
graph.node = node;

graph.zoom = d3.zoom().scaleExtent([0.1, 10]);

graph.appendGraph = function(container) {
  graph.svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "force-graph")
    .call(graph.zoom.on("zoom", graph.rescale))
    .on("dblclick.zoom", null)
    .append("g")
    .attr("width", "100%")
    .attr("height", "100%");

  graph.svgRelationships = graph.svg.append("g").attr("class", "relationships");

  graph.svgNodes = graph.svg.append("g").attr("class", "nodes");
};

graph.CHARGE = -500;

// simulationForce layout
// TODO: 布局调优
graph.createForceLayout = function() {
  graph.force = d3
    .forceSimulation()
    .force(
      "charge",
      d3.forceManyBody().strength(function(d) {
        return -1200;
      }).distanceMax(2000)
    )
    // .force(
    //   "collide",
    //   d3
    //     .forceCollide()
    //     .radius(function(d) {
    //       return options.nodeRadius + 5;
    //     })
    // )
    .force(
      "center",
      d3.forceCenter(graph.getSVGWidth() / 2, graph.getSVGHeight() / 2)
    )
    .force(
      "link",
      d3
        .forceLink()
        .id(function(d) {
          return d.id;
        })
        .distance(function(link) {
          return 200;
        })
    );

  graph.force.nodes(dataModel.nodes);
  graph.force.force("link").links(dataModel.links);
  graph.force.on("tick", graph.tick);
};

// tick回调(定位点和线)
graph.tick = function() {
  graph.tickNodes();
  graph.tickRelationships();
};

graph.tickNodes = function() {
  graph.svgNodes.selectAll(".node").attr("transform", d => {
    return "translate(" + d.x + ", " + d.y + ")";
  });
};

// 关系线每一帧的位置定位
graph.tickRelationships = function() {
  graph.svgRelationships.selectAll(".relationship").attr("transform", d => {
    var angle = rotation(d.source, d.target);
    return (
      "translate(" + d.source.x + ", " + d.source.y + ") rotate(" + angle + ")"
    );
  });
  graph.tickRelationshipsTexts();
  graph.tickRelationshipsOutlines();
  graph.tickRelationshipsOverlays();
};

// 根据当前帧定位计算文案定位
graph.tickRelationshipsTexts = function() {
  graph.svgRelationships.selectAll(".text").attr("transform", function(d) {
    var angle = (rotation(d.source, d.target) + 360) % 360,
      mirror = angle > 90 && angle < 270,
      center = { x: 0, y: 0 },
      n = unitaryNormalVector(d.source, d.target),
      nWeight = mirror ? 2 : -3,
      point = {
        x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
        y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight
      },
      rotatedPoint = rotatePoint(center, point, angle);

    // 双向link间距
    let offset = 0;

    if (d.linknum !== 0) {
      offset = (40 * d.linknum) / 3;
    }

    let topLineOffset, bottomLineOffset;

    if (angle > 0) {
      topLineOffset = offset;
      bottomLineOffset = offset;
    } else {
      topLineOffset = -offset;
      bottomLineOffset = -offset;
    }

    return `translate(${
      rotatedPoint.x
    }, ${rotatedPoint.y + (mirror ? offset : -offset)}) rotate(${mirror ? 180 : 0})`;
  });
};
// 根据当前帧定位计算outLine
graph.tickRelationshipsOutlines = function() {
  graph.svgRelationships.selectAll(".relationship").each(function() {
    var rel = d3.select(this),
      outline = rel.select(".outline"),
      text = rel.select(".text"),
      bbox = text.node().getBBox(),
      padding = 3;

    outline.attr("d", function(d) {
      // TODO: 连线样式太难调整
      const { type, text: innerText } = d;
      let { arrowSize } = options;

      const noArrowTypeList = ["join"],
        center = { x: 0, y: 0 },
        angle = rotation(d.source, d.target),
        targetX = d.target.x,
        sourceX = d.source.x,
        targetY = d.target.y,
        sourceY = d.source.y,
        toIntersectionLength = options.nodeRadius,
        fromIntersectionLength = options.nodeRadius;
      arrowSize = noArrowTypeList.includes(type) ? 0 : arrowSize;
      let offset = 0;

      if (d.linknum !== 0) {
        offset = (40 * d.linknum) / 3;
      }

      const textBoundingBox = text.node().getBBox(),
        textPadding = innerText ? 5 : 0,
        u = unitaryVector(d.source, d.target),
        textMargin = {
          x:
            (targetX - sourceX - (textBoundingBox.width + textPadding) * u.x) *
            0.5,
          y:
            (targetY - sourceY - (textBoundingBox.width + textPadding) * u.y) *
            0.5
        },
        n = unitaryNormalVector(d.source, d.target),
        rotatedPointA1 = rotatePoint(
          center,
          {
            x: 0 + fromIntersectionLength * u.x - n.x,
            y: 0 + fromIntersectionLength * u.y - n.y
          },
          angle
        ),
        rotatedPointB1 = rotatePoint(
          center,
          { x: textMargin.x - n.x, y: textMargin.y - n.y },
          angle
        ),
        rotatedPointC1 = rotatePoint(
          center,
          { x: textMargin.x, y: textMargin.y },
          angle
        ),
        rotatedPointD1 = rotatePoint(
          center,
          {
            x: 0 + fromIntersectionLength * u.x,
            y: 0 + fromIntersectionLength * u.y
          },
          angle
        ),
        rotatedPointA2 = rotatePoint(
          center,
          {
            x: targetX - sourceX - textMargin.x - n.x,
            y: targetY - sourceY - textMargin.y - n.y
          },
          angle
        ),
        rotatedPointB2 = rotatePoint(
          center,
          {
            x:
              targetX -
              sourceX -
              (toIntersectionLength + 1) * u.x -
              n.x -
              u.x * arrowSize,
            y:
              targetY -
              sourceY -
              (toIntersectionLength + 1) * u.y -
              n.y -
              u.y * arrowSize
          },
          angle
        ),
        rotatedPointC2 = rotatePoint(
          center,
          {
            x:
              targetX -
              sourceX -
              (toIntersectionLength + 1) * u.x -
              n.x +
              (n.x - u.x) * arrowSize,
            y:
              targetY -
              sourceY -
              (toIntersectionLength + 1) * u.y -
              n.y +
              (n.y - u.y) * arrowSize
          },
          angle
        ),
        rotatedPointD2 = rotatePoint(
          center,
          {
            x: targetX - sourceX - (toIntersectionLength + 1) * u.x,
            y: targetY - sourceY - (toIntersectionLength + 1) * u.y
          },
          angle
        ),
        rotatedPointE2 = rotatePoint(
          center,
          {
            x:
              targetX -
              sourceX -
              (toIntersectionLength + 1) * u.x +
              (-n.x - u.x) * arrowSize,
            y:
              targetY -
              sourceY -
              (toIntersectionLength + 1) * u.y +
              (-n.y - u.y) * arrowSize
          },
          angle
        ),
        rotatedPointF2 = rotatePoint(
          center,
          {
            x:
              targetX -
              sourceX -
              (toIntersectionLength + 1) * u.x -
              u.x * arrowSize,
            y:
              targetY -
              sourceY -
              (toIntersectionLength + 1) * u.y -
              u.y * arrowSize
          },
          angle
        ),
        rotatedPointG2 = rotatePoint(
          center,
          {
            x: targetX - sourceX - textMargin.x,
            y: targetY - sourceY - textMargin.y
          },
          angle
        ),
        relAngle = (rotation(d.source, d.target) + 360) % 360,
        mirror = relAngle > 90 && relAngle < 270;

      return `
        M ${rotatedPointA1.x} ${rotatedPointA1.y + (mirror ? offset : -offset)}
        L ${rotatedPointB1.x} ${rotatedPointB1.y + (mirror ? offset : -offset)}
        L ${rotatedPointC1.x} ${rotatedPointC1.y + (mirror ? offset : -offset)}
        L ${rotatedPointD1.x} ${rotatedPointD1.y + (mirror ? offset : -offset)}
        Z M ${
          rotatedPointA2.x
        } ${rotatedPointA2.y + (mirror ? offset : -offset)}
        L ${rotatedPointB2.x} ${rotatedPointB2.y + (mirror ? offset : -offset)}
        L ${rotatedPointC2.x} ${rotatedPointC2.y + (mirror ? offset : -offset)}
        L ${rotatedPointD2.x} ${rotatedPointD2.y + (mirror ? offset : -offset)}
        L ${rotatedPointE2.x} ${rotatedPointE2.y + (mirror ? offset : -offset)}
        L ${rotatedPointF2.x} ${rotatedPointF2.y + (mirror ? offset : -offset)}
        L ${rotatedPointG2.x} ${rotatedPointG2.y + (mirror ? offset : -offset)}
        Z
      `;
    });
  });
};
// 根据当前帧定位计算overlays定位
graph.tickRelationshipsOverlays = function() {
  graph.svgRelationships.selectAll(".relationship").each(function () {
    const rel = d3.select(this),
          overlay = rel.select('.overlay')
    overlay.attr("d", function(d) {
      const center = { x: 0, y: 0 },
        angle = rotation(d.source, d.target),
        n1 = unitaryNormalVector(d.source, d.target),
        n = unitaryNormalVector(d.source, d.target, 50);
  
      // 双向link间距
      let offset = 0;
  
      if (d.linknum !== 0) {
        offset = (40 * d.linknum) / 3;
      }
  
      const rotatedPointA = rotatePoint(
          center,
          { x: 0 - n.x, y: 0 - n.y },
          angle
        ),
        rotatedPointB = rotatePoint(
          center,
          {
            x: d.target.x - d.source.x - n.x,
            y: d.target.y - d.source.y - n.y
          },
          angle
        ),
        rotatedPointC = rotatePoint(
          center,
          {
            x: d.target.x - d.source.x + n.x - n1.x,
            y: d.target.y - d.source.y + n.y - n1.y
          },
          angle
        ),
        rotatedPointD = rotatePoint(
          center,
          {
            x: 0 + n.x - n1.x,
            y: 0 + n.y - n1.y
          },
          angle
        ),
        relAngle = (rotation(d.source, d.target) + 360) % 360,
        mirror = relAngle > 90 && relAngle < 270;
  
      return `
        M ${rotatedPointA.x} ${rotatedPointA.y + (mirror ? offset : -offset)}
        L ${rotatedPointB.x} ${rotatedPointB.y + (mirror ? offset : -offset)}
        L ${rotatedPointC.x} ${rotatedPointC.y + (mirror ? offset : -offset)}
        L ${rotatedPointD.x} ${rotatedPointD.y + (mirror ? offset : -offset)}
        Z
      `;
    });
  })
};

// 新增数据
graph.modelDataUpdate = function(data) {
  transformDataToD3Data(data);
  computeLinkNumber();
  updateGraph();
};

// 容器宽度
graph.getSVGWidth = function() {
  if (typeof graph.svg == "undefined" || graph.svg.empty()) {
    return 0;
  } else {
    return graph.svg.node().parentElement.parentElement.clientWidth;
  }
};

// 容器高度
graph.getSVGHeight = function() {
  if (typeof graph.svg == "undefined" || graph.svg.empty()) {
    return 0;
  } else {
    return graph.svg.node().parentElement.parentElement.clientHeight;
  }
};

graph.computeParentAngle = function(n) {
  var angleRadian = 0;
  var r = 100;
  if (n.parent) {
    var xp = n.parent.x;
    var yp = n.parent.y;
    var x0 = n.x;
    var y0 = n.y;
    var dist = Math.sqrt(Math.pow(xp - x0, 2) + Math.pow(yp - y0, 2));

    var k = r / (dist - r);
    var xc = (x0 + k * xp) / (1 + k);

    var val = (xc - x0) / r;
    if (val < -1) {
      val = -1;
    }
    if (val > 1) {
      val = 1;
    }

    angleRadian = Math.acos(val);

    if (yp > y0) {
      angleRadian = 2 * Math.PI - angleRadian;
    }
  }
  return angleRadian;
};

/**
 * Function to call on SVG zoom event to update the svg transform attribute.
 */
graph.rescale = function() {
  var transform = d3.event.transform;
  if (isNaN(transform.x) || isNaN(transform.y) || isNaN(transform.k)) {
    graph.svg.attr("transform", d3.zoomIdentity);
  } else {
    graph.svg.attr("transform", transform);
  }
};

export default graph;
