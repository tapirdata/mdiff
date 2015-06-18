# mdiff [![Build Status](https://secure.travis-ci.org/tapirdata/mdiff.png?branch=master)](https://travis-ci.org/tapirdata/mdiff) [![Dependency Status](https://david-dm.org/tapirdata/mdiff.svg)](https://david-dm.org/tapirdata/mdiff) [![devDependency Status](https://david-dm.org/tapirdata/mdiff/dev-status.svg)](https://david-dm.org/tapirdata/mdiff#info=devDependencies)
> Eugene W. Myers' O(ND) Difference Algorithm Linear with Space Refinement

## Usage

```bash
$ npm install mdiff
```

```js
var mdiff = require('mdiff');

var a = 'ABCABBA';
var b = 'CBABAC';
var diff = mdiff(a, b);

var d = diff.scanCommon(function(aS, aE, bS, bE) {
  console.log("'%s' == '%s'", a.slice(aS, aE), b.slice(bS, bE));
}); 
console.log("d=%s", d);

d = diff.scanDiff(function(aS, aE, bS, bE) {
  console.log("'%s' -> '%s'", a.slice(aS, aE), b.slice(bS, bE));
});
console.log("d=%s", d);

```
## API

#### var diff = mdiff(a, b, options)

Creates a diff-object. 
- `a`, `b` (strings or arrays): the items to be compared.
- `options`
  - `equal` (`function(xa, xb)` ): a comparator that determines if two entries are supposed to be equal (default is just `===`).

  
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







        

