import { expect } from "chai"

import mdiff from "../src"
import { Index, Options, StringOrArray } from "../src"
import simpleLcsLen from "./simpleLcsLen"

function __range__(left: Index, right: Index, inclusive: boolean): Index[] {
  const range: Index[] = []
  const ascending = left < right
  const end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}

interface Entry {a: string, b: string, options?: Options}

const entries: Entry[] = [
  {
    a: "",
    b: "",
  },
  {
    a: "A",
    b: "",
  },
  {
    a: "",
    b: "A",
  },
  {
    a: "A",
    b: "A",
  },
  {
    a: "A",
    b: "B",
  },
  {
    a: "ABCD",
    b: "ABCD",
  },
  {
    a: "XABCD",
    b: "ABCD",
  },
  {
    a: "AXBCD",
    b: "ABCD",
  },
  {
    a: "ABXCD",
    b: "ABCD",
  },
  {
    a: "ABCXD",
    b: "ABCD",
  },
  {
    a: "ABCDX",
    b: "ABCD",
  },
  {
    a: "ABCD",
    b: "XABCD",
  },
  {
    a: "ABCD",
    b: "AXBCD",
  },
  {
    a: "ABCD",
    b: "ABXCD",
  },
  {
    a: "ABCD",
    b: "ABCXD",
  },
  {
    a: "ABCD",
    b: "ABCDX",
  },
  {
    a: "ABCABBA",
    b: "CBABAC",
  },
  {
    a: "ABCABBAC",
    b: "CBABAC",
  },
  {
    a: "AXBYCZZD",
    b: "ABCD",
  },
  {
    a: "ABCD",
    b: "AXBYCZZD",
  },
  {
    a: "JFHCKJBECH",
    b: "KACJJCGJE",
  },
]

interface RandomOptions { minLen?: Index, maxLen?: Index, alpLen?: Index }

function randomString(options: RandomOptions) {
  const alp = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let { minLen } = options
  if (minLen == null) {
    minLen = 0
  }
  let { maxLen } = options
  if (maxLen == null) {
    maxLen = 40
  }
  let { alpLen } = options
  if (alpLen == null) {
    alpLen = 26
  }

  const len: number = minLen + Math.floor(Math.random() * ((maxLen - minLen) + 1))
  const a = new Array<string>(len)
  const iterable = __range__(0, len, false)
  for (const i of iterable) {
    a[i] = alp[Math.floor(Math.random() * alpLen)]
  }
  return a.join("")
}

function randomEntry(options: RandomOptions) {
  const a = randomString(options)
  const b = randomString(options)
  return { a, b }
}

interface CheckOptions {
  asArray: boolean,
}

function checkCommon(entry: Entry, options: CheckOptions) {
  let a: StringOrArray
  let b: StringOrArray
  if (options.asArray) {
    a = entry.a.split("")
    b = entry.b.split("")
  } else {
    a = entry.a
    b = entry.b
  }
  let lcsLen = 0

  function collect(aS: Index, aE: Index, bS: Index, bE: Index) {
    expect(aE).to.be.gt(aS)
    expect(bE).to.be.gt(bS)
    expect(aE - aS).to.be.equal(bE - bS)
    lcsLen += aE - aS
    return __range__(aS, aE, false).map((aIdx) => {
      const bIdx = (aIdx - aS) + bS
      return expect(a[aIdx]).to.be.equal(b[bIdx])
    })
  }

  const diff = mdiff(a, b, entry.options)
  it("should yield fitting snakes", () => {
    diff.scanCommon(collect)
  })
  const refLcsLen = simpleLcsLen(a, b)
  it(`should have collectd length ${refLcsLen}`, () => {
    expect(lcsLen).to.be.equal(refLcsLen)
  })
  it(`should have length ${refLcsLen}`, () => {
    expect(diff.getLcs()).to.have.length(refLcsLen)
  })
}

function checkDiff(entry: Entry) {
  const a: string[] = entry.a.split("")
  const b: string[] = entry.b.split("")
  const a1: string[] = a.concat([])
  let aDelta = 0
  function patch(aS: Index, aE: Index, bS: Index, bE: Index) {
    const part = b.slice(bS, bE)
    const aIdx = aS + aDelta
    a1.splice(aIdx, aE - aS, ...part)
    return aDelta += (bE + aS) - bS - aE
  }

  const diff = mdiff(a, b, entry.options)
  return it("should transform", () => {
    diff.scanDiff(patch)
    return expect(a1.join("")).to.be.equal(entry.b)
  },
  )
}

describe("mdiff", () => {

  const randNum = 200
  const alpLen = 12

  describe("common", () => {

    describe("fix string", () => {
      entries.map((entry) => {
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: false}))
      })
    })

    describe("fix array", () => {
      entries.map((entry) => {
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: true}))
      })
    })

    describe("random string", () => {
      return __range__(0, randNum, false).map((n) => {
        const entry  = randomEntry({alpLen})
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: false}))
      })
    })

    describe("random array", () => {
      return __range__(0, randNum, false).map((n) => {
        const entry  = randomEntry({alpLen})
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: true}))
      })
    })
  })

  describe("diff", () => {

    describe("fix", () => {
      entries.map((entry) => {
        describe(`'${entry.a}', '${entry.b}'`, () => {
          checkDiff(entry)
        })
      })
    })

    describe("random", () => {
      return __range__(0, randNum, false).map((n) => {
        const entry  = randomEntry({maxLen: alpLen})
        describe(`'${entry.a}', '${entry.b}'`, () => checkDiff(entry))
      })
    })

    describe("custom comperator", () => {
      const a = ["alice", "bob", "carol", "Dan"]
      const b = ["Alice", "Bob", "CAROL", "eve", "dan"]
      describe(`${a} ${b}`, () => {
        it("should have an distance of 9 with default compare", () => {
          const diff = mdiff(a, b)
          return expect(diff.scanCommon()).to.be.equal(9)
        })
        it("should have an distance of 1 with special equal compare", () => {
          const diff = mdiff(a, b, {equal(aVal, bVal) { return aVal.toUpperCase() === bVal.toUpperCase() }})
          return expect(diff.scanCommon()).to.be.equal(1)
        })
        return it("should have an distance of 1 with special indexEqual compare", () => {
          const aUpper = a.map((x) => x.toUpperCase)
          const bUpper = b.map((x) => x.toUpperCase)
          const diff = mdiff(a, b, {indexEqual(aIdx, bIdx) { return aUpper[aIdx] === bUpper[bIdx] }})
          return expect(diff.scanCommon()).to.be.equal(1)
        })
      })
    })
  })
})
