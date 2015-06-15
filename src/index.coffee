
# debug = require('debug') 'myers-diff'

class Diff
  constructor: (@a, @b, options) ->
    # debug 'Lcs(a=%o b=%o)', @a, @b
    @options = options || {}
    
  equal: (aVal, bVal) ->
    aVal == bVal

  findMiddleSnake: (aBegin, aEnd, bBegin, bEnd, maxDh) ->
    aLen = aEnd - aBegin
    bLen = bEnd - bBegin
    lenDelta = bLen - aLen
    totalLen = aLen + bLen
    deltaOdd = lenDelta % 2 != 0

    contourLen = 2 * maxDh + 1
    foreContours = new Array contourLen 
    backContours = new Array contourLen 
    foreContours[maxDh + 1] = 0
    backContours[maxDh - 1] = 0
    d = 0
    while d <= maxDh
      # debug 'findMiddleSnake: (f) d=%o foreContours=%o', d, foreContours
      k = -d
      while k <= d
        dirB = k == -d or (k != d and foreContours[maxDh + k - 1] < foreContours[maxDh + k + 1])
        preK = if dirB then k + 1 else k - 1
        # debug 'findMiddleSnake: (f) k=%o dirB=%o preK=%o', k, dirB, preK
        preContour = foreContours[maxDh + preK]
        aS = aBegin + preContour
        bS = bBegin + preContour - preK
        if dirB then ++bS else ++aS
        aE = aS
        bE = bS
        while aE < aEnd && bE < bEnd && @equal @a[aE], @b[bE]
          ++aE
          ++bE
        # debug 'findMiddleSnake: (f) (%o, %o) ... (%o, %o)', aS, bS, aE, bE
        foreContours[maxDh + k] = aE - aBegin
        if deltaOdd
          backK = k + lenDelta
          # debug 'findMiddleSnake: (f) backK=%o', backK
          if -d < backK < d
            backContour = backContours[maxDh + backK]
            # debug 'findMiddleSnake: (f) backK=%o backContour=%o', backK, backContour
            if aE + backContour >= aEnd
              return (
                d: 2 * d - 1
                aS: aS
                aE: aE
                bS: bS
                bE: bE
              )  
        k += 2
      # debug 'findMiddleSnake: (b) d=%o backContours=%o', d, backContours
      k = -d
      while k <= d
        dirB = k == d or (k != -d and backContours[maxDh + k - 1] > backContours[maxDh + k + 1])
        preK = if dirB then k - 1 else k + 1
        # debug 'findMiddleSnake: (b) k=%o dirB=%o preK=%o', k, dirB, preK
        preContour = backContours[maxDh + preK]
        aE = aEnd - preContour
        bE = bEnd - preContour - preK
        if dirB then --bE else --aE
        aS = aE
        bS = bE
        while aS > aBegin && bS > bBegin && @equal @a[aS - 1] , @b[bS - 1]
          --aS
          --bS
        # debug 'findMiddleSnake: (b) (%o, %o) ... (%o, %o)', aS, bS, aE, bE
        backContours[maxDh + k] = aEnd - aS 
        if not deltaOdd
          foreK = k - lenDelta
          # debug 'findMiddleSnake: (b) fore=%o', foreK
          if -d <= foreK <= d
            foreContour = foreContours[maxDh + foreK]
            # debug 'findMiddleSnake: (f) foreK=%o foreContour=%o', foreK, foreContour
            if aS - foreContour <= aBegin
              return (
                d: 2 * d
                aS: aS
                aE: aE
                bS: bS
                bE: bE
              )  
        k += 2
      ++d  

  scan: (aBegin, aEnd, bBegin, bEnd, snakeCb, maxD) ->
    # debug 'scan((%o, %o)...(%o, %o) maxD=%o)', aBegin, bBegin, aEnd, bEnd, maxD
    aLen = aEnd - aBegin
    bLen = bEnd - bBegin
    if not maxD?
      maxD = aLen + bLen
    if aLen > 0 and bLen > 0
      maxDh = Math.ceil maxD / 2
      ms = @findMiddleSnake aBegin, aEnd, bBegin, bEnd, maxDh
      # debug 'scan: (%o, %o)...(%o, %o) maxD=%o', aBegin, bBegin, aEnd, bEnd, maxD
      # debug 'scan: ms=%o', ms
      if not ms?
        return null
      if ms.d == 0
        if snakeCb and ms.aE > ms.aS
          snakeCb ms.aS, ms.aE, ms.bS, ms.bE
      else if ms.d == 1
        if snakeCb
          if aLen < bLen
            l = ms.aS - aBegin
          else
            l = ms.bS - bBegin
          if l > 0
            snakeCb aBegin, aBegin + l, bBegin, bBegin + l
          else  
          if ms.aE > ms.aS
            snakeCb ms.aS, ms.aE, ms.bS, ms.bE
      else
        @scan aBegin, ms.aS, bBegin, ms.bS, snakeCb
        # debug 'scan: (%o, %o)...(%o, %o) maxD=%o', aBegin, bBegin, aEnd, bEnd, maxD
        # debug 'scan: ms=%o', ms
        # debug 'scan: -> %o %o', @a.slice(ms.aS, ms.aE), @b.slice(ms.bS, ms.bE)
        if snakeCb and ms.aE > ms.aS
          snakeCb ms.aS, ms.aE, ms.bS, ms.bE
        @scan ms.aE, aEnd, ms.bE, bEnd, snakeCb
      return ms.d

  scanAll: (snakeCb, maxD) ->
    @scan 0, @a.length, 0, @b.length, snakeCb, maxD

  getLcs: (maxD) ->
    lcs = []
    snakeCb = (aS, aE) =>
      console.log '%s..%s', aS, aE
      lcs = lcs.concat @a.slice aS, aE
    d = @scanAll snakeCb, maxD
    if d?
      lcs


factory = (a, b, options) ->
  new Diff a, b, options

module.exports = factory  

