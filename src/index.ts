export type Index = number;
export type StringOrArray = string | unknown[];
type ElementType<T extends StringOrArray> = T extends string ? string : T extends (infer TE)[] ? TE : never;

export interface Options<E> {
  indexEqual?: (aIdx: Index, bIdx: Index) => boolean;
  equal?: (a: E, b: E) => boolean;
}

export type CommonCb = (aS: Index, aE: Index, bS: Index, bE: Index) => void;
export type DiffCb = (aIdx: Index, aS: Index, bIdx: Index, bS: Index) => void;

interface Snake {
  d: number;
  aS: number;
  aE: number;
  bS: number;
  bE: number;
}

export class Diff<T extends StringOrArray = string, E = ElementType<T>> {
  protected a: T;
  protected b: T;

  constructor(a: T, b: T, options: Options<E> = {}) {
    // debug('Diff(a=%o b=%o)', a, b)
    this.a = a;
    this.b = b;
    if (options.indexEqual != null) {
      this.indexEqual = options.indexEqual;
    }
    if (options.equal != null) {
      this.equal = options.equal;
    }
  }

  public scanCommon(commonCb?: CommonCb, dMax?: Index): number | null {
    return this.scan(0, this.a.length, 0, this.b.length, commonCb, dMax);
  }

  public scanDiff(diffCb?: DiffCb, dMax?: Index): number | null {
    if (!diffCb) {
      return this.scanCommon(undefined, dMax);
    }
    let aIdx = 0;
    let bIdx = 0;
    const commonCb = (aS: Index, aE: Index, bS: Index, bE: Index) => {
      if (aIdx < aS || bIdx < bS) {
        diffCb(aIdx, aS, bIdx, bS);
      }
      aIdx = aE;
      return (bIdx = bE);
    };
    const d = this.scanCommon(commonCb, dMax);
    if (d != null) {
      const aLen = this.a.length;
      const bLen = this.b.length;
      if (aIdx < aLen || bIdx < bLen) {
        diffCb(aIdx, aLen, bIdx, bLen);
      }
    }
    return d;
  }

  public getLcs(dMax?: Index): T | null {
    let lcs: T;
    let commonCb: CommonCb;
    if (typeof this.a === 'string') {
      lcs = '' as T;
      commonCb = (aS, aE) => {
        const part = this.a.slice(aS, aE);
        lcs = ((lcs as string) + (part as string)) as T;
      };
    } else {
      lcs = [] as unknown as T;
      commonCb = (aS, aE) => {
        const part = this.a.slice(aS, aE);
        lcs = [...lcs, ...part] as T;
      };
    }
    const d = this.scanCommon(commonCb, dMax);
    // console.log("d=", d, "lcs=", lcs)
    if (d != null) {
      return lcs;
    } else {
      return null;
    }
  }

  protected equal(aVal: E, bVal: E): boolean {
    return aVal === bVal;
  }

  protected indexEqual(aIdx: Index, bIdx: Index): boolean {
    return this.equal(this.a[aIdx] as E, this.b[bIdx] as E);
  }

