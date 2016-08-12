import chai from 'chai';
let { expect } = chai;

import mDiff from '../src';
import simpleLcsLen from './simpleLcsLen';


let entries = [
  {
    a: '',
    b: ''
  },  
  {
    a: 'A',
    b: ''
  },  
  {
    a: '',
    b: 'A'
  },  
  {
    a: 'A',
    b: 'A'
  },  
  {
    a: 'A',
    b: 'B'
  },  
  {
    a: 'ABCD',
    b: 'ABCD'
  },  
  {
    a: 'XABCD',
    b: 'ABCD'
  },  
  {
    a: 'AXBCD',
    b: 'ABCD'
  },  
  {
    a: 'ABXCD',
    b: 'ABCD'
  },  
  {
    a: 'ABCXD',
    b: 'ABCD'
  },  
  {
    a: 'ABCDX',
    b: 'ABCD'
  },  
  {
    a: 'ABCD',
    b: 'XABCD'
  },  
  {
    a: 'ABCD',
    b: 'AXBCD'
  },  
  {
    a: 'ABCD',
    b: 'ABXCD'
  },  
  {
    a: 'ABCD',
    b: 'ABCXD'
  },  
  {
    a: 'ABCD',
    b: 'ABCDX'
  },  
  {
    a: 'ABCABBA',
    b: 'CBABAC'
  },  
  {
    a: 'ABCABBAC',
    b: 'CBABAC'
  },  
  {
    a: 'AXBYCZZD',
    b: 'ABCD'
  },  
  {
    a: 'ABCD',
    b: 'AXBYCZZD'
  }  
  // {
  //   a: 'JFHCKJBECH'
  //   b: 'KACJJCGJE'
  // }  
];

let randomString = function(options) {
  let alp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if (!options) { options = {}; }
  let { minLen } = options;
  if (minLen == null) {
    minLen = 0;
  }
  let { maxLen } = options;
  if (maxLen == null) {
    maxLen = 40;
  }
  let { alpLen } = options;
  if (alpLen == null) {
    alpLen = 26;
  }
  
  let len = minLen + Math.floor(Math.random() * ((maxLen - minLen) + 1));  
  let a = new Array(len);
  let iterable = __range__(0, len, false);
  for (let j = 0; j < iterable.length; j++) {
    let i = iterable[j];
    a[i] = alp[Math.floor(Math.random() * alpLen)];
  }
  return a.join('');
};


let randomEntry = function(options) {
  let a = randomString(options);
  let b = randomString(options);
  return {
    a,
    b
  };
};

let checkCommon = function(entry, options) {
  if (!options) { options = {}; }
  if (options.asArray) {
    var a = entry.a.split('');
    var b = entry.b.split('');
  } else {  
    var { a } = entry;
    var { b } = entry;
  }
  let lcsLen = 0;

  let collect = function(aS, aE, bS, bE) {
    let bIdx;
    expect(aE).to.be.gt(aS);
    expect(bE).to.be.gt(bS);
    expect(aE-aS).to.be.equal(bE-bS);
    lcsLen += aE - aS;
    return __range__(aS, aE, false).map((aIdx) =>
      (bIdx = (aIdx - aS) + bS,
      expect(a[aIdx]).to.be.equal(b[bIdx])));
  };

  let diff = mDiff(a, b, entry.options);
  it("should yield fitting snakes", () => diff.scanCommon(collect)
  );
  let refLcsLen = simpleLcsLen(a, b);
  return it(`should have length ${refLcsLen}`, () => expect(lcsLen).to.be.equal(refLcsLen)
  );
};


let checkDiff = function(entry, options) {
  if (!options) { options = {}; }
  let a = entry.a.split('');
  let b = entry.b.split('');
  let a1 = a.concat([]); 
  let aDelta = 0;
  let patch = function(aS, aE, bS, bE) {
    // console.log 'patch a=%s b=%s, a1=%s, aDelta=%s', entry.a, entry.b, a1.join(''), aDelta
    // console.log 'patch %s...%s -> %s...%s', aS, aE, bS, bE
    let part = b.slice(bS, bE);
    let aIdx = aS + aDelta;
    a1.splice.apply(a1, [aIdx, aE - aS].concat(part));
    return aDelta += (bE + aS) - bS - aE; 
  };
    // console.log 'patch a1=%s, aDelta=%s', a1.join(''), aDelta

  let diff = mDiff(a, b, entry.options);
  return it("should transform", function() { 
    diff.scanDiff(patch);
    return expect(a1.join('')).to.be.equal(entry.b);
  }
  );
};




describe('mdiff', function() {

  let randNum = 200;
  let alpLen = 12;

  describe('common', function() {

    describe('fix string', () =>
      entries.map((entry) =>
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: false})
        ))
    
    );

    describe('fix array', () =>
      entries.map((entry) =>
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: true})
        ))
    
    );

    describe('random string', function() {
      let entry;
      return __range__(0, randNum, false).map((n) =>
        (entry  = randomEntry({alpLen}),
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: false})
        )));
    }
    );

    return describe('random array', function() {
      let entry;
      return __range__(0, randNum, false).map((n) =>
        (entry  = randomEntry({alpLen}),
        describe(`'${entry.a}', '${entry.b}'`, () => checkCommon(entry, {asArray: true})
        )));
    }
    );
  }
  );

  return describe('diff', function() {

    describe('fix', () =>
      entries.map((entry) =>
        describe(`'${entry.a}', '${entry.b}'`, () => checkDiff(entry)
        ))
    
    );

    describe('random', function() {
      let entry;
      return __range__(0, randNum, false).map((n) =>
        (entry  = randomEntry({maxLen: alpLen}),
        describe(`'${entry.a}', '${entry.b}'`, () => checkDiff(entry)
        )));
    }
    );

    return describe('custom comperator', function() {
      let a = ['alice', 'bob', 'carol', 'Dan'];
      let b = ['Alice', 'Bob', 'CAROL', 'eve', 'dan'];
      return describe(`${a} ${b}`, function() {
        it('should have an distance of 9 with default compare', function() {
          let diff = mDiff(a, b);
          return expect(diff.scanCommon()).to.be.equal(9);
        }
        );
        it('should have an distance of 1 with special equal compare', function() {
          let diff = mDiff(a, b, {equal(aVal, bVal) { return aVal.toUpperCase() === bVal.toUpperCase(); }});
          return expect(diff.scanCommon()).to.be.equal(1);
        }
        );
        return it('should have an distance of 1 with special indexEqual compare', function() {
          let aUpper = a.map(x => x.toUpperCase);
          let bUpper = b.map(x => x.toUpperCase);
          let diff = mDiff(a, b, {indexEqual(aIdx, bIdx) { return aUpper[aIdx] === bUpper[bIdx]; }});
          return expect(diff.scanCommon()).to.be.equal(1);
        }
        );
      }
      );
    }
    );
  }
  );
}
);




function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}