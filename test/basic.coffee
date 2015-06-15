'use strict'

chai = require 'chai'
expect = chai.expect

mDiff = require '../src'
simpleLcsLen = require './simpleLcsLen'


entries = [
  {
    a: ''
    b: ''
  }  
  {
    a: 'A'
    b: ''
  }  
  {
    a: ''
    b: 'A'
  }  
  {
    a: 'A'
    b: 'A'
  }  
  {
    a: 'A'
    b: 'B'
  }  
  {
    a: 'ABCD'
    b: 'ABCD'
  }  
  {
    a: 'XABCD'
    b: 'ABCD'
  }  
  {
    a: 'AXBCD'
    b: 'ABCD'
  }  
  {
    a: 'ABXCD'
    b: 'ABCD'
  }  
  {
    a: 'ABCXD'
    b: 'ABCD'
  }  
  {
    a: 'ABCDX'
    b: 'ABCD'
  }  
  {
    a: 'ABCD'
    b: 'XABCD'
  }  
  {
    a: 'ABCD'
    b: 'AXBCD'
  }  
  {
    a: 'ABCD'
    b: 'ABXCD'
  }  
  {
    a: 'ABCD'
    b: 'ABCXD'
  }  
  {
    a: 'ABCD'
    b: 'ABCDX'
  }  
  {
    a: 'ABCABBA'
    b: 'CBABAC'
  }  
  {
    a: 'ABCABBAC'
    b: 'CBABAC'
  }  
]

randomList = (options) ->
  alp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  options or= {}
  minLen = options.minLen
  if not minLen?
    minLen = 0
  maxLen = options.maxLen
  if not maxLen?
    maxLen = 40
  alpLen = options.alpLen
  if not alpLen?
    alpLen = 26
  
  len = minLen + Math.trunc Math.random() * (maxLen - minLen + 1)  
  a = new Array len
  for i in [0...len]
    a[i] = alp[Math.trunc Math.random() * alpLen]
  a.join ''


randomEntry = (options) ->
  a = randomList options
  b = randomList options
  a: a
  b: b

  

check = (entry) ->
  a = entry.a.split ''
  b = entry.b.split ''
  diff = mDiff a, b, entry.options
  lcsLen = 0

  collector = (aS, aE, bS, bE) ->
    expect(aE).to.be.gt aS
    expect(bE).to.be.gt bS
    expect(aE-aS).to.be.equal bE-bS
    lcsLen += aE - aS
    for aIdx in [aS...aE]
      bIdx = aIdx - aS + bS
      expect(a[aIdx]).to.be.equal b[bIdx]

  it "should yield fitting snakes", -> 
    diff.scanAll collector
  refLcsLen = simpleLcsLen a, b
  it "should have length #{refLcsLen}", -> 
    expect(lcsLen).to.be.equal refLcsLen


describe 'lcs', ->
  describe 'fix', ->
    for entry in entries
      describe "'#{entry.a}', '#{entry.b}'", -> 
        check entry

  describe 'random', ->
    for n in [0...1000]
      entry  = randomEntry alpLen: 12
      describe "'#{entry.a}', '#{entry.b}'", -> 
        check entry