  protected findMiddleSnake(aBegin: Index, aEnd: Index, bBegin: Index, bEnd: Index, maxDh: Index): Snake | null {
    const aLen = aEnd - aBegin;
    const bLen = bEnd - bBegin;
    const lenDelta = bLen - aLen;
    // const totalLen = aLen + bLen;
    const deltaOdd = lenDelta % 2 !== 0;

    const contourLen = 2 * maxDh + 1;
    const foreContours = new Array<number>(contourLen);
    const backContours = new Array<number>(contourLen);
    foreContours[maxDh + 1] = 0;
    backContours[maxDh - 1] = 0;
    let d = 0;
    while (d <= maxDh) {
      // debug('findMiddleSnake: (f) d=%o foreContours=%o', d, foreContours);
      let k = -d;
      while (k <= d) {
        const dirB = k === -d || (k !== d && foreContours[maxDh + k - 1] < foreContours[maxDh + k + 1]);
        const preK = dirB ? k + 1 : k - 1;
        // debug('findMiddleSnake: (f) k=%o dirB=%o preK=%o', k, dirB, preK);
        const preContour = foreContours[maxDh + preK];
        let aS = aBegin + preContour;
        let bS = bBegin + preContour - preK;
        if (dirB) {
          ++bS;
        } else {
          ++aS;
        }
        let aE = aS;
        let bE = bS;
        while (aE < aEnd && bE < bEnd && this.indexEqual(aE, bE)) {
          ++aE;
          ++bE;
        }
        // debug('findMiddleSnake: (f) (%o, %o) ... (%o, %o)', aS, bS, aE, bE)
        foreContours[maxDh + k] = aE - aBegin;
        if (deltaOdd) {
          const backK = k + lenDelta;
          // debug('findMiddleSnake: (f) backK=%o', backK);
          if (-d < backK && backK < d) {
            const backContour = backContours[maxDh + backK];
            // debug('findMiddleSnake: (f) backK=%o backContour=%o', backK, backContour);
            if (aE + backContour >= aEnd) {
              return {
                d: 2 * d - 1,
                aS,
                aE,
                bS,
                bE,
              };
            }
          }
        }
        k += 2;
      }
      // debug('findMiddleSnake: (b) d=%o backContours=%o', d, backContours);
      k = -d;
      while (k <= d) {
        const dirB = k === d || (k !== -d && backContours[maxDh + k - 1] > backContours[maxDh + k + 1]);
        const preK = dirB ? k - 1 : k + 1;
        // debug('findMiddleSnake: (b) k=%o dirB=%o preK=%o', k, dirB, preK);
        const preContour = backContours[maxDh + preK];
        let aE = aEnd - preContour;
        let bE = bEnd - preContour - preK;
        if (dirB) {
          --bE;
        } else {
          --aE;
        }
        let aS = aE;
        let bS = bE;
        while (aS > aBegin && bS > bBegin && this.indexEqual(aS - 1, bS - 1)) {
          --aS;
          --bS;
        }
        // debug('findMiddleSnake: (b) (%o, %o) ... (%o, %o)', aS, bS, aE, bE);
        backContours[maxDh + k] = aEnd - aS;
        if (!deltaOdd) {
          const foreK = k - lenDelta;
          // debug('findMiddleSnake: (b) fore=%o', foreK);
          if (-d <= foreK && foreK <= d) {
            const foreContour = foreContours[maxDh + foreK];
            // debug('findMiddleSnake: (f) foreK=%o foreContour=%o', foreK, foreContour);
            if (aS - foreContour <= aBegin) {
              return {
                d: 2 * d,
                aS,
                aE,
                bS,
                bE,
              };
            }
          }
        }
        k += 2;
      }
      ++d;
    }
    return null;
  }

  protected scan(
    aBegin: Index,
    aEnd: Index,
    bBegin: Index,
    bEnd: Index,
    commonCb?: CommonCb,
    dMax?: Index,
  ): number | null {
    // debug('scan((%o, %o)...(%o, %o) dMax=%o)', aBegin, bBegin, aEnd, bEnd, dMax);
    const aLen = aEnd - aBegin;
    const bLen = bEnd - bBegin;
    if (aLen === 0 || bLen === 0) {
      return 0;
    }
    if (dMax == null) {
      dMax = aLen + bLen;
    }
    const maxDh = Math.ceil(dMax / 2);
    const ms = this.findMiddleSnake(aBegin, aEnd, bBegin, bEnd, maxDh);
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
        let l;
        if (aLen < bLen) {
          l = ms.aS - aBegin;
        } else {
          l = ms.bS - bBegin;
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
}

function factory<T extends StringOrArray>(a: T, b: T, options?: Options<ElementType<T>>): Diff<T> {
  return new Diff(a, b, options);
}

export default factory;
