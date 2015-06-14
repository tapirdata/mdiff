'use strict'

chai = require 'chai'
expect = chai.expect

lcs = require '../src'

entries = [
  {
    a: 'ABCABBAC'
    b: 'CBABAC'
    commonLen: 5
  }  
]

check = (entry) ->
  a = entry.a.split ''
  b = entry.b.split ''
  lcs = lcs a, b, entry.options
  commonLen = 0

  # console.log lcs.getCommon()

  collector = (aS, aE, bS, bE) ->
    expect(aE).to.be.gt aS
    expect(bE).to.be.gt bS
    expect(aE-aS).to.be.equal bE-bS
    commonLen += aE - aS
    for aIdx in [aS...aE]
      bIdx = aIdx - aS + bS
      expect(a[aIdx]).to.be.equal b[bIdx]

  lcs.scanAll collector
  expect(commonLen).to.be.equal entry.commonLen


describe 'lcs', ->
  for entry in entries
    it "should #{entry.a}, #{entry.b} ", -> 
      check entry


