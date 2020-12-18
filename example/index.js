import * as ForceGraphD3 from '../src/index.js'

fetch('./mockData.json').then(response => response.json()).then(res=> {
  debugger
  ForceGraphD3.init('#graph', {
    // iterations: 5,
    alphaDecay: 0.0228,
    velocityDecay: 0.4,
    minCollision: 80,
    nodeRadius: 36,
    zoomFit: false,
    icons: {
      hive_table: 'Self',
      scheduler_job: 'Self'
    },
    data: res,
    nodeOutlineFillColor: '#970d0d',
    nodeOutlineStrokColor: '#e7cece',
    relationshipColor: '#a5abb6',
    onNodeDoubleClick(d) {
      ForceGraphD3.default.graph.modelDataUpdate(randomData(d, 10))
    },
    // onNodeRightClick: this.onNodeRightClick,
    // onNodeMouseEnter: this.onMouseEnter,
    // onNodeMouseLeave: debounce((d) => this.onMouseLeave(d), 200, true),
    // onRelationshipMouseEnter: (d) => this.onMouseEnter(d, 'edge'),
    // onRelationshipMouseLeave: debounce((d) => this.onMouseLeave(d), 200, true),
    // onNodeMouseMove: this.onMouseMove,
    // onRelationshipMouseMove: this.onMouseMove,
    // onNodeDragStart: this.onNodeDragStart,
    // onNodeDragEnd: this.onNodeDragEnd,
    nodeOptions: {
      typeA: {
        textColor: '#fff',
        fill(d) {
          if (d.center) {
            return '#9c0000'
          } else {
            return '#ff2d2d'
          }
        },
        stroke(d) {
          return '#000'
        }
      },
      typeB: {
        textColor: '#333',
        fill(d) {
          if (d.center) {
            return '#ffbe31'
          }
          return '#fdd681'
        },
        stroke(d) {
          return '#000'
        }
      },
      typeC: {
        textColor: '#fff',
        fill: 'darkCyan',
        stroke: '#000'
      }
    },
    linkOptions: {
      generate: {
        textColor: '#042349',
        fill: '#333'
      },
      join: {
        textColor: '#042349',
        fill: '#da4307'
      }
    }
  })
})




function randomData(d, maxNodesToGenerate) {
  var data = {
      nodes: [],
      links: []
    },
    numNodes = ((maxNodesToGenerate * Math.random()) << 0) + 1

  for (let i = 0; i < numNodes; i++) {
    const r = Math.random() * 10
    const node = {
      id: new Date().valueOf() + `${Math.random() * 10000}`,
      type: r < 5? 'typeA' : r >= 5 && r <= 7 ? 'typeB' : 'typeC' ,
      properties: {
        name: Mock.mock('@name')
      },
      x: d.x,
      y: d.y
    };

    data.nodes[data.nodes.length] = node;

   const links = {
      id: new Date().valueOf() + `${Math.random() * 50000}`,
      type: Math.random() - 0.5 > 0 ? 'generate' : 'join',
      from: d.id,
      to: node.id,
      properties: {
        name: Mock.mock('@cname')
      }
    };

    data.links[data.links.length] = links;
  }

  return data;
}