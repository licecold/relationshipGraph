
/**
 * text 超长省略（多行省略）
 * @param str
 * @param width
 * @param fontsize
 * @param line 行数
 */
export function textEllipsis(
  str,
  width,
  fontsize,
  line = 1
) {
  let curLen = 0
  let result = []
  let start = 0
  let end = 0

  for (let i = 0; i < str.length; i++) {
    if (result.length === line) {
      break
    }

    let code = str.charCodeAt(i)
    let pixelLen = code > 255 ? fontsize : fontsize / 2

    curLen += pixelLen

    if (curLen > width) {
      end = i
      if (result.length === line - 1) {
        end = end - 2 < 0 ? 0 : end - 2
        result.push(str.substring(start, end) + '...')
      } else {
        result.push(str.substring(start, end))
      }
      start = i
      curLen = pixelLen
    }
    if (i === str.length - 1 && result.length !== line) {
      end = i
      result.push(str.substring(start, end + 1))
    }
  }

  return result
}