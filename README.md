# mdiff 

[![npm version](https://img.shields.io/npm/v/mdiff.svg?style=flat-square)](https://www.npmjs.com/package/mdiff)
[![Build Status](https://secure.travis-ci.org/tapirdata/mdiff.png?branch=master)](https://travis-ci.org/tapirdata/mdiff)
[![Dependency Status](https://david-dm.org/tapirdata/mdiff.svg)](https://david-dm.org/tapirdata/mdiff)
[![devDependency Status](https://david-dm.org/tapirdata/mdiff/dev-status.svg)](https://david-dm.org/tapirdata/mdiff#info=devDependencies)
> A Minimalistic Diff Implementation 

Based on the algorithm proposed in
["An O(ND) Difference Algorithm and its Variations" (Myers, 1986)](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927).
Works with Arrays and Strings.

## Usage

```bash
$ npm install mdiff
```

```js
import mDiff from 'mdiff';

let a = 'ABCABBA';
let b = 'CBABAC';
let diff = mDiff(a, b);

console.log("lcs='%s'", diff.getLcs());

console.log("Common:");
var d = diff.scanCommon((aS, aE, bS, bE) => {
  console.log("  '%s' == '%s'", a.slice(aS, aE), b.slice(bS, bE));
}); 
console.log("edit-distance=%s", d);

console.log("Diff:");
var d = diff.scanDiff((aS, aE, bS, bE) => {
  console.log("  '%s' -> '%s'", a.slice(aS, aE), b.slice(bS, bE));
});
console.log("edit-distance=%s", d);
```
## API

#### var diff = mdiff(a, b, options)

Creates a diff-object. 
- `a`, `b` (strings or arrays): the items to be compared.
- `options`
  - `equal` (`function(aValue, bValue)` ): a comparator that determines if two entries are supposed to be equal (default is just `===`).
  - `indexEqual` (`function(aIdx, bIdx)` ): a comparator that determines if entries for two indices are supposed to be equal (default is to compare `a[aIdx]` with `b[bIdx]` by `equal`).

  
#### diff.scanCommon(cb, dMax)

Calls `cb` for each common slice and returns the edit-distance `d`.

- `cb` (`function(aS, aE, bS, bE)`): reports the corresponding slices with these guarantees:
  - non-emptiness: `aE - aS == bE - bS > 0`
  - monotony: `aS` is not less than `aE` from the previous call. `bS` is not less than `bE` from the previous call.
  - equality: `a.slice(aS, aE)` is equal `b.slice(bS, bE)` with respect to `equal`.
  - minimality: The sum of all `aS - aE` is equal to `(a.length + b.length - d) / 2` and there is no lesser `d` so that 'equality' holds.
- `dMax` (optional): the maximum edit-distance to be handled. If the items' edit-distance happens to exceed this value, the function never calls `cb` and returns `null`.


#### diff.scanDiff(cb, dMax)

Calls `cb` for each difference and returns the edit-distance `d`. This is just the complement of `scanCommon`.

- `cb` (`function(aS, aE, bS, bE)`): reports differences with these guarantees:
  - non-emptiness: `aE - aS > 0` or `bE - bS > 0`
  - monotony: `aS` is not less than `aE` from the previous call. `bS` is not less than `bE` from the previous call.
  - equality: If in `a` all slices `a.slice(aS, aE)` are replaced by their corresponding `b.slice(bS, bE)`, the result is equal to `b` with respect to `equal`.
  - minimality: The sum of all `aS - aE` plus the sum of all `bS - bE` is equal to `d` and there is no lesser `d` so that 'equality' holds.
- `dMax` (optional): the maximum edit-distance to be handled. If the items' edit-distance happens to exceed this value, the function never calls `cb` and returns `null`.

#### diff.getLcs(dMax)

Returns the longest common subsequence of `a` and `b` (as `a`'s type) or `null`, if the items' edit-distance exceeds `dMax`. 







        

