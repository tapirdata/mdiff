// import * as _debug from 'debug';
// let debug = _debug.default('mdiff');


class Diff {
  constructor(a, b, options) {
    // debug('Diff(a=%o b=%o)', a, b)
    this.a = a;
    this.b = b;
    options = options || {};
    if (options.indexEqual != null) {
      this.indexEqual = options.indexEqual;
    }
    if (options.equal != null) {
      this.equal = options.equal;
    }
  }
    
  equal(aVal, bVal) {
    return aVal === bVal;
  }

  indexEqual(aIdx, bIdx) {
    return this.equal(this.a[aIdx], this.b[bIdx]);
  }

  findMiddleSnake(aBegin, aEnd, bBegin, bEnd, maxDh) {
    let aLen = aEnd - aBegin;
    let bLen = bEnd - bBegin;
    let lenDelta = bLen - aLen;
    let totalLen = aLen + bLen;
    let deltaOdd = lenDelta % 2 !== 0;

    let contourLen = (2 * maxDh) + 1;
    let foreContours = new Array(contourLen); 
    let backContours = new Array(contourLen); 
    foreContours[maxDh + 1] = 0;
    backContours[maxDh - 1] = 0;
    let d = 0;
    while (d <= maxDh) {
      // debug('findMiddleSnake: (f) d=%o foreContours=%o', d, foreContours);
      let k = -d;
      while (k <= d) {
        var dirB = k === -d || (k !== d && foreContours[(maxDh + k) - 1] < foreContours[maxDh + k + 1]);
        var preK = dirB ? k + 1 : k - 1;
        // debug('findMiddleSnake: (f) k=%o dirB=%o preK=%o', k, dirB, preK);
        var preContour = foreContours[maxDh + preK];
        var aS = aBegin + preContour;
        var bS = (bBegin + preContour) - preK;
        if (dirB) { ++bS; } else { ++aS; }
        var aE = aS;
        var bE = bS;
        while (aE < aEnd && bE < bEnd && this.indexEqual(aE, bE)) {
          ++aE;
          ++bE;
        }
        // debug('findMiddleSnake: (f) (%o, %o) ... (%o, %o)', aS, bS, aE, bE)
        foreContours[maxDh + k] = aE - aBegin;
        if (deltaOdd) {
          let backK = k + lenDelta;
          // debug('findMiddleSnake: (f) backK=%o', backK);
          if (-d < backK && backK < d) {
            let backContour = backContours[maxDh + backK];
            // debug('findMiddleSnake: (f) backK=%o backContour=%o', backK, backContour);
            if (aE + backContour >= aEnd) {
              return ({
                d: (2 * d) - 1,
                aS,
                aE,
                bS,
                bE
              });  
            }
          }
        }
        k += 2;
      }
      // debug('findMiddleSnake: (b) d=%o backContours=%o', d, backContours);
      k = -d;
      while (k <= d) {
        var dirB = k === d || (k !== -d && backContours[(maxDh + k) - 1] > backContours[maxDh + k + 1]);
        var preK = dirB ? k - 1 : k + 1;
        // debug('findMiddleSnake: (b) k=%o dirB=%o preK=%o', k, dirB, preK);
        var preContour = backContours[maxDh + preK];
        var aE = aEnd - preContour;
        var bE = bEnd - preContour - preK;
        if (dirB) { --bE; } else { --aE; }
        var aS = aE;
        var bS = bE;
        while (aS > aBegin && bS > bBegin && this.indexEqual(aS - 1, bS - 1)) {
          --aS;
          --bS;
        }
        // debug('findMiddleSnake: (b) (%o, %o) ... (%o, %o)', aS, bS, aE, bE);
        backContours[maxDh + k] = aEnd - aS; 
        if (!deltaOdd) {
          let foreK = k - lenDelta;
          // debug('findMiddleSnake: (b) fore=%o', foreK);
          if (-d <= foreK && foreK <= d) {
            let foreContour = foreContours[maxDh + foreK];
            // debug('findMiddleSnake: (f) foreK=%o foreContour=%o', foreK, foreContour);
            if (aS - foreContour <= aBegin) {
              return ({
                d: 2 * d,
                aS,
                aE,
                bS,
                bE
              });  
            }
          }
        }
        k += 2;
      }
      ++d;  
    }
  }

  scan(aBegin, aEnd, bBegin, bEnd, commonCb, dMax) {
    // debug('scan((%o, %o)...(%o, %o) dMax=%o)', aBegin, bBegin, aEnd, bEnd, dMax);
    let aLen = aEnd - aBegin;
    let bLen = bEnd - bBegin;
    if (aLen === 0 || bLen === 0) {
      return 0;
    }
    if (dMax == null) {
      dMax = aLen + bLen;
    }
    let maxDh = Math.ceil(dMax / 2);
    let ms = this.findMiddleSnake(aBegin, aEnd, bBegin, bEnd, maxDh);
    // debug('scan: (%o, %o)...(%o, %o) dMax=%o', aBegin, bBegin, aEnd, bEnd, dMax);
    // debug('scan: ms=%o', ms);
    if (ms == null) {
      return null;
    }
    if (ms.d === 0) {
      if (commonCb && ms.aE > ms.aS) {
        commonCb(ms.aS, ms.aE, ms.bS, ms.bE);
      }
    } else if (ms.d === 1) {
      if (commonCb) {
        if (aLen < bLen) {
          var l = ms.aS - aBegin;
        } else {
          var l = ms.bS - bBegin;
        }
        if (l > 0) {
          commonCb(aBegin, aBegin + l, bBegin, bBegin + l);
        }
        if (ms.aE > ms.aS) {
          commonCb(ms.aS, ms.aE, ms.bS, ms.bE);
        }
      }
    } else {
      this.scan(aBegin, ms.aS, bBegin, ms.bS, commonCb);
      // debug('scan: (%o, %o)...(%o, %o) dMax=%o', aBegin, bBegin, aEnd, bEnd, dMax);
      // debug('scan: ms=%o', ms);
      // debug('scan: -> %o %o', this.a.slice(ms.aS, ms.aE), this.b.slice(ms.bS, ms.bE));
      if (commonCb && ms.aE > ms.aS) {
        commonCb(ms.aS, ms.aE, ms.bS, ms.bE);
      }
      this.scan(ms.aE, aEnd, ms.bE, bEnd, commonCb);
    }
    return ms.d;
  }

  scanCommon(commonCb, dMax) {
    return this.scan(0, this.a.length, 0, this.b.length, commonCb, dMax);
  }

  scanDiff(diffCb, dMax) {
    if (!diffCb) {
      return this.scanCommon(null, dMax);
    }
    let aIdx = 0;
    let bIdx = 0;
    let commonCb = (aS, aE, bS, bE) => {
      if (aIdx < aS || bIdx < bS) {
        diffCb(aIdx, aS, bIdx, bS);
      }
      aIdx = aE;
      return bIdx = bE;
    };
    let d = this.scanCommon(commonCb, dMax);
    if (d != null) {
      let aLen = this.a.length;  
      let bLen = this.b.length;  
      if (aIdx < aLen || bIdx < bLen) {
        diffCb(aIdx, aLen, bIdx, bLen);
      }
    }
    return d;     
  }


  getLcs(dMax) {
    if (this.a.constructor === String) {
      var lcs = '';
      var commonCb = (aS, aE) => {
        // debug('aS=%o aE=%o', aS, aE);
        let part = this.a.slice(aS, aE);
        lcs += part;
      };
    } else {  
      var lcs = [];
      var commonCb = (aS, aE) => {
        let part = this.a.slice(aS, aE);
        lcs = lcs.concat(part);
      };
    }
    let d = this.scanCommon(commonCb, dMax);
    if (d != null) {
      return lcs;
    } else {
      return null;
    }
  }
}


let factory = (a, b, options) => new Diff(a, b, options);

export default factory;  

