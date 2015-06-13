
debug = require('debug') 'myers-lcsd'

class Lcs
  constructor: (@a, @b, options) ->
    debug 'Lcs(a=%o b=%o)', @a, @b
    @options = options || {}

  equal: (idxA, idxB) ->
    @a[idxA] == @b[idxB]


class Frame
  constructor: (@lcs, @firstA, @firstB, @lastA, @lastB) ->
    @lenA = @lastA - @firstA + 1 
    @lenB = @lastB - @firstB + 1 
    @firstDelta = @firstA - @firstB
    @lastDelta = @lastA - @lastB
    @deltaLen = @lenB - @lenA
    @totalLen = @lenA + @lenB
    @deltaOdd = @delta % 2 == 1  


  findMiddleSnake: (maxDh) ->
    fContours = {}
    fContours[1] = 0
    bContours = {}
    bContours[-1] = 0
    for d in [0..maxDh]
      if 1
        debug 'findMiddleSnake: (f) d=%o fContours=%o', d, fContours
        for k in [-d..d] by 2
          dirB = k == -d or (k != d and fContours[k - 1] < fContours[k + 1])
          preK = if dirB then k + 1 else k - 1
          debug 'findMiddleSnake: (f) k=%o dirB=%o preK=%o', k, dirB, preK
          preContour = fContours[preK]
          startA = @firstA + preContour
          startB = @firstB + preContour - preK
          midA = if dirB then startA else startA + 1
          midB = midA - @firstDelta - k
          endA = midA
          endB = midB
          while endA <= @lastA && endB <= @lastB && @lcs.equal endA, endB
            ++endA
            ++endB
          debug 'findMiddleSnake: (f) start=%o,%o mid=%o,%o end=%o,%o', startA, startB, midA, midB, endA, endB
          fContours[k] = endA - @firstA
          if endA > @lastA and endB > @lastB
            return
      if 0
        debug 'findMiddleSnake: (b) d=%o bContours=%o', d, bContours
        for k in [-d..d] by 2
          dirB = k == d or (k != -d and bContours[k - 1] > bContours[k + 1])
          preK = if dirB then k - 1 else k + 1
          debug 'findMiddleSnake: (b) k=%o dirB=%o preK=%o', k, dirB, preK
          preContour = bContours[preK]
          startA = @lastA - preContour
          startB = @lastB - preContour - preK
          midA = if dirB then startA else startA - 1
          midB = midA - @lastDelta - k
          endA = midA
          endB = midB
          # debug 'findMiddleSnake: (b) start=%o,%o mid=%o,%o', startA, startB, midA, midB
          while endA >= @firstA && endB >= @firstB && @lcs.equal endA, endB
            --endA
            --endB
          debug 'findMiddleSnake: (b) start=%o,%o mid=%o,%o end=%o,%o', startA, startB, midA, midB, endA, endB
          bContours[k] = @lastA - endA
          if endA < @firstA and endB < @firstB
            return
        
a = 'ABCABBA'.split ''
b = 'CBABAC'.split ''

lcs = new Lcs a, b
frame = new Frame lcs, 0, 0, a.length - 1, b.length - 1
frame.findMiddleSnake frame.totalLen
# frame.findMiddleSnake 3

