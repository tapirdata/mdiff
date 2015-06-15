
simpleLcsLen = (a, b) ->

  aLen = a.length
  bLen = b.length
  # console.log 'aLen=%j bLen=%j', aLen, bLen

  c = new Array aLen + 1
  c[0] = c0 = new Array bLen + 1
  j = 0
  while j <= bLen
    c0[j] = 0
    ++j
  i = 1
  while i <= aLen 
    c[i] = new Array bLen + 1
    c[i][0] = 0
    ++i    
  # console.log 'c=%j', c  
  i = 0
  while i < aLen
    j = 0
    while j < bLen
      if a[i] == b[j]
        c[i+1][j+1] = c[i][j] + 1
      else  
        c[i+1][j+1] = Math.max c[i+1][j], c[i][j+1]
      ++j
    ++i  
  # console.log 'c=%j', c  
  return c[aLen][bLen]


module.exports = simpleLcsLen    

# a = 'ABCABBA'.split ''
# b = 'CBABAC'.split ''
#     
# console.log simpleLcsLen a, b

