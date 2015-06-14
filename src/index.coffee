
debug = require('debug') 'myers-lcsd'

class Lcs
  constructor: (@a, @b, options) ->
    debug 'Lcs(a=%o b=%o)', @a, @b
    @options = options || {}

  equal: (idxA, idxB) ->
    @a[idxA] == @b[idxB]


class Frame
  constructor: (@lcs, @aFirst, @bFirst, @aLast, @bLast) ->
    @aLen = @aLast - @aFirst + 1 
    @bLen = @bLast - @bFirst + 1 
    # @firstDelta = @aFirst - @bFirst
    # @lastDelta = @aLast - @bLast
    @lenDelta = @bLen - @aLen
    @totalLen = @aLen + @bLen
    @deltaOdd = @delta % 2 == 1  


  findMiddleSnake: (maxDh) ->
    contourLen = 2 * maxDh + 1
    fContours = new Array contourLen 
    bContours = new Array contourLen 
    fContours[maxDh + 1] = 0
    bContours[maxDh - 1] = 0
    for d in [0..maxDh]
      if 0
        debug 'findMiddleSnake: (f) d=%o fContours=%o', d, fContours
        for k in [-d..d] by 2
          dirB = k == -d or (k != d and fContours[maxDh + k - 1] < fContours[maxDh + k + 1])
          preK = if dirB then k + 1 else k - 1
          debug 'findMiddleSnake: (f) k=%o dirB=%o preK=%o', k, dirB, preK
          preContour = fContours[maxDh + preK]
          aS = @aFirst + preContour
          bS = @bFirst + preContour - preK
          if dirB then ++bS else ++aS
          aE = aS
          bE = bS
          while aE <= @aLast && bE <= @bLast && @lcs.equal aE, bE
            ++aE
            ++bE
          debug 'findMiddleSnake: (f) (%o, %o) ... (%o, %o)', aS, bS, aE, bE
          fContours[maxDh + k] = aE - @aFirst
          if aE > @aLast and bE > @bLast
            return
      if 1
        debug 'findMiddleSnake: (b) d=%o bContours=%o', d, bContours
        for k in [-d..d] by 2
          dirB = k == d or (k != -d and bContours[maxDh + k - 1] > bContours[maxDh + k + 1])
          preK = if dirB then k - 1 else k + 1
          debug 'findMiddleSnake: (b) k=%o dirB=%o preK=%o', k, dirB, preK
          preContour = bContours[maxDh + preK]
          aE = @aLast + 1 - preContour
          bE = @bLast + 1 - preContour - preK
          if dirB then --bE else --aE
          aS = aE
          bS = bE
          while aS > @aFirst && bS > @bFirst && @lcs.equal aS - 1 , bS - 1
            --aS
            --bS
          debug 'findMiddleSnake: (b) (%o, %o) ... (%o, %o)', aS, bS, aE, bE
          bContours[maxDh + k] = @aLast + 1 - aS 
          if aS <= @aFirst and bS <= @bFirst
            return
        
a = 'ABCABBA'.split ''
b = 'CBABAC'.split ''

lcs = new Lcs a, b
frame = new Frame lcs, 0, 0, a.length - 1, b.length - 1
frame.findMiddleSnake frame.totalLen
# frame.findMiddleSnake 3

