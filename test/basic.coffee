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
  {
    a: 'AXBYCZZD'
    b: 'ABCD'
  }  
  {
    a: 'ABCD'
    b: 'AXBYCZZD'
  }  
  # {
  #   a: 'JFHCKJBECH'
  #   b: 'KACJJCGJE'
  # }  
]

randomString = (options) ->
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
  a = randomString options
  b = randomString options
  a: a
  b: b

checkCommon = (entry, options) ->
  options or= {}
  if options.asArray
    a = entry.a.split ''
    b = entry.b.split ''
  else  
    a = entry.a
    b = entry.b
  lcsLen = 0

  collect = (aS, aE, bS, bE) ->
    expect(aE).to.be.gt aS
    expect(bE).to.be.gt bS
    expect(aE-aS).to.be.equal bE-bS
    lcsLen += aE - aS
    for aIdx in [aS...aE]
      bIdx = aIdx - aS + bS
      expect(a[aIdx]).to.be.equal b[bIdx]

  diff = mDiff a, b, entry.options
  it "should yield fitting snakes", -> 
    diff.scanCommon collect
  refLcsLen = simpleLcsLen a, b
  it "should have length #{refLcsLen}", -> 
    expect(lcsLen).to.be.equal refLcsLen


checkDiff = (entry, options) ->
  options or= {}
  a = entry.a.split ''
  b = entry.b.split ''
  a1 = a.concat [] 
  aDelta = 0
  patch = (aS, aE, bS, bE) ->
    # console.log 'patch a=%s b=%s, a1=%s, aDelta=%s', entry.a, entry.b, a1.join(''), aDelta
    # console.log 'patch %s...%s -> %s...%s', aS, aE, bS, bE
    part = b.slice bS, bE
    aIdx = aS + aDelta
    a1.splice.apply a1, [aIdx, aE - aS].concat part
    aDelta += bE + aS - bS - aE 
    # console.log 'patch a1=%s, aDelta=%s', a1.join(''), aDelta

  diff = mDiff a, b, entry.options
  it "should transform", -> 
    diff.scanDiff patch
    expect(a1.join '').to.be.equal entry.b




describe 'mdiff', ->

  randNum = 200
  alpLen = 12

  describe 'common', ->

    describe 'fix string', ->
      for entry in entries
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkCommon entry, asArray: false

    describe 'fix array', ->
      for entry in entries
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkCommon entry, asArray: true

    describe 'random string', ->
      for n in [0...randNum]
        entry  = randomEntry alpLen: alpLen
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkCommon entry, asArray: false

    describe 'random array', ->
      for n in [0...randNum]
        entry  = randomEntry alpLen: alpLen
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkCommon entry, asArray: true

  describe 'diff', ->

    describe 'fix', ->
      for entry in entries
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkDiff entry

    describe 'random', ->
      for n in [0...randNum]
        entry  = randomEntry maxLen: alpLen
        describe "'#{entry.a}', '#{entry.b}'", -> 
          checkDiff entry

