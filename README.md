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
  console.log("'%s' != '%s'", a.slice(aS, aE), b.slice(bS, bE));
});
console.log("d=%s", d);

```
## API

#### var diff = mdiff(a, b, options)

Creates a diff-object. 
- `a`, `b` (strings or arrays, in fact anything that can be indexed): the items to compared.
- `options`
  - `equal` (`function(xa, xb)` ): a comperator that determines if two entries are handled to be equal (default is just '===').

  
#### diff.scanCommon(cb, maxD)

returns the edit-distance and calls `cb` for each common slice.

- `cb` (`function(aS, aE, bS, bE)`): 
- `maxD` (optional): the maximum edit-distance to be handled. If the items' edit-distance happens to be greater than this value, the function never calls `cb` and returns `null`.


#### diff.scanDiff(cb, maxD)

returns the edit-distance and calls `cb` for each difference. This is just the complement of `scanCommon`.

- `cb` (`function(aS, aE, bS, bE)`): 
- `maxD` (optional): the maximum edit-distance to be handled. If the items' edit-distance happens to be greater than this value, the function never calls `cb` and returns `null`.







        

