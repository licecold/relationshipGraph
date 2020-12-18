const fs = require('fs')
const path = require('path')

fs.readFile(path.join(__dirname, './data.json'), 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  const typeList = [
    'typeA',
    'typeB',
    'typeC'
  ]
  data = JSON.parse(data)
  data.nodes = data.nodes.map(node => {
    const ran = parseInt(Math.random() * 10)
    return {
      id: node.id,
      type: ran < 5 ? typeList[0] : ran >= 5 && ran <= 7 ? typeList[1] : typeList[2],
      properties: {
        name: mock.title(2,5),
      }
    }
  })
  data.links = data.links.map(link => ({
    id: link.id,
    from: link.from,
    to: link.to,
    type: link.type,
    properties: {
      name: mock.cword(4)
    }
  }))

  fs.writeFile(path.join(__dirname, './mockData.json'), JSON.stringify(data), err => {
    if(err) {
      console.log(err)
      return
    }

  })

})

function natural(min, max) {
  min = typeof min !== 'undefined' ? parseInt(min, 10) : 0
  max = typeof max !== 'undefined' ? parseInt(max, 10) : 9007199254740992 // 2^53
  return Math.round(Math.random() * (max - min)) + min
}

function character(pool) {
  var pools = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      number: '0123456789',
      symbol: '!@#$%^&*()[]'
  }
  pools.alpha = pools.lower + pools.upper
  pools['undefined'] = pools.lower + pools.upper + pools.number + pools.symbol

  pool = pools[('' + pool).toLowerCase()] || pool
  return pool.charAt(natural(0, pool.length - 1))
}

function range(defaultMin, defaultMax, min, max) {
  return min === undefined ? natural(defaultMin, defaultMax) : // ()
      max === undefined ? min : // ( len )
      natural(parseInt(min, 10), parseInt(max, 10)) // ( min, max )
}

const mock = {
  // 随机生成一段文本。
  paragraph: function (min, max) {
    var len = range(3, 7, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(this.sentence())
    }
    return result.join(' ')
  },
  // 
  cparagraph: function (min, max) {
    var len = range(3, 7, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(this.csentence())
    }
    return result.join('')
  },
  // 随机生成一个句子，第一个单词的首字母大写。
  sentence: function (min, max) {
    var len = range(12, 18, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(this.word())
    }
    return Helper.capitalize(result.join(' ')) + '.'
  },
  // 随机生成一个中文句子。
  csentence: function (min, max) {
    var len = range(12, 18, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(this.cword())
    }

    return result.join('') + '。'
  },
  // 随机生成一个单词。
  word: function (min, max) {
    var len = range(3, 10, min, max)
    var result = '';
    for (var i = 0; i < len; i++) {
      result += character('lower')
    }
    return result
  },
  // 随机生成一个或多个汉字。
  cword: function (pool, min, max) {
    // 最常用的 500 个汉字 http://baike.baidu.com/view/568436.htm
    var DICT_KANZI = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞'

    var len
    switch (arguments.length) {
      case 0: // ()
        pool = DICT_KANZI
        len = 1
        break
      case 1: // ( pool )
        if (typeof arguments[0] === 'string') {
          len = 1
        } else {
          // ( length )
          len = pool
          pool = DICT_KANZI
        }
        break
      case 2:
        // ( pool, length )
        if (typeof arguments[0] === 'string') {
          len = min
        } else {
          // ( min, max )
          len = natural(pool, min)
          pool = DICT_KANZI
        }
        break
      case 3:
        len = natural(min, max)
        break
    }

    var result = ''
    for (var i = 0; i < len; i++) {
      result += pool.charAt(natural(0, pool.length - 1))
    }
    return result
  },
  // 随机生成一句标题，其中每个单词的首字母大写。
  title: function (min, max) {
    var len = range(3, 7, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(Helper.capitalize(this.word()))
    }
    return result.join(' ')
  },
  // 随机生成一句中文标题。
  ctitle: function (min, max) {
    var len = range(3, 7, min, max)
    var result = []
    for (var i = 0; i < len; i++) {
      result.push(this.cword())
    }
    return result.join('')
  }
}

const Helper = {
  // 把字符串的第一个字母转换为大写。
  capitalize: function (word) {
    return (word + '').charAt(0).toUpperCase() + (word + '').substr(1)
  },
  // 把字符串转换为大写。
  upper: function (str) {
    return (str + '').toUpperCase()
  },
  // 把字符串转换为小写。
  lower: function (str) {
    return (str + '').toLowerCase()
  },
  // 从数组中随机选取一个元素，并返回。
  pick: function pick(arr, min, max) {
    // pick( item1, item2 ... )
    if (!Util.isArray(arr)) {
      arr = [].slice.call(arguments)
      min = 1
      max = 1
    } else {
      // pick( [ item1, item2 ... ] )
      if (min === undefined) min = 1

      // pick( [ item1, item2 ... ], count )
      if (max === undefined) max = min
    }

    if (min === 1 && max === 1) return arr[natural(0, arr.length - 1)]

    // pick( [ item1, item2 ... ], min, max )
    return this.shuffle(arr, min, max)

    // 通过参数个数判断方法签名，扩展性太差！#90
    // switch (arguments.length) {
    // 	case 1:
    // 		// pick( [ item1, item2 ... ] )
    // 		return arr[natural(0, arr.length - 1)]
    // 	case 2:
    // 		// pick( [ item1, item2 ... ], count )
    // 		max = min
    // 			/* falls through */
    // 	case 3:
    // 		// pick( [ item1, item2 ... ], min, max )
    // 		return this.shuffle(arr, min, max)
    // }
  },
  /*
      打乱数组中元素的顺序，并返回。
      Given an array, scramble the order and return it.
      其他的实现思路：
          // https://code.google.com/p/jslibs/wiki/JavascriptTips
          result = result.sort(function() {
              return Math.random() - 0.5
          })
  */
  shuffle: function shuffle(arr, min, max) {
    arr = arr || []
    var old = arr.slice(0),
      result = [],
      index = 0,
      length = old.length;
    for (var i = 0; i < length; i++) {
      index = natural(0, old.length - 1)
      result.push(old[index])
      old.splice(index, 1)
    }
    switch (arguments.length) {
      case 0:
      case 1:
        return result
      case 2:
        max = min
        /* falls through */
      case 3:
        min = parseInt(min, 10)
        max = parseInt(max, 10)
        return result.slice(0, natural(min, max))
    }
  },
  /*
      * Random.order(item, item)
      * Random.order([item, item ...])
      顺序获取数组中的元素
      [JSON导入数组支持数组数据录入](https://github.com/thx/RAP/issues/22)
      不支持单独调用！
  */
  order: function order(array) {
    order.cache = order.cache || {}

    if (arguments.length > 1) array = [].slice.call(arguments, 0)

    // options.context.path/templatePath
    var options = order.options
    var templatePath = options.context.templatePath.join('.')

    var cache = (
      order.cache[templatePath] = order.cache[templatePath] || {
        index: 0,
        array: array
      }
    )

    return cache.array[cache.index++ % cache.array.length]
  }
}