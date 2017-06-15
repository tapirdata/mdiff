import { StringOrArray } from "../src"

export default function simpleLcsLen(a: StringOrArray, b: StringOrArray): number {

  let c0
  const aLen = a.length
  const bLen = b.length

  const c = new Array(aLen + 1)
  c[0] = c0 = new Array(bLen + 1)
  let j = 0
  while (j <= bLen) {
    c0[j] = 0
    ++j
  }
  let i = 1
  while (i <= aLen) {
    c[i] = new Array(bLen + 1)
    c[i][0] = 0
    ++i
  }
  i = 0
  while (i < aLen) {
    j = 0
    while (j < bLen) {
      if (a[i] === b[j]) {
        c[i + 1][j + 1] = c[i][j] + 1
      } else {
        c[i + 1][j + 1] = Math.max(c[i + 1][j], c[i][j + 1])
      }
      ++j
    }
    ++i
  }
  return c[aLen][bLen]
}
