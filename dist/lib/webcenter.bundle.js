(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":3}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Activity Stream provides a streaming view of the activities of your connections, actions taken in portals,
 * and business activities. For example, Activity Stream can note when you or a connection posts feedback,
 * uploads a document, or creates a discussion forum.
 * @preferred
 */
var Config = require("./config");
var Core = require("./core");
// tslint:disable-next-line:max-line-length
var ACTIVITIES_API = "/api/activities?personGuid={personGuid}&personal={personal}&connections={connections}&connectionListIds={connectionListIds}&groupSpaces={groupSpaces}&groupSpaceGuids={groupSpaceGuids}&userGroupSpaceActivities={userGroupSpaceActivities}&followedObjects={followedObjects}&followedObjectsUserActivities={followedObjectsUserActivities}&serviceIds={serviceIds}&advancedQuery={advancedQuery}&fromDate={fromDate}&toDate={toDate}";
var ACTIVITY_API = "/api/activities/{id}";
var ACTIVITY_COMMENTSSUMMARY_API = "/api/activities/{activityId}/commentsSummary";
// tslint:disable-next-line:max-line-length
var COMMENTSSUMMARY_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/commentsSummary";
var ACTIVITY_COMMENTS_API = "/api/activities/{activityId}/comments";
// tslint:disable-next-line:max-line-length
var COMMENTS_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments";
// tslint:disable-next-line:max-line-length
var COMMENT_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/comments/{commentId}";
var ACTIVITY_COMMENT_API = "/api/activities/{activityId}/comments/{commentId}";
var ACTIVITY_LIKESSUMMARY_API = "/api/activities/{activityId}/likesSummary";
// tslint:disable-next-line:max-line-length
var LIKESSUMMARY_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likesSummary";
var ACTIVITY_LIKES_API = "/api/activities/{activityId}/likes";
var LIKES_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes";
// tslint:disable-next-line:max-line-length
var LIKE_API = "/api/activities/services/{serviceId}/objectTypes/{objectType}/objects/({objectId})/likes/{likeId}";
var ACTIVITY_LIKE_API = "/api/activities/{activityId}/likes/{likeId}";
var ITEMS_PER_PAGE = 40;
/**
 * This method compliments [Activity Stream REST API](https://docs.oracle.com/middleware/11119/wcp/develop/jpsdg_people_rest.htm#JPSDG5980)
 *
 * @param personGuid  GUID for the user to get activities for.
 * @param fromDate  Specifies activities start date (yyyy-mm-dd). Defaults to 7 days from current date.
 * @param toDate  Specifies activities end date (yyyy-mm-dd). Defaults to current date.
 * @param startIndex  startIndex as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param itemsPerPage  itemsPerPage as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param personal  get personal activities ?.
 * @param connections  get activities for connections ?.
 * @param connectionListIds  array of connection list ids to fetch activites for.
 * @param groupSpaces  get activities for group spaces?.
 * @param groupSpaceGuids  get activities for group spaces ids.
 * @param userGroupSpaceActivities  get user group spaces activities ?.
 * @param followedObjects  get activities associated with followed objects ?.
 * @param followedObjectsUserActivities  get followed objects user activities ?.
 * @param serviceIds  list of service ids.
 * @param data  data as per [Common Request Query Parameters](https://docs.oracle.com/cloud/latest/webcenter-portal-cloud/WPCSD/GUID-1A218CB7-743A-4E74-A4E9-921F4DD09F3C.htm#GUID-1228CF59-D7E9-4622-80A0-334E0A02D884).
 * @param advancedQuery  .
 * @returns      Comment for special return value.
 */
function getActivities(personGuid, fromDate, toDate, startIndex, itemsPerPage, personal, connections, connectionListIds, groupSpaces, groupSpaceGuids, userGroupSpaceActivities, followedObjects, followedObjectsUserActivities, serviceIds, data, advancedQuery) {
    if (personGuid === void 0) { personGuid = "@me"; }
    if (fromDate === void 0) { fromDate = new Date(Date.now() + (-7 * 24 * 3600 * 1000)); }
    if (toDate === void 0) { toDate = new Date(); }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (personal === void 0) { personal = true; }
    if (connections === void 0) { connections = true; }
    if (connectionListIds === void 0) { connectionListIds = []; }
    if (groupSpaces === void 0) { groupSpaces = true; }
    if (groupSpaceGuids === void 0) { groupSpaceGuids = []; }
    if (userGroupSpaceActivities === void 0) { userGroupSpaceActivities = true; }
    if (followedObjects === void 0) { followedObjects = true; }
    if (followedObjectsUserActivities === void 0) { followedObjectsUserActivities = true; }
    if (serviceIds === void 0) { serviceIds = []; }
    if (data === void 0) { data = "data,commentsSummary,likesSummary"; }
    if (advancedQuery === void 0) { advancedQuery = ""; }
    var connectionListIdsCsv;
    var groupSpaceGuidsCsv;
    var serviceIdsCsv;
    var fromDateStr;
    var toDateStr;
    if (connectionListIds.length > 0) {
        connectionListIdsCsv = connectionListIds.join(",");
    }
    if (groupSpaceGuids.length > 0) {
        groupSpaceGuidsCsv = groupSpaceGuids.join(",");
    }
    if (serviceIds.length > 0) {
        serviceIdsCsv = serviceIds.join(",");
    }
    if (fromDate) {
        fromDateStr = fromDate.toISOString();
        fromDateStr = fromDateStr.substring(0, fromDateStr.indexOf("T"));
    }
    if (toDate) {
        toDateStr = toDate.toISOString();
        toDateStr = toDateStr.substring(0, toDateStr.indexOf("T"));
    }
    var params = {
        personGuid: personGuid,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        personal: personal,
        connections: connections,
        connectionListIdsCsv: connectionListIdsCsv,
        groupSpaces: groupSpaces,
        groupSpaceGuidsCsv: groupSpaceGuidsCsv,
        userGroupSpaceActivities: userGroupSpaceActivities,
        followedObjects: followedObjects,
        followedObjectsUserActivities: followedObjectsUserActivities,
        serviceIdsCsv: serviceIdsCsv,
        data: data,
        advancedQuery: advancedQuery,
        fromDate: fromDateStr,
        toDate: toDateStr,
    };
    return Core.doGet(ACTIVITIES_API, params);
}
exports.getActivities = getActivities;
function createActivity(activity) {
    /*         let activityElement = {
     'serviceId': serviceId,
     'activityType': activityType,
     'scope': scope,
     'detail': item.title,
     'templateParams': {
     'items': [{
     'key': '{actor[0]}',
     'guid': '@me'
     }, {
     'key': '{object[0]}',
     'id': objectId,
     'serviceId': serviceId,
     'type': objectType,
     'displayName': item.title
     }]
     }
     };
     */
    var params = {};
    return Core.doPost(ACTIVITIES_API, activity, params);
}
exports.createActivity = createActivity;
function getActivity(activityId) {
    var params = {
        id: activityId,
    };
    return Core.doGet(ACTIVITY_API, params);
}
exports.getActivity = getActivity;
function deleteActivity(activityId) {
    var params = {
        id: activityId,
    };
    return Core.doDelete(ACTIVITY_API, params);
}
exports.deleteActivity = deleteActivity;
function getActivityCommentsSummary(activityId) {
    var params = {
        activityId: activityId,
    };
    return Core.doGet(ACTIVITY_COMMENTSSUMMARY_API, params);
}
exports.getActivityCommentsSummary = getActivityCommentsSummary;
function getCommentsSummary(serviceId, objectType, objectId) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doGet(COMMENTSSUMMARY_API, params);
}
exports.getCommentsSummary = getCommentsSummary;
function getActivityComments(activityId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        activityId: activityId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ACTIVITY_COMMENTS_API, params);
}
exports.getActivityComments = getActivityComments;
function deleteActivityComment(activityId, commentId) {
    var params = {
        activityId: activityId,
        commentId: commentId,
    };
    return Core.doDelete(ACTIVITY_COMMENT_API, params);
}
exports.deleteActivityComment = deleteActivityComment;
function createActivityCommment(activityId, comment) {
    var params = {
        activityId: activityId,
    };
    return Core.doPost(ACTIVITY_COMMENTS_API, comment, params);
}
exports.createActivityCommment = createActivityCommment;
function getComments(serviceId, objectType, objectId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(COMMENTS_API, params);
}
exports.getComments = getComments;
function createCommment(serviceId, objectType, objectId, comment) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doPost(COMMENTS_API, comment, params);
}
exports.createCommment = createCommment;
function deleteComment(serviceId, objectType, objectId, commentId) {
    var params = {
        commentId: commentId,
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doDelete(COMMENT_API, params);
}
exports.deleteComment = deleteComment;
function getActivityLikesSummary(activityId) {
    var params = {
        activityId: activityId,
    };
    return Core.doGet(ACTIVITY_LIKESSUMMARY_API, params);
}
exports.getActivityLikesSummary = getActivityLikesSummary;
function getLikesSummary(serviceId, objectType, objectId) {
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doGet(LIKESSUMMARY_API, params);
}
exports.getLikesSummary = getLikesSummary;
function getActivityLikes(activityId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        activityId: activityId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ACTIVITY_LIKES_API, params);
}
exports.getActivityLikes = getActivityLikes;
function deleteActivityLike(activityId, likeId) {
    var params = {
        activityId: activityId,
        likeId: likeId,
    };
    return Core.doDelete(ACTIVITY_LIKE_API, params);
}
exports.deleteActivityLike = deleteActivityLike;
function createActivityLike(activityId, like) {
    if (like === void 0) { like = {}; }
    var params = {
        activityId: activityId,
    };
    return Core.doPost(ACTIVITY_LIKES_API, like, params);
}
exports.createActivityLike = createActivityLike;
function getLikes(serviceId, objectType, objectId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(LIKES_API, params);
}
exports.getLikes = getLikes;
function createLike(serviceId, objectType, objectId, like) {
    if (like === void 0) { like = {}; }
    var params = {
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doPost(LIKES_API, like, params);
}
exports.createLike = createLike;
function deleteLike(serviceId, objectType, objectId, likeId) {
    var params = {
        likeId: likeId,
        serviceId: serviceId,
        objectType: objectType,
        objectId: objectId,
    };
    return Core.doDelete(LIKE_API, params);
}
exports.deleteLike = deleteLike;
function processActivity(activity) {
    var message = activity.message;
    var messageParts = [];
    var actor;
    var object;
    var actOn;
    var extendedActivity = activity;
    if (activity.detailURL) {
        if (activity.detailURL.indexOf("/cs") < 0) {
            activity.detailURL = Config.getWcBaseUrl() + activity.detailURL;
        }
        else {
            activity.detailURL = activity.detailURL.replace("//cs", Config.getCsBaseUrl());
        }
    }
    if (activity.links) {
        for (var _i = 0, _a = activity.links; _i < _a.length; _i++) {
            var link = _a[_i];
            if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                var capabilities = link.capabilities;
                if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                    extendedActivity.isDeletable = true;
                    break;
                }
            }
        }
    }
    if (message) {
        var startIdx = message.indexOf("{");
        var endIdx = 0;
        var sStartIdx = void 0;
        var sEndIdx = void 0;
        var selIdx = void 0;
        var selector = void 0;
        if (startIdx === -1) {
            messageParts.push(message);
        }
        while (startIdx !== -1) {
            endIdx = message.indexOf("}", startIdx);
            if (endIdx === -1) {
                // exception
            }
            var chunkMessage = message.substring(startIdx, endIdx + 1);
            startIdx = message.indexOf("{", endIdx);
            sStartIdx = chunkMessage.indexOf("[");
            sEndIdx = chunkMessage.indexOf("]");
            selector = chunkMessage.substring(sStartIdx + 1, sEndIdx);
            selIdx = parseInt(selector, 10);
            var item_1 = void 0;
            for (var idx = 0; idx < activity.templateParams.items.length; idx++) {
                item_1 = activity.templateParams.items[idx];
                if (item_1) {
                    if (item_1.key === chunkMessage) {
                        messageParts.push(item_1);
                        if (selIdx === 0) {
                            if (chunkMessage.indexOf("{actor") > -1) {
                                actor = item_1;
                            }
                            if (chunkMessage.indexOf("{object") > -1) {
                                object = item_1;
                            }
                        }
                    }
                }
            }
            if (startIdx < 0) {
                messageParts.push(message.substring(endIdx + 1));
            }
            else {
                messageParts.push(message.substring(endIdx + 1, startIdx));
            }
        }
        var actOnFound = false;
        var item = void 0;
        for (var idx = 0; idx < activity.templateParams.items.length; idx++) {
            item = activity.templateParams.items[idx];
            if ((!actOnFound) &&
                (item.type === "activity") &&
                (item.serviceId === "oracle.activitystreaming")) {
                actOn = item;
            }
        }
        extendedActivity.primaryObject = object;
        extendedActivity.primaryActor = actor;
        extendedActivity.actOn = actOn;
        extendedActivity.messageParts = messageParts;
        if (extendedActivity.links) {
            for (var _b = 0, _c = extendedActivity.links; _b < _c.length; _b++) {
                var link = _c[_b];
                if (link.resourceType === "urn:oracle:webcenter:messageBoard:message") {
                    var capabilities = link.capabilities;
                    if (capabilities && capabilities.indexOf("urn:oracle:webcenter:delete") !== -1) {
                        extendedActivity.isDeletable = true;
                        break;
                    }
                }
            }
        }
    }
    return extendedActivity;
}
exports.processActivity = processActivity;

},{"./config":14,"./core":15}],6:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Config = require("./config");
var Core = require("./core");
var LITERALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var RESOURCEINDEX_SUFFIX = "/api/resourceIndex";
var USER_PROFILE = "/api/people/@me/lists/@self";
// tslint:disable-next-line:variable-name
var _isAuthenticated = false;
// tslint:disable-next-line:variable-name
var _isAuthenticationInProgress = false;
var identityToken;
// tslint:disable-next-line:variable-name
var _userName;
// tslint:disable-next-line:variable-name
var _password;
// tslint:disable-next-line:variable-name
var resourceIndex;
var uToken;
var authHeader;
var authPromise;
function encode(input) {
    var output = "";
    // tslint:disable-next-line:one-variable-per-declaration
    var chr1, chr2, chr3 = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    var enc1, enc2, enc3, enc4 = -1;
    var i = 0;
    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        // tslint:disable-next-line:no-bitwise
        enc1 = chr1 >> 2;
        // tslint:disable-next-line:no-bitwise
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        // tslint:disable-next-line:no-bitwise
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        // tslint:disable-next-line:no-bitwise
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        }
        else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output +
            LITERALS.charAt(enc1) +
            LITERALS.charAt(enc2) +
            LITERALS.charAt(enc3) +
            LITERALS.charAt(enc4);
        chr1 = chr2 = chr3 = -1;
        enc1 = enc2 = enc3 = enc4 = -1;
    } while (i < input.length);
    return output;
}
function decode(input) {
    var output = "";
    // tslint:disable-next-line:one-variable-per-declaration
    var chr1, chr2, chr3 = -1;
    // tslint:disable-next-line:one-variable-per-declaration
    var enc1, enc2, enc3, enc4 = -1;
    var i = 0;
    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        return null;
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    do {
        enc1 = LITERALS.indexOf(input.charAt(i++));
        enc2 = LITERALS.indexOf(input.charAt(i++));
        enc3 = LITERALS.indexOf(input.charAt(i++));
        enc4 = LITERALS.indexOf(input.charAt(i++));
        // tslint:disable-next-line:no-bitwise
        chr1 = (enc1 << 2) | (enc2 >> 4);
        // tslint:disable-next-line:no-bitwise
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        // tslint:disable-next-line:no-bitwise
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
        }
        chr1 = chr2 = chr3 = -1;
        enc1 = enc2 = enc3 = enc4 = -1;
    } while (i < input.length);
    return output;
}
/**
 * sets OIT Token for authorization
 * @param oit oracle identity token that is generated from call to WCSecurityUtility.issueTrustServiceSecurityToken()
 */
function setOIT(oit) {
    identityToken = "OIT " + oit;
}
exports.setOIT = setOIT;
/**
 * sets BASIC Auth Token for authorization
 * @param basicAuth auth identity token
 * that is generated from base64(['username',':','password].join('')).
 * Refer to [Wiki](https://en.wikipedia.org/wiki/Basic_access_authentication)
 */
function setBasicAuth(basicAuth) {
    identityToken = "Basic " + basicAuth;
}
exports.setBasicAuth = setBasicAuth;
/**
 * sets username for authorization
 * @param userName Username
 */
function setUserName(userName) {
    _userName = userName;
}
exports.setUserName = setUserName;
/**
 * sets password for authorization
 * @param password Username
 */
function setPassword(password) {
    _password = password;
}
exports.setPassword = setPassword;
/**
 * Method to get
  * [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH)
 * @returns [Resource Index](https://docs.oracle.com/cd/E21764_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABHCDIH).
*/
function getResourceIndex() {
    return login().then(function (resIndex) {
        return resIndex;
    });
}
exports.getResourceIndex = getResourceIndex;
/**
 * Method to get uToken. This token is obtain from response header **x-oracle-rf-token** post Resource Index call.
 * @returns       uToken for the user.
 */
function getUToken() {
    return uToken;
}
exports.getUToken = getUToken;
function getAuthorizationHeader() {
    return authHeader;
}
exports.getAuthorizationHeader = getAuthorizationHeader;
function isAuthenticated() {
    return _isAuthenticated;
}
exports.isAuthenticated = isAuthenticated;
function getCurrentUser() {
    return Core.doGet(USER_PROFILE);
}
exports.getCurrentUser = getCurrentUser;
function restLogin(authorization) {
    var headers = authorization ? { Authorization: authorization } : {};
    var restBaseUrl = Config.getRestBaseUrl();
    return axios_1.default.get(restBaseUrl + RESOURCEINDEX_SUFFIX, {
        headers: headers,
    }).then(function (response) {
        uToken = response.headers["x-oracle-rf-token"];
        authHeader = authorization;
        resourceIndex = response.data;
        return resourceIndex;
    });
}
function csLogin(userName, password) {
    var csBaseUrl = Config.getCsBaseUrl();
    // tslint:disable-next-line:max-line-length
    var url = csBaseUrl + "/j_security_check?success_url=" + csBaseUrl + "/idcplg?IdcService=GET_DOC_PAGE&Action=GetTemplatePage&Page=HOME_PAGE";
    return axios_1.default.post(url, {
        j_password: password,
        j_username: userName,
    }, {
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Content-Type": "application/x-www-form-urlencoded",
        }, transformRequest: function (obj) {
            var str = [];
            for (var p in obj) {
                if (obj[p]) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },
    }).then(function (response) {
        return response.data;
    }, function (error) {
        return axios_1.default.get(csBaseUrl).then(function (resp) {
            return resp.data;
        });
    });
}
function wcLogin(userName, password) {
    var wcBaseUrl = Config.getWcBaseUrl();
    var url = wcBaseUrl + "/wcAuthentication?success_url=" + wcBaseUrl + "/portal";
    return axios_1.default.post(url, {
        j_password: password,
        j_username: userName,
    }, {
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Content-Type": "application/x-www-form-urlencoded",
        }, transformRequest: function (obj) {
            var str = [];
            for (var p in obj) {
                if (obj[p]) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },
    }).then(function (response) {
        return response.data;
    });
}
function logout() {
    _isAuthenticated = false;
    authPromise = null;
    _userName = null;
    _password = null;
    identityToken = null;
    resourceIndex = null;
    uToken = null;
    authHeader = null;
    _isAuthenticationInProgress = false;
}
exports.logout = logout;
function login(userNameOrIdentityToken, password) {
    if (_isAuthenticated) {
        return authPromise;
    }
    else {
        if (_isAuthenticationInProgress) {
            return authPromise;
        }
        else {
            _isAuthenticationInProgress = true;
            _isAuthenticated = false;
            _userName = userNameOrIdentityToken ? userNameOrIdentityToken : _userName;
            _password = password ? password : _password;
            if (_password) {
                var words = _userName + ":" + _password;
                var base64 = encode(words);
                var authorization = "Basic " + base64;
                var restBaseUrl = Config.getRestBaseUrl();
                var wcBaseUrl = Config.getWcBaseUrl();
                var csBaseUrl = Config.getCsBaseUrl();
                var promiseArr = void 0;
                if (restBaseUrl) {
                    promiseArr = [restLogin(authorization)];
                }
                if (wcBaseUrl) {
                    promiseArr.push(wcLogin(_userName, _password));
                }
                if (csBaseUrl) {
                    promiseArr.push(csLogin(_userName, _password));
                }
                if (!wcBaseUrl && !csBaseUrl) {
                    authPromise = promiseArr[0].then(function (resIndex) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return resIndex;
                    }, function (error) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                }
                else {
                    authPromise = axios_1.default.all(promiseArr).then(function (responses) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = true;
                        return responses[0];
                    }, function (error) {
                        _isAuthenticationInProgress = false;
                        _isAuthenticated = false;
                        throw error;
                    });
                }
                return authPromise;
            }
            else {
                authPromise = restLogin(_userName).then(function (resIndex) {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = true;
                    return resIndex;
                }, function (error) {
                    _isAuthenticationInProgress = false;
                    _isAuthenticated = false;
                    throw error;
                });
                return authPromise;
            }
        }
    }
}
exports.login = login;
function recover(config) {
    return login().then(function (resIdx) {
        if (config.url.indexOf("utoken") === -1) {
            if (config.params) {
                config.params.utoken = getUToken();
            }
            else {
                config.params = {
                    utoken: getUToken(),
                };
            }
        }
        var authHdr = getAuthorizationHeader();
        if (authHdr) {
            if (config.headers) {
                config.headers.Authorization = authHdr;
            }
            else {
                config.headers = {
                    Authorization: authHdr,
                };
            }
        }
        return config;
    });
}
axios_1.default.interceptors.request.use(function (config) {
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    var idxPort80 = url.indexOf(":80/");
    if (idxPort80 > 0) {
        url = [url.substr(0, idxPort80), url.substr(idxPort80 + 3)].join("");
    }
    config.url = url;
    if (url.indexOf(restBaseUrl + "/api") >= 0) {
        if (isAuthenticated()) {
            if (url.indexOf("utoken") < 0) {
                if (config.params) {
                    config.params.utoken = getUToken();
                }
                else {
                    config.params = { utoken: getUToken() };
                }
            }
            var authHdr = getAuthorizationHeader();
            if (authHdr) {
                config.headers.Authorization = authHdr;
            }
            return config;
        }
        else {
            if (url.indexOf(restBaseUrl + "/api/resourceIndex") >= 0) {
                return config;
            }
            else {
                var promise = recover(config);
                return promise;
            }
        }
    }
    else {
        return config;
    }
}, function (error) {
    throw error;
});

},{"./config":14,"./core":15,"axios":22}],7:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = require("./util");
var CmisBase = (function () {
    function CmisBase(node) {
        this.node = node;
        this.title = Util.select("./atom:title/text()", this.node, true).data;
        this.links = Util.processLinks(this.node);
    }
    CmisBase.prototype.getLink = function (rel, type) {
        var lnks = this.links[rel];
        if (lnks) {
            if (lnks.length > 1) {
                var url = void 0;
                for (var _i = 0, lnks_1 = lnks; _i < lnks_1.length; _i++) {
                    var lnk = lnks_1[_i];
                    if (lnk.type === type) {
                        url = lnk.href;
                        break;
                    }
                }
                return url;
            }
            else {
                return lnks[0].href;
            }
        }
    };
    return CmisBase;
}());
exports.default = CmisBase;

},{"./util":12}],8:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var feed_1 = require("./feed");
var object_1 = require("./object");
var Util = require("./util");
var CmisEntry = (function (_super) {
    tslib_1.__extends(CmisEntry, _super);
    function CmisEntry(node) {
        var _this = _super.call(this, node) || this;
        _this.processEntry(node);
        return _this;
    }
    CmisEntry.prototype.delete = function (comments) {
        var url = [this.getLink("self", "application/atom+xml;type=entry"), "&_method=delete"].join("");
        url = comments ? [url, "comments=" + comments].join("") : url;
        var headers = {
            Accept: "application/atom+xml;type=entry",
        };
        return axios_1.default.delete(url, {
            headers: headers,
            withCredentials: true,
        }).then(function (response) {
            return response.data;
        });
    };
    CmisEntry.prototype.getSelfEntry = function () {
        var url = this.getLink("self", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getUpEntry = function () {
        var url = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getEditEntry = function () {
        var url = this.getLink("edit", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisEntry.prototype.getDownFeed = function () {
        var url = this.getLink("down", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisEntry.prototype.getUpFeed = function () {
        var url = this.getLink("up", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisEntry.prototype.processEntry = function (node) {
        this.content = Util.select("./atom:content/text()", node, true).data;
        if (this.cmisProps) {
            this.baseType = this.cmisProps["cmis:baseTypeId"].value;
            this.cmisObjectId = this.cmisProps["cmis:objectId"].value;
        }
        this.downTreeUrl = this.getLink("down", "application/cmistree+xml");
    };
    CmisEntry.prototype.getResource = function (url, accept, type) {
        if (url) {
            return Util.getCmisResource(url, accept).then(function (doc) {
                if (type === "ENTRY") {
                    return new CmisEntry(Util.select("./atom:entry", doc, true));
                }
                if (type === "FEED") {
                    return new feed_1.default(Util.select("./atom:feed", doc, true));
                }
            });
        }
    };
    return CmisEntry;
}(object_1.default));
exports.default = CmisEntry;

},{"./feed":9,"./object":11,"./util":12,"axios":22,"tslib":47}],9:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var entry_1 = require("./entry");
var object_1 = require("./object");
var Util = require("./util");
var CmisFeed = (function (_super) {
    tslib_1.__extends(CmisFeed, _super);
    // self link is the upload post action url
    function CmisFeed(node) {
        var _this = _super.call(this, node) || this;
        // this.collectionUrl = this.node('atom\\:collection,collection').eq(0).attr('href');
        _this.processEntries();
        return _this;
    }
    CmisFeed.prototype.getSelfFeed = function () {
        var url = this.getLink("self", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.getUpEntry = function () {
        var url = this.getLink("up", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisFeed.prototype.getViaEntry = function () {
        var url = this.getLink("via", "application/atom+xml;type=entry");
        return this.getResource(url, "application/atom+xml;type=entry", "ENTRY");
    };
    CmisFeed.prototype.getNextFeed = function () {
        var url = this.getLink("next", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.getPreviosFeed = function () {
        var url = this.getLink("previous", "application/atom+xml;type=feed");
        return this.getResource(url, "application/atom+xml;type=feed", "FEED");
    };
    CmisFeed.prototype.removeEntry = function (cmisObjectId) {
        this.entries = this.entries.filter(function (entry, index, entries) {
            return entry.cmisObjectId !== cmisObjectId;
        });
        return this.entries;
    };
    CmisFeed.prototype.deleteEntry = function (entry) {
        var _this = this;
        var cmisObjectId = entry.cmisObjectId;
        return entry.delete().then(function (data) {
            for (var _i = 0, _a = _this.entries; _i < _a.length; _i++) {
                var ele = _a[_i];
                var eleObjId = ele.cmisObjectId;
                if (eleObjId === cmisObjectId) {
                    _this.removeEntry(eleObjId);
                    break;
                }
            }
            return cmisObjectId;
        });
    };
    CmisFeed.prototype.processEntries = function () {
        this.entries = [];
        var entryArr = Util.select("./atom:entry", this.node);
        var entryNode;
        for (var idx = 0; idx < entryArr.length; idx++) {
            entryNode = entryArr[idx];
            this.entries.push(new entry_1.default(entryNode));
        }
    };
    CmisFeed.prototype.getResource = function (url, accept, type) {
        if (url) {
            return Util.getCmisResource(url, accept).then(function (doc) {
                if (type === "ENTRY") {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                }
                if (type === "FEED") {
                    return new CmisFeed(Util.select("./atom:feed", doc, true));
                }
            });
        }
    };
    return CmisFeed;
}(object_1.default));
exports.default = CmisFeed;

},{"./entry":8,"./object":11,"./util":12,"tslib":47}],10:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var xmldom = require("xmldom");
var xpath = require("xpath");
var Core = require("../core");
var workspace_1 = require("./workspace");
var ALLOWABLE_ACTIONS_API = "/api/cmis/allowableActions/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
var GET_CHILDREN_API = "/api/cmis/children/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&orderBy={orderBy}&maxItems={maxItems}&skipCount={skipCount}&includePathSegment={includePathSegment}";
var CREATE_MOVE_ENTRY_API = "/api/cmis/children/{repositoryId}?uid={uid}&sourceFolderId={sourceFolderId}&versioningState={versioningState}";
// tslint:disable-next-line:max-line-length
var POST_BINARY_API = "/api/cmis/children/{repositoryId}?uid={uid}&fileName={fileName}&contentId={contentId}&comments={comments}&simpleResponse={simpleResponse}";
var UPLOAD_MULTIPART_FORM_API = "/api/cmis/children/{repositoryId}?uid={uid}";
var GET_CONTENT_STREAM_API = "/api/cmis/stream/{repositoryId}?uid={uid}&streamId={streamId}";
var PUT_CONTENT_STREAM_API = "/api/cmis/stream/{repositoryId}?uid={uid}&overwriteFlag={overwriteFlag}";
// tslint:disable-next-line:max-line-length
var DELETE_DESCENDANTS_API = "/api/cmis/descendants/{repositoryId}?uid={uid}&allVersions={allVersions}&continueOnFailure={continueOnFailure}&unfileObjects={unfileObjects}";
// tslint:disable-next-line:max-line-length
var GET_DOCUMENT_PROPS_API = "/api/cmis/document/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}&returnVersion={returnVersion}";
var PUT_DOCUMENT_PROPS_API = "/api/cmis/document/{repositoryId}?uid={uid}";
var DELETE_DOCUMENT_API = "/api/cmis/document/{repositoryId}?uid={uid}";
var DELETE_DOCUMENT_POST_API = "/api/cmis/document/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
var GET_FOLDER_PROPS_API = "/api/cmis/folder/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&renditionFilter={renditionFilter}";
var PUT_FOLDER_PROPS_API = "/api/cmis/folder/{repositoryId}?uid={uid}";
var DELETE_FOLDER_API = "/api/cmis/folder/{repositoryId}?uid={uid}";
var DELETE_FOLDER_POST_API = "/api/cmis/folder/{repositoryId}?uid={uid}&_method=delete";
// tslint:disable-next-line:max-line-length
var GET_OBJECT_BY_ID_API = "/api/cmis/objectbyid?id={id}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
var GET_OBJECT_BY_PATH_API = "/api/cmis/objectbypath/{repositoryId}?path={path}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&includePolicyIds={includePolicyIds}&includeACL={includeACL}&renditionFilter={renditionFilter}";
// tslint:disable-next-line:max-line-length
var GET_PARENTS_API = "/api/cmis/parents/{repositoryId}?uid={uid}&filter={filter}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&renditionFilter={renditionFilter}&includeRelativePathSegment={includeRelativePathSegment}";
var POST_QUERY_API = "/api/cmis/query/{repositoryId}?uid={uid}";
// tslint:disable-next-line:max-line-length
var GET_QUERY_API = "/api/cmis/query/{repositoryId}?q={q}&searchAllVersions={searchAllVersions}&includeAllowableActions={includeAllowableActions}&includeRelationships={includeRelationships}&maxItems={maxItems}&skipCount={skipCount}";
var GET_REPOSITORY_INFO_API = "/api/cmis/repository/{repositoryId}";
exports.CMIS_NAMESPACES = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};
var select = xpath.useNamespaces(exports.CMIS_NAMESPACES);
var workspaces;
function getAllowableActions(repositoryId, nodeUid) {
    if (nodeUid === void 0) { nodeUid = "ora:syst:rootfolder"; }
    var params = {
        repositoryId: repositoryId,
        uid: nodeUid,
    };
    return Core.doGet(ALLOWABLE_ACTIONS_API, params);
}
exports.getAllowableActions = getAllowableActions;
function getWorkspaces() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            if (workspaces) {
                return [2 /*return*/, workspaces];
            }
            else {
                return [2 /*return*/, Core.getResourceUrl("urn:oracle:webcenter:cmis").then(function (cmisResourceUrl) {
                        workspaces = {};
                        var headers = {
                            Accept: "application/xml, text/xml, */*",
                        };
                        return axios_1.default.get(cmisResourceUrl, {
                            headers: headers,
                            withCredentials: true,
                        }).then(function (response) {
                            var respText = response.data;
                            var doc = new xmldom.DOMParser().parseFromString(respText);
                            var nodes = select("./app:service/app:workspace", doc);
                            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                                var node = nodes_1[_i];
                                var titleNode = select("./atom:title/text()", node, true);
                                workspaces[titleNode.data] = new workspace_1.default(node);
                                /*let titleNode: Text = select('./atom:title/text()', node, true);
                                workspaces[titleNode.data] = node;
            
                                let node1: Node = select('./atom:link', node)[2];
                                let attrs: NamedNodeMap = node1.attributes;
            
                                console.log(attrs.getNamedItemNS(CMIS_NAMESPACES['cmisra'], 'id'));*/
                                // let nde: Node = select('./atom:title', node, true);
                                // console.log(select('./text()', nde, true).data);
                            }
                            return workspaces;
                        });
                    })];
            }
            return [2 /*return*/];
        });
    });
}
exports.getWorkspaces = getWorkspaces;
function getWorkspace(repositoryId) {
    if (repositoryId === void 0) { repositoryId = "UCM"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var wrkSpace;
        return tslib_1.__generator(this, function (_a) {
            wrkSpace = workspaces ? (repositoryId ? workspaces[repositoryId] : workspaces[0]) : null;
            if (wrkSpace) {
                return [2 /*return*/, wrkSpace];
            }
            else {
                return [2 /*return*/, getWorkspaces().then(function (wrkspaces) {
                        return wrkspaces ? (repositoryId ? wrkspaces[repositoryId] : wrkspaces[0]) : null;
                    })];
            }
            return [2 /*return*/];
        });
    });
}
exports.getWorkspace = getWorkspace;

},{"../core":15,"./workspace":13,"axios":22,"tslib":47,"xmldom":48,"xpath":51}],11:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_1 = require("./base");
var Util = require("./util");
var CmisObject = (function (_super) {
    tslib_1.__extends(CmisObject, _super);
    function CmisObject(objNode) {
        var _this = _super.call(this, objNode) || this;
        _this.processMetadata();
        _this.cmisProps = Util.processCmisProps(objNode);
        return _this;
    }
    CmisObject.prototype.processMetadata = function () {
        var idNode = Util.select("./atom:id", this.node, true);
        var authNameNode = Util.select("./atom:author/atom:name", this.node, true);
        var publishedNode = Util.select("./atom:published", this.node, true);
        var contributorNameNode = Util.select("./atom:contributor/atom:name", this.node, true);
        var updateNode = Util.select("./atom:updated", this.node, true);
        var editedNode = Util.select("./app:edited", this.node, true);
        var summaryNode = Util.select("./atom:summary", this.node, true);
        this.id = idNode ? idNode.textContent : null;
        this.author = authNameNode ? authNameNode.textContent : null;
        this.publishedDate = publishedNode ? publishedNode.textContent : null;
        this.contributor = contributorNameNode ? contributorNameNode.textContent : null;
        this.updatedDate = updateNode ? updateNode.textContent : null;
        this.editedDate = editedNode ? editedNode.textContent : null;
        this.summaryHTML = summaryNode ? summaryNode.textContent : null;
    };
    return CmisObject;
}(base_1.default));
exports.default = CmisObject;

},{"./base":7,"./util":12,"tslib":47}],12:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var xmldom = require("xmldom");
var xpath = require("xpath");
exports.CMIS_NAMESPACES = {
    app: "http://www.w3.org/2007/app",
    atom: "http://www.w3.org/2005/Atom",
    cmis: "http://docs.oasis-open.org/ns/cmis/core/200908/",
    cmisra: "http://docs.oasis-open.org/ns/cmis/restatom/200908/",
};
exports.select = xpath.useNamespaces(exports.CMIS_NAMESPACES);
function processCmisProps(node) {
    var objectNode = exports.select("./cmisra:object", node, true);
    var cmisProps;
    if (objectNode) {
        var prop = exports.select("./cmis:properties", objectNode, true);
        var attrs = void 0;
        var children = prop.childNodes;
        var child = void 0;
        var propDefId = void 0;
        var localName = void 0;
        var displayName = void 0;
        var queryName = void 0;
        var value = void 0;
        cmisProps = {};
        for (var idx = 0; idx < children.length; idx++) {
            child = children.item(idx);
            attrs = child.attributes;
            propDefId = attrs.getNamedItem("propertyDefinitionId").value;
            localName = attrs.getNamedItem("localName").value;
            displayName = attrs.getNamedItem("displayName").value;
            queryName = attrs.getNamedItem("queryName").value;
            if (child.firstChild) {
                value = exports.select("./text()", child.firstChild, true).data;
            }
            cmisProps[localName] = {
                displayName: displayName,
                value: value,
                propDefId: propDefId,
                queryName: queryName,
            };
        }
    }
    return cmisProps;
}
exports.processCmisProps = processCmisProps;
function processLinks(node) {
    var linksArr = exports.select("./atom:link", node);
    var nde;
    var attributes;
    var rel;
    var href;
    var type;
    var id;
    var idAttr;
    var links;
    for (var i = 0; i < linksArr.length; i++) {
        nde = linksArr[i];
        attributes = nde.attributes;
        rel = attributes.getNamedItem("rel").value;
        href = attributes.getNamedItem("href").value;
        type = attributes.getNamedItem("type").value;
        idAttr = attributes.getNamedItemNS(exports.CMIS_NAMESPACES.cmisra, "id");
        id = idAttr ? idAttr.value : null;
        var obj = { href: href, type: type };
        if (id) {
            obj["cmisra:id"] = id;
        }
        var existing = links ? links[rel] : null;
        if (existing) {
            existing.push(obj);
        }
        else {
            if (!links) {
                links = {};
            }
            links[rel] = [obj];
        }
    }
    return links;
}
exports.processLinks = processLinks;
function getChildrenByName(node, name) {
    var resultChildren = [];
    if (node) {
        var childNodes = node.childNodes;
        var child = void 0;
        for (var i = 0; i < childNodes.length; i++) {
            child = childNodes.item(i);
            if (child.nodeName === name) {
                resultChildren.push(child);
            }
        }
    }
    return resultChildren;
}
exports.getChildrenByName = getChildrenByName;
function getCmisResourceHttp(url, accept) {
    var accHeader = accept ? accept : "application/xml, text/xml";
    return axios_1.default.get(url, {
        headers: { Accept: accHeader },
    }).then(function (response) {
        var doc = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    });
}
exports.getCmisResourceHttp = getCmisResourceHttp;
function getCmisResource(url, accept, retry) {
    var accHeader = accept ? accept : "application/xml, text/xml";
    return axios_1.default.get(url, {
        headers: {
            Accept: accHeader,
        },
        withCredentials: true,
    }).then(function (response) {
        var doc = new xmldom.DOMParser().parseFromString(response.data);
        return doc;
    }, function (error) {
        if (retry && retry.count > 0 && retry.frequency > 0) {
            retry = retry.count - 1;
            return getCmisResource(url, retry);
        }
        else {
            return error;
        }
    });
}
exports.getCmisResource = getCmisResource;
function processUriTemplates(node) {
    var nodeArr = exports.select("cmisra:uritemplate", node);
    var uriTemplates;
    for (var _i = 0, nodeArr_1 = nodeArr; _i < nodeArr_1.length; _i++) {
        var nde = nodeArr_1[_i];
        var type = exports.select("./cmisra:type/text()", nde, true).data;
        var template = exports.select("./cmisra:template/text()", nde, true).data;
        var mediaType = exports.select("./cmisra:mediatype/text()", nde, true).data;
        if (!uriTemplates) {
            uriTemplates = {};
        }
        uriTemplates[type] = {
            template: template,
            mediaType: mediaType,
        };
    }
    return uriTemplates;
}
exports.processUriTemplates = processUriTemplates;
function processCollections(node) {
    var collections;
    var collectionArr = exports.select("./app:collection", node);
    for (var _i = 0, collectionArr_1 = collectionArr; _i < collectionArr_1.length; _i++) {
        var nde = collectionArr_1[_i];
        var attrs = nde.attributes;
        var href = attrs.getNamedItem("href").value;
        var collectionType = exports.select("./cmisra:collectionType/text()", nde, true).data;
        var accept = exports.select("./app:accept/text()", nde, true).data;
        var title = exports.select("./atom:title/text()", nde, true).data;
        var existing = collections ? collections[collectionType] : null;
        if (existing && existing.length > 0) {
            existing.push({
                title: title,
                href: href,
                accept: accept,
            });
        }
        else {
            if (!collections) {
                collections = {};
            }
            collections[collectionType] = [{
                    title: title,
                    href: href,
                    accept: accept,
                }];
        }
    }
    return collections;
}
exports.processCollections = processCollections;

},{"axios":22,"xmldom":48,"xpath":51}],13:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import * as _ from "lodash";
var base_1 = require("./base");
var entry_1 = require("./entry");
var feed_1 = require("./feed");
var Util = require("./util");
var CmisWorkspace = (function (_super) {
    tslib_1.__extends(CmisWorkspace, _super);
    function CmisWorkspace(node) {
        var _this = _super.call(this, node) || this;
        _this.collections = Util.processCollections(node);
        _this.uriTemplates = Util.processUriTemplates(node);
        return _this;
    }
    CmisWorkspace.prototype.getQueryResults = function (query, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["query"].template;
            var mediaType = this.uriTemplates["query"].mediaType;
            var params = { q: query };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new feed_1.default(Util.select("./atom:feed", doc, true));
                });
            }
        }
    };
    CmisWorkspace.prototype.getCmisEntryById = function (id, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["objectbyid"].template;
            var mediaType = this.uriTemplates["objectbyid"].mediaType;
            var params = { id: id };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                });
            }
        }
    };
    CmisWorkspace.prototype.getCmisEntryByPath = function (path, options) {
        if (this.uriTemplates) {
            var url = this.uriTemplates["objectbypath"].template;
            var mediaType = this.uriTemplates["objectbypath"].mediaType;
            var params = { path: path };
            if (options) {
                params = tslib_1.__assign({}, params, options);
                // _.extend(params, options);
            }
            for (var key in params) {
                if (key) {
                    var value = params[key];
                    if (value) {
                        url = url.replace(["{", key, "}"].join(""), value);
                    }
                }
            }
            url = url.replace(/\{(.+?)\}/gi, "");
            if (url) {
                return Util.getCmisResource(url, mediaType).then(function (doc) {
                    return new entry_1.default(Util.select("./atom:entry", doc, true));
                });
            }
        }
    };
    return CmisWorkspace;
}(base_1.default));
exports.default = CmisWorkspace;

},{"./base":7,"./entry":8,"./feed":9,"./util":12,"tslib":47}],14:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Config allows to specify REST , WebCenter & CS Prefix URLs. This information is used in rest of the modules
 */
/*rsciispr11 and rscisspr12*/
// import * as _ from "lodash";
var restUrl = "/rest";
var csUrl;
var wcUrl;
if (typeof (window) !== "undefined" && window.location) {
    restUrl = [window.location.protocol, "//", window.location.host, restUrl].join("");
}
function removeLastSlash(url) {
    if (!url) {
        return url;
    }
    if (url.endsWith("/")) {
        return url.substring(0, url.length - 1);
    }
    else {
        return url;
    }
}
/**
 * sets WebCenter REST Base URL.
 * @param url  URL prefix for WebCenter REST eg. http://webcenter-host/rest.
 */
function setRestBaseUrl(url) {
    restUrl = removeLastSlash(url);
}
exports.setRestBaseUrl = setRestBaseUrl;
/**
 * sets WebCenter Content (UCM) Base URL.
 * @param url  URL prefix for WebCenter Content (UCM) eg. http://webcenter-content-host/cs.
 */
function setCsBaseUrl(url) {
    csUrl = removeLastSlash(url);
}
exports.setCsBaseUrl = setCsBaseUrl;
/**
 * sets WebCenter Base URL.
 * @param url  URL prefix for WebCenter eg. http://webcenter-host/webcenter.
 */
function setWcBaseUrl(url) {
    wcUrl = removeLastSlash(url);
}
exports.setWcBaseUrl = setWcBaseUrl;
/**
 * Method to get configured WebCenter REST Base URL.
 * @returns       configured WebCenter REST Base URL.
 */
function getRestBaseUrl() {
    return restUrl;
}
exports.getRestBaseUrl = getRestBaseUrl;
/**
 * Method to get configured WebCenter Content (UCM) Base URL.
 * @returns       configured WebCenter Content (UCM) Base URL.
 */
function getCsBaseUrl() {
    return csUrl;
}
exports.getCsBaseUrl = getCsBaseUrl;
/**
 * Method to get configured WebCenter Base URL.
 * @returns       configured WebCenter Base URL.
 */
function getWcBaseUrl() {
    return wcUrl;
}
exports.getWcBaseUrl = getWcBaseUrl;

},{}],15:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
// import * as _ from "lodash";
var Auth = require("./auth");
var Config = require("./config");
var ITEMS_PER_PAGE = 40;
function getResourceUrlFromLinks(links, resourceType, rel) {
    var linkElements = links.filter(function (link, idx) {
        return (rel ?
            (link.resourceType === rel && link.rel === resourceType) :
            (link.resourceType === resourceType || link.rel === resourceType));
    });
    var linkEle;
    if (linkElements.length > 0) {
        if (linkElements.length === 1) {
            linkEle = linkElements[0];
        }
        else {
            for (var _i = 0, linkElements_1 = linkElements; _i < linkElements_1.length; _i++) {
                var link = linkElements_1[_i];
                if (link.rel === "alternate") {
                    linkEle = link;
                    break;
                }
            }
            if (!linkEle) {
                linkEle = linkElements[0];
            }
        }
        return linkEle.template ? linkEle.template : linkEle.href;
    }
    else {
        return null;
    }
}
exports.getResourceUrlFromLinks = getResourceUrlFromLinks;
/**
 * Gets the ResourceUrl based on the following params.
 * This method is specifically designed to work with Webcenter REST API [Link Model](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDHGHA)
 * @param resourceType Parameter [Resource Type](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABGIABJ)
 * @param rel Parameter [Relationship](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDJBBJ)
 * @param parameters key/value pairs to replace query parameter placeholders in [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABCEBGB)
 * @param projection One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param startIndex One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param itemsPerPage One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 */
function getResourceUrl(resourceType, rel) {
    return Auth.getResourceIndex().then(function (resourceIndex) {
        return getResourceUrlFromLinks(resourceIndex.links, resourceType, rel);
    });
}
exports.getResourceUrl = getResourceUrl;
function getPersonResourceUrl(person, resourceType, rel) {
    return getResourceUrlFromLinks(person.links, resourceType, rel);
}
exports.getPersonResourceUrl = getPersonResourceUrl;
function getTemplateItem(items, type) {
    var item;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var it_1 = items_1[_i];
        if (it_1.type === type) {
            item = it_1;
            break;
        }
    }
    return item;
}
exports.getTemplateItem = getTemplateItem;
function removeEmpty(obj) {
    Object.keys(obj).forEach(function (key) {
        return (obj[key] && typeof obj[key] === "object") && removeEmpty(obj[key]) ||
            (obj[key] === undefined || obj[key] === null) && delete obj[key];
    });
    return obj;
}
function doGet(serviceUrlSuffix, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios_1.default.get(serviceUrlSuffix, httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doGet = doGet;
function doPut(serviceUrlSuffix, data, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    // data = data ? _.omitBy(data, _.isNil) : data;
    return axios_1.default.put(serviceUrlSuffix, removeEmpty(data), httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doPut = doPut;
function doPost(serviceUrlSuffix, data, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    // data = data ? _.omitBy(data, _.isNil) : data;
    return axios_1.default.post(serviceUrlSuffix, removeEmpty(data), httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doPost = doPost;
function doDelete(serviceUrlSuffix, params, httpOptions) {
    httpOptions = httpOptions ? httpOptions : {};
    httpOptions.params = params;
    return axios_1.default.delete(serviceUrlSuffix, httpOptions).then(function (response) {
        return response.data;
    });
}
exports.doDelete = doDelete;
function getNavigations() {
    return getResourceUrl("urn:oracle:webcenter:navigations").then(function (url) {
        var resPromise = axios_1.default.get(url);
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getNavigations = getNavigations;
function getResourceTypes() {
    return getResourceUrl("urn:oracle:webcenter:resourcetypes").then(function (url) {
        var resPromise = axios_1.default.get(url);
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getResourceTypes = getResourceTypes;
function determineFunctionName(link) {
    var rel;
    var functionName;
    var resourceType;
    if (link.rel) {
        rel = "-" + link.rel.split(":")[link.rel.split(":").length - 1];
        rel = rel.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        functionName = rel;
    }
    if (link.resourceType) {
        resourceType = "-" + link.resourceType.split(":")[link.resourceType.split(":").length - 1];
        resourceType = resourceType.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
        functionName = resourceType;
    }
    if (link.rel && link.resourceType) {
        if (rel === "Self") {
            functionName = "";
        }
        else {
            if (rel === resourceType) {
                functionName = rel;
            }
            else {
                functionName = rel + resourceType;
            }
        }
    }
    if (link.type) {
        functionName = functionName + "Url";
    }
    return functionName;
}
function traverse(data) {
    if (data) {
        for (var key in data) {
            if (key !== null && key === "links") {
                var links = data.links;
                var _loop_1 = function (link) {
                    var capabilitiesStr = link.capabilities;
                    var functionName = determineFunctionName(link);
                    if (capabilitiesStr) {
                        var capabilities = link.capabilities.split(" ");
                        for (var _i = 0, capabilities_1 = capabilities; _i < capabilities_1.length; _i++) {
                            var capability = capabilities_1[_i];
                            if (capability === "urn:oracle:webcenter:read") {
                                data["get" + functionName] = function (parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.get(url, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:create") {
                                data["create" + functionName] = function (createData, parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.post(url, createData, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:update") {
                                data["update" + functionName] = function (updateData, parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.put(url, updateData, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                            if (capability === "urn:oracle:webcenter:delete") {
                                data["delete" + functionName] = function (parameters, projection, startIndex, itemsPerPage) {
                                    if (startIndex === void 0) { startIndex = 0; }
                                    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
                                    var url = link.template ? link.template : link.href;
                                    if (url) {
                                        return axios_1.default.delete(url, {
                                            params: {
                                                projection: projection,
                                                startIndex: startIndex,
                                                itemsPerPage: itemsPerPage,
                                            },
                                        }).then(function (response) {
                                            return response.data;
                                        });
                                    }
                                };
                            }
                        }
                    }
                };
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var link = links_1[_i];
                    _loop_1(link);
                }
            }
            else {
                if (key !== null && typeof (data[key]) === "object") {
                    traverse(data[key]);
                }
            }
        }
    }
}
axios_1.default.interceptors.response.use(function (response) {
    var config = response.config;
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    if (url.indexOf(restBaseUrl) >= 0) {
        if (response.data) {
            var data = response.data;
            traverse(data);
            response.data = data;
        }
    }
    return response;
}, function (error) {
    throw error;
});
function getUrlParams(url) {
    var obj = {};
    if (url) {
        var queryString = url.split("?")[1];
        if (queryString) {
            queryString = queryString.split("#")[0];
            var arr = queryString.split("&");
            var _loop_2 = function (itm) {
                var a = itm.split("=");
                var paramNum = undefined;
                var paramName = a[0].replace(/\[\d*\]/, function (v) {
                    paramNum = v.slice(1, -1);
                    return "";
                });
                var paramValue = typeof (a[1]) === "undefined" ? "" : a[1];
                paramName = decodeURIComponent(paramName);
                paramValue = decodeURIComponent(paramValue);
                if (obj[paramName]) {
                    if (typeof obj[paramName] === "string") {
                        obj[paramName] = [obj[paramName]];
                    }
                    if (typeof paramNum === "undefined") {
                        obj[paramName].push(paramValue);
                    }
                    else {
                        obj[paramName][paramNum] = paramValue;
                    }
                }
                else {
                    obj[paramName] = paramValue;
                }
            };
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var itm = arr_1[_i];
                _loop_2(itm);
            }
        }
    }
    return obj;
}
axios_1.default.interceptors.request.use(function (config) {
    var url = config.url;
    var restBaseUrl = Config.getRestBaseUrl();
    var isApiReq = false;
    if (url[0] === "/") {
        url = [restBaseUrl, url].join("");
        isApiReq = true;
    }
    else {
        var idxPort80 = url.indexOf(":80/");
        if (idxPort80 > 0) {
            url = [url.substr(0, idxPort80), url.substr(idxPort80 + 3)].join("");
        }
        if (url.startsWith(restBaseUrl)) {
            isApiReq = true;
        }
    }
    if (isApiReq) {
        var urlNoParams = url.split("?")[0];
        var urlParams = getUrlParams(url);
        var resParams = {
            data: "data",
            itemsPerPage: ITEMS_PER_PAGE,
            projection: "summary",
            startIndex: 0,
        };
        resParams = tslib_1.__assign({}, resParams, urlParams, config.params);
        // _.extend(resParams, urlParams, config.params);
        for (var par in resParams) {
            if (par) {
                var paramVal = resParams[par];
                if (paramVal && paramVal[0] !== "{") {
                    urlNoParams = urlNoParams.replace(["{", par, "}"].join(""), paramVal ? paramVal : "");
                }
                else {
                    delete resParams[par];
                }
            }
        }
        config.url = encodeURI(urlNoParams);
        config.params = resParams;
        // console.log("---------- URL ---------------", config.url);
        // console.log("---------- Params ---------------", config.params);
    }
    return config;
}, function (error) {
    throw error;
});

},{"./auth":6,"./config":14,"axios":22,"tslib":47}],16:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Core = require("./core");
var FORUMS_API = "/api/discussions/forums";
var FORUM_API = "/api/discussions/forums/{id}";
var FORUM_TOPICS_API = "/api/discussions/forums/{forumId}/topics";
var FORUM_TOPIC_API = "/api/discussions/forums/{forumId}/topics/{id}";
var SPACE_FORUMS_API = "/api/spaces/{spaceName}/discussions/forums";
var FORUM_TOPIC_MESSAGES_API = "/api/discussions/forums/{forumId}/topics/{topicId}/messages";
var FORUM_TOPIC_MESSAGE_API = "/api/discussions/forums/{forumId}/topics/{topicId}/messages/{id}";
var ITEMS_PER_PAGE = 40;
function getForums(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(FORUMS_API, params);
}
exports.getForums = getForums;
function getPortalForums(portalName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        spaceName: portalName,
    };
    return Core.doGet(SPACE_FORUMS_API, params);
}
exports.getPortalForums = getPortalForums;
function createForum(name, displayName, description) {
    var forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description: description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name: name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    var params = {};
    return Core.doPost(FORUMS_API, forum, params);
}
exports.createForum = createForum;
function updateForum(forum) {
    var params = {};
    return Core.doPut(FORUMS_API, forum, params);
}
exports.updateForum = updateForum;
function updateForum2(name, displayName, description) {
    var forum = {
        author: null,
        createdBy: null,
        createdOn: null,
        description: description,
        displayName: displayName ? displayName : name,
        favorite: null,
        id: null,
        links: null,
        locked: false,
        messageCount: null,
        modifiedByUser: null,
        name: name,
        parentId: null,
        resourceType: null,
        topicCount: null,
        updatedBy: null,
        updatedOn: null,
        webUrl: null,
    };
    var params = {};
    return Core.doPut(FORUMS_API, forum, params);
}
exports.updateForum2 = updateForum2;
function getForum(forumId) {
    var params = {
        id: forumId,
    };
    return Core.doGet(FORUM_API, params);
}
exports.getForum = getForum;
function deleteForum(forumId) {
    var params = {
        id: forumId,
    };
    return Core.doDelete(FORUM_API, params);
}
exports.deleteForum = deleteForum;
/*
 * Topics for a Forum
 */
function getTopics(forumId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        forumId: forumId,
    };
    return Core.doGet(FORUM_TOPICS_API, params);
}
exports.getTopics = getTopics;
function getTopic(forumId, topicId) {
    var params = {
        id: topicId,
        forumId: forumId,
    };
    return Core.doGet(FORUM_TOPIC_API, params);
}
exports.getTopic = getTopic;
function deleteTopic(forumId, topicId) {
    var params = {
        id: topicId,
        forumId: forumId,
    };
    return Core.doDelete(FORUM_TOPIC_API, params);
}
exports.deleteTopic = deleteTopic;
function createTopic(forumId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
    };
    return Core.doPost(FORUM_TOPICS_API, topic, params);
}
exports.createTopic = createTopic;
function updateTopic(topic) {
    var params = {
        forumId: topic.forumId,
        id: topic.id,
    };
    return Core.doPut(FORUM_TOPIC_API, topic, params);
}
exports.updateTopic = updateTopic;
function updateTopic2(forumId, topicId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
        id: topicId,
    };
    return Core.doPut(FORUMS_API, topic, params);
}
exports.updateTopic2 = updateTopic2;
/*
 * Topic Messages
 */
function getMessages(forumId, topicId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGES_API, params);
}
exports.getMessages = getMessages;
function getMessage(forumId, topicId, messageId) {
    var params = {
        id: messageId,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doGet(FORUM_TOPIC_MESSAGE_API, params);
}
exports.getMessage = getMessage;
function deleteMessage(forumId, topicId, messageId) {
    var params = {
        id: messageId,
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doDelete(FORUM_TOPIC_MESSAGE_API, params);
}
exports.deleteMessage = deleteMessage;
function createMessage(forumId, topicId, subject, body) {
    var message = {
        body: body,
        forumId: forumId,
        topicId: topicId,
        subject: subject,
    };
    var params = {
        forumId: forumId,
        topicId: topicId,
    };
    return Core.doPost(FORUM_TOPIC_MESSAGES_API, message, params);
}
exports.createMessage = createMessage;
function updateMessage(message) {
    var params = {
        forumId: message.forumId,
        id: message.id,
        topicId: message.topicId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, message, params);
}
exports.updateMessage = updateMessage;
function updateMessage2(forumId, topicId, messageId, subject, body) {
    var topic = {
        body: body,
        forumId: forumId,
        subject: subject,
        topicId: topicId,
    };
    var params = {
        forumId: forumId,
        topicId: topicId,
        id: messageId,
    };
    return Core.doPut(FORUM_TOPIC_MESSAGE_API, topic, params);
}
exports.updateMessage2 = updateMessage2;

},{"./core":15}],17:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Core = require("./core");
var EVENTS_API = "/api/spaces/{guid}/events?startDate={startDate}&endDate={endDate}";
var EVENT_API = "/api/spaces/{guid}/events/{id}";
var EVENT_CATEGORIES_API = "/api/spaces/{guid}/eventCategories";
var DEFAULT_SCOPE_ID = "s8bba98ff_4cbb_40b8_beee_296c916a23ed";
/*
 * Valid date formats are
 * yyyy-MM-dd
 * yyyy-MM-ddZ
 * yyyy-MM-dd'T'HH:mm:ss
 * yyyy-MM-dd'T'HH:mm:ssZ
 */
/*
 * Events are not applicable for defaultScope yet.
 */
function getPortalEvents(portalGuid, startDate, endDate) {
    var params = {
        guid: portalGuid,
        startDate: startDate,
        endDate: endDate,
    };
    return Core.doGet(EVENTS_API, params);
}
exports.getPortalEvents = getPortalEvents;
function createPortalEvent(portalGuid, eventSummary, startTime, endTime, priority, location, category, details) {
    if (priority === void 0) { priority = 3; }
    var eventItem = {
        author: null,
        category: category,
        created: null,
        details: details,
        duration: null,
        endTime: endTime,
        groupSpace: null,
        id: null,
        isAllDayEvent: false,
        links: null,
        location: location,
        modified: null,
        modifiedByUser: null,
        priority: priority,
        resourceType: null,
        startTime: startTime,
        summary: eventSummary,
    };
    var params = {
        guid: portalGuid,
    };
    return Core.doPost(EVENTS_API, eventItem, params);
}
exports.createPortalEvent = createPortalEvent;
function getPortalEvent(portalGuid, eventId) {
    var params = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doGet(EVENT_API, params);
}
exports.getPortalEvent = getPortalEvent;
function updatePortalEvent(portalGuid, event) {
    var params = {
        guid: portalGuid,
        id: event.id,
    };
    return Core.doPut(EVENT_API, event, params);
}
exports.updatePortalEvent = updatePortalEvent;
function deletePortalEvent(portalGuid, eventId) {
    var params = {
        guid: portalGuid,
        id: eventId,
    };
    return Core.doDelete(EVENT_API, params);
}
exports.deletePortalEvent = deletePortalEvent;
function getPortalEventCategories(portalGuid) {
    var params = {
        guid: portalGuid,
    };
    return Core.doGet(EVENT_CATEGORIES_API, params);
}
exports.getPortalEventCategories = getPortalEventCategories;
function createPortalEventCategory(portalGuid, categoryName) {
    var category = {
        links: null,
        name: categoryName,
        resourceType: null,
    };
    var params = {
        guid: portalGuid,
    };
    return Core.doPost(EVENT_CATEGORIES_API, category, params);
}
exports.createPortalEventCategory = createPortalEventCategory;

},{"./core":15}],18:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityStream = require("./activities");
var Auth = require("./auth");
var Cmis = require("./cmis");
var Config = require("./config");
var Core = require("./core");
var Discussions = require("./discussions");
var Events = require("./events");
var People = require("./people");
var Spaces = require("./spaces");
var Wall = require("./wall");
var WebCenter = {
    ActivityStream: ActivityStream,
    Auth: Auth,
    Cmis: Cmis,
    Config: Config,
    Core: Core,
    Discussions: Discussions,
    Events: Events,
    People: People,
    Spaces: Spaces,
    Wall: Wall,
};
if (typeof (window) !== "undefined") {
    var win = window;
    win.WebCenter = WebCenter;
}
exports.default = WebCenter;

},{"./activities":5,"./auth":6,"./cmis":10,"./config":14,"./core":15,"./discussions":16,"./events":17,"./people":19,"./spaces":20,"./wall":21}],19:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Core = require("./core");
var INVITATION_API = "/api/people/invitations/{id}";
var INVITATIONS_API = "/api/people/invitations";
var LISTS_API = "/api/people/{guid}/listNames";
var LIST_API = "/api/people/{guid}/listNames/{listid}";
var LIST_MEMBER_API = "/api/people/{guid}/lists/{listid}/members/{memberguid}";
var LISTDETAIL_API = "/api/people/{guid}/lists/{listid}";
var STATUS_API = "/api/people/{guid}/status";
var FEEDBACKS_API = "/api/feedback/{guid}/{selector}";
var FEEDBACK_API = "/api/feedback/{guid}/@self/{mid}";
var ITEMS_PER_PAGE = 40;
/**
 * Get Received [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
function getReceivedInvitations(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:people:invitations", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                q: "invitee:equals:@me",
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            },
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getReceivedInvitations = getReceivedInvitations;
/**
 * Get Sent [Invitations](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDCHBDB) for the logged in User
 * @returns a Http Promise that will resolve to InvitationList
 */
function getSentInvitations(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:people:invitations", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                q: "invitor:equals:@me",
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            },
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getSentInvitations = getSentInvitations;
/**
 * Accept an [Invitation](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_people.htm#CHDECDDG) by its Id
 * @param inviteId Invitation ID, once of the invitation from [[getReceivedInvitations]]
 */
function acceptInvite(inviteId) {
    var invitation = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "accepted",
    };
    var params = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}
exports.acceptInvite = acceptInvite;
function ignoreInvite(inviteId) {
    var invitation = {
        id: inviteId,
        invitee: null,
        invitor: null,
        links: null,
        message: null,
        resourceType: null,
        sentDate: null,
        status: "ignored",
    };
    var params = {
        id: inviteId,
    };
    return Core.doPut(INVITATION_API, invitation, params);
}
exports.ignoreInvite = ignoreInvite;
function deleteInvite(inviteId) {
    var params = {
        id: inviteId,
    };
    return Core.doDelete(INVITATION_API, params);
}
exports.deleteInvite = deleteInvite;
function createInvite(userGuid, invitationMessage) {
    var invitation = {
        id: null,
        invitee: {
            displayName: null,
            guid: userGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        invitor: null,
        links: null,
        message: invitationMessage,
        resourceType: null,
        sentDate: null,
        status: null,
    };
    return Core.doPost(INVITATIONS_API, invitation);
}
exports.createInvite = createInvite;
/*
 * A List is a simple Contact Group
 */
function getListNames() {
    var params = {
        guid: "@me",
    };
    return Core.doGet(LISTS_API, params);
}
exports.getListNames = getListNames;
function getReceivedFeedback(guid, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        guid: guid,
        selector: "@self",
    };
    return Core.doGet(FEEDBACKS_API, params);
}
exports.getReceivedFeedback = getReceivedFeedback;
function getGivenFeedback(guid, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        guid: guid,
        selector: "@all",
    };
    return Core.doGet(FEEDBACKS_API, params);
}
exports.getGivenFeedback = getGivenFeedback;
function createFeedback(feedback, receiverGuid) {
    var params = {
        guid: receiverGuid,
        selector: "@self",
    };
    var feedbackItem = {
        author: null,
        body: feedback,
        created: null,
        deleteAllowed: true,
        hideAllowed: true,
        id: null,
        links: null,
        receivedUser: {
            displayName: null,
            guid: receiverGuid,
            id: null,
            links: null,
            resourceType: null,
        },
        resourceType: null,
    };
    return Core.doPost(FEEDBACKS_API, feedbackItem, params);
}
exports.createFeedback = createFeedback;
function deleteFeedback(mid, guid) {
    if (guid === void 0) { guid = "@me"; }
    var params = {
        guid: guid,
    };
    return Core.doDelete(FEEDBACK_API, params);
}
exports.deleteFeedback = deleteFeedback;
function getPersonList(listId, attrs, links, projection, startIndex, itemsPerPage) {
    if (listId === void 0) { listId = "@self"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (listId === "@self") {
        // requested self profile
        var pars = {
            guid: "@me",
            listid: listId,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    }
    else {
        var attrsCsv = "";
        var linksCsv = "";
        if (links && links.length > 0) {
            linksCsv = links.join(",");
        }
        if (attrs && attrs.length > 0) {
            attrsCsv = attrs.join(",");
        }
        var pars = {
            data: attrsCsv,
            guid: "@me",
            itemsPerPage: itemsPerPage,
            links: linksCsv,
            listid: listId,
            projection: projection,
            startIndex: startIndex,
        };
        return Core.doGet(LISTDETAIL_API, pars);
    }
}
exports.getPersonList = getPersonList;
function getConnections(startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var listId = "@connections";
    return this.getPersonList(listId, null, null, null, startIndex, itemsPerPage);
}
exports.getConnections = getConnections;
function getSelf(attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var pars = {
        data: attrsCsv,
        guid: "@me",
        links: linksCsv,
        listid: "@self",
    };
    return Core.doGet(LISTDETAIL_API, pars);
}
exports.getSelf = getSelf;
function createList(listName) {
    var listObject = {
        links: null,
        name: listName,
        resourceType: null,
    };
    var params = {
        guid: "@me",
    };
    return Core.doPost(LISTS_API, listObject, params);
}
exports.createList = createList;
function deleteList(listId) {
    var params = {
        guid: "@me",
        listid: listId,
    };
    return Core.doDelete(LIST_API, params);
}
exports.deleteList = deleteList;
function deleteMemberFromList(listId, memberGuid) {
    var params = {
        guid: "@me",
        listid: listId,
        memberguid: memberGuid,
    };
    return Core.doDelete(LIST_MEMBER_API, params);
}
exports.deleteMemberFromList = deleteMemberFromList;
function addMemberToList(listId, memberGuid, message) {
    /*
     Adding a member to a listId = '@connections' will send an invite to the user before adding to the connections list
     */
    var listMember = {
        guid: memberGuid,
        message: message,
        links: null,
        resourceType: null,
    };
    var pars = {
        guid: "@me",
        listid: listId,
    };
    return Core.doPost(LISTDETAIL_API, listMember, pars);
}
exports.addMemberToList = addMemberToList;
function getPerson(query, data, links) {
    /*
     * data – A standard set that returns all the standard data for the response, but does not include status, manager, reportees, or photos.
     * 1. If both the projection and data query string parameters are present, the data parameter will be used to determine which data to return.
     * 2. If you specify the constant 'data' as the data parameter, all the basic information will be returned for the resource.
     * 3. The data parameter can also take any of the following values comma-separated values to return the corresponding data:
     *      guid, id, displayName, birthday, language, timeZone, name, addresses, organizations, workEmail, phoneNumbers, manager, reportees, photos, and/or status.
     *
     * The data parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */
    /*
     * links - links – A standard set that returns all the standard links for the response, but does not include status, manager, reportees, or photos.
     * If both the projection and links query string parameters are present, the links parameter will be used to determine which links to return.
     * If you specify the constant 'links' as the links parameter, all the basic information will be returned for the resource.
     *
     * The links parameter also takes zero or more of the following comma-separated parameter:
     *      person, profile, icon, status, messageBoard, activities, personActivities, connectionActivities, connections, listNames, invitation, givenFeedback, receivedFeedback, userGivenFeedback, manager, reportees, and/or member.
     *
     * The links parameter can also take a predefined set parameter like basic. For example, if you specify data=basic, it is the equivalent of specifying data=guid, id, displayName.
     * You can also specify additional parameters as needed. For example, you could specify data=basic,birthday.
     */
    /*
     * query formats are
     * loginid:equals:<loginid>
     * guid:equals:<guid>
     * email:equals:<email>
     */
    if (!data) {
        data = "basic,\n                birthday,\n                language,\n                timeZone,\n                name,\n                addresses,\n                organizations,\n                workEmail,\n                phoneNumbers,\n                manager,\n                reportees,\n                photos,\n                status";
    }
    if (!links) {
        links = "person,\n                profile,\n                icon,\n                status,\n                messageBoard,\n                activities,\n                personActivities,\n                connectionActivities,\n                connections,\n                listNames,\n                invitation,\n                givenFeedback,\n                receivedFeedback,\n                userGivenFeedback,\n                manager,\n                reportees,\n                member";
    }
    var params = {
        q: query,
        data: data,
        links: links,
    };
    return Core.getResourceUrl("urn:oracle:webcenter:people:person", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: params,
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getPerson = getPerson;
function getPersonByLoginId(loginId, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    if (loginId) {
        var query = "loginid:equals:" + loginId;
        return this.getPerson(query, attrsCsv, linksCsv);
    }
}
exports.getPersonByLoginId = getPersonByLoginId;
function getPersonByGuid(guid, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var query = "guid:equals:" + guid;
    return this.getPerson(query, attrsCsv, linksCsv);
}
exports.getPersonByGuid = getPersonByGuid;
function getPersonByEmail(email, attrs, links) {
    var attrsCsv = "";
    var linksCsv = "";
    if (links && links.length > 0) {
        linksCsv = links.join(",");
    }
    if (attrs && attrs.length > 0) {
        attrsCsv = attrs.join(",");
    }
    var query = "email:equals:" + email;
    return this.getPerson(query, attrsCsv, linksCsv);
}
exports.getPersonByEmail = getPersonByEmail;
function getStatus(userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    var pars = {
        guid: "@me",
    };
    return Core.doGet(STATUS_API, pars);
}
exports.getStatus = getStatus;
function updateStatus(message) {
    var statusItem = {
        links: null,
        note: message,
        resourceType: null,
    };
    var pars = {
        guid: "@me",
    };
    return Core.doPut(STATUS_API, statusItem, pars);
}
exports.updateStatus = updateStatus;

},{"./core":15,"axios":22}],20:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Core = require("./core");
var SPACE_API = "/api/spaces/{spacename}";
var MEMBERS_API = "/api/spaces/{spacename}/members";
var ATTRIBUTES_API = "/api/spaces/{spacename}/attributes";
var ATTRIBUTE_API = "/api/spaces/{spacename}/attributes/{attribute}";
var CHILDREN_API = "/api/spaces/{spacename}/children";
var ROLES_API = "/api/spaces/{spacename}/roles";
var TEMPLATES_API = "/api/spaces/resource/templates?search={search}";
var TEMPLATE_API = "/api/spaces/resource/templates/{templatename}";
var TEMPLATE_ROLES_API = "/api/spaces/resource/templates/{templatename}/roles";
var TEMPLATE_ATTRIBUTES_API = "/api/spaces/resource/templates/{templatename}/attributes";
var SITERESOURCES_API = "/api/spaces/{spacename}/siteresources";
var LISTS_API = "/api/spaces/{spacename}/lists";
var ITEMS_PER_PAGE = 40;
/**
 * Get [Lists](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABJGCBJ) for Portal
 * @param portalName portal name (This is not same as Portal Display Name nor is it the Portal Scope ID)
 * @param query of the format `attribute:operator:value`. Listed below are further properties for attribute,operator and value
 * + **attribute :** Valid attributes are name, title, description, creator, created, modifier, and modified of which name, title, description, creator, and modifier are strings and created, modified are dates
 * + **operator :**
 *  - strings : "equals", "not.equals", "contains", "starts.with", "reg.exp.match"
 *  - dates : "equals", "not.equals", "greater.than", "greater.than.or.equals", "less.than", "less.than.or.equals"
 *
 * date example: `created:greater.than:10-SEP-2009`
 * string example : `title:starts.with:xyz`
 * @param projection  valid values are `summary`, `details`
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns Http Promise that resolves to SpacesLists
 */
function getSpaceLists(spaceName, query, projection, startIndex, itemsPerPage) {
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        itemsPerPage: itemsPerPage,
        projection: projection,
        q: query,
        spacename: spaceName,
        startIndex: startIndex,
    };
    return Core.doGet(LISTS_API, params);
}
exports.getSpaceLists = getSpaceLists;
/**
 * Create a portal [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH)
 *
 * @param portalName Portal Name (This is not same as portal display name)
 * @param spaceList  Parameter [List](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#BABGHFAH) Object
 * @returns Http Promise that resolves to SpacesList
 */
function createSpaceList(spaceName, spaceList) {
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(LISTS_API, spaceList, params);
}
exports.createSpaceList = createSpaceList;
/**
 * Create [Portal](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADJIDH)
 * @param name Portal name
 * @param baseTemplate template on which portal will be based of response from [[getPortalTemplates]]
 * @param description  optional description of the portal
 * @returns a Http Promise that resolves to Created Portal Object
 */
function createSpace(name, baseTemplate, description) {
    return Core.getResourceUrl("urn:oracle:webcenter:spaces").then(function (spacesURL) {
        var resPromise = axios_1.default.post(spacesURL, {
            name: name,
            description: description,
            templateName: baseTemplate,
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.createSpace = createSpace;
/**
 * Get list of available Portal [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param search search term
 * @param projection valid values are summary, details
 * @param startIndex pagination
 * @param itemsPerPage pagination
 * @returns a Http Promise that resolves to a Portal Templates
 */
function getTemplates(search, projection, startIndex, itemsPerPage) {
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:spaces:resource:templates", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                search: search,
                projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            }
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getTemplates = getTemplates;
/**
 * Get Portal [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI)
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
function getTemplate(templateName, projection) {
    var params = {
        templatename: templateName,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_API, params);
}
exports.getTemplate = getTemplate;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Roles
 * @param templateName Template name
 * @param projection valid values are summary, details
 */
function getTemplateRoles(templatename, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        templatename: templatename,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_ROLES_API, params);
}
exports.getTemplateRoles = getTemplateRoles;
/**
 * Get [Template](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_spaces.htm#CJADIDHI) Attributes
 * @param templateName Template name
 */
function getTemplateAttributes(templatename, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        itemsPerPage: itemsPerPage,
        startIndex: startIndex,
        templatename: templatename,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(TEMPLATE_ATTRIBUTES_API, params);
}
exports.getTemplateAttributes = getTemplateAttributes;
/**
 * Search [Site Resources](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_view_comps.htm#CIHHHFEJ)
 *
 * @param search this is in the format of attribute:equals:value where attribute is one of siteResourceType,seeded
 * for example `siteResourceType:equals:xyz` or `seeded:equals:abc`
 * @param spaceName optional parameter that provide search of site resources at portal level
 * @param projection valid values are summary,details
 */
function getSiteResources(spaceName, searchQuery, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (spaceName) {
        var params = {
            itemsPerPage: itemsPerPage,
            q: searchQuery,
            spacename: spaceName,
            startIndex: startIndex,
        };
        if (projection) {
            params.projection = projection;
        }
        return Core.doGet(SITERESOURCES_API, params);
    }
    else {
        return Core.getResourceUrl("urn:oracle:webcenter:spaces:siteresources", null).then(function (url) {
            return axios_1.default.get(url, {
                params: {
                    q: searchQuery,
                    projection: projection,
                    startIndex: startIndex,
                    itemsPerPage: itemsPerPage,
                }
            }).then(function (response) {
                return response.data;
            });
        });
    }
}
exports.getSiteResources = getSiteResources;
/**
 * Search Portals
 *
 * @param search search term
 * @param visibility valid values are public,joined,discoverable,moderated,all
 * @param projection valid values are summary,details
 * @param startIndex pagination
 * @param perPage pagination
 * @returns a Http Promise that resolves to PortalList
 */
function getSpaces(search, visibility, projection, startIndex, itemsPerPage) {
    if (visibility === void 0) { visibility = "joined"; }
    if (projection === void 0) { projection = "summary"; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:spaces", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: {
                search: search,
                visibility: visibility,
                projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage,
            }
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getSpaces = getSpaces;
/**
 * Get a Portal by name
 *
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portal
 */
function getSpace(spaceName, projection) {
    var params = {
        spacename: spaceName,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(SPACE_API, params);
}
exports.getSpace = getSpace;
/**
 * Get Portal Children
 * @param spacesName portal name
 * @param projection valid values are summary,details
 * @returns a Http Promise that resolves to Portals List
 */
function getChildren(spaceName, projection, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    if (projection) {
        params.projection = projection;
    }
    return Core.doGet(CHILDREN_API, params);
}
exports.getChildren = getChildren;
/**
 * Delete Portal
 * @param spaceName portal name
 */
function deleteSpace(spaceName) {
    var params = {
        spacename: spaceName,
    };
    return Core.doDelete(SPACE_API, params);
}
exports.deleteSpace = deleteSpace;
/**
 * Get Portal Attributes
 * @param spaceName portal name
 */
function getAttributes(spaceName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(ATTRIBUTES_API, params);
}
exports.getAttributes = getAttributes;
/**
 * Create a Portal Attribute
 *
 * @param spaceName portal name
 * @param attrName Portal attribute name
 * @param attrValue Portal attribute value
 * @param attrDesc Portal attribute description
 */
function createAttribute(spaceName, attrName, attrValue, attrDesc) {
    var attribute = {
        description: attrDesc,
        links: null,
        name: attrName,
        resourceType: null,
        type: null,
        value: attrValue,
    };
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(ATTRIBUTES_API, attribute, params);
}
exports.createAttribute = createAttribute;
/**
 * Get a specific Portal Attriute
 * @param spaceName portal name
 * @param attributeName Portal attribute name
 */
function getAttribute(spaceName, attributeName) {
    var params = {
        attribute: attributeName,
        spacename: spaceName,
    };
    return Core.doGet(ATTRIBUTE_API, params);
}
exports.getAttribute = getAttribute;
/**
 * Get Portal Members
 * @param spaceName portal name
 * @param startIndex Start Index
 * @param itemsPerPage Items Per Page
 * @returns a Http Promise that resolves to Members of Portal
 */
function getMembers(spaceName, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    var params = {
        spacename: spaceName,
        startIndex: startIndex,
        itemsPerPage: itemsPerPage,
    };
    return Core.doGet(MEMBERS_API, params);
}
exports.getMembers = getMembers;
/**
 * Add Member to Portal
 * @param spaceName portal name
 * @param member member information
 * @returns a Http Promise that resolves to Members of Portal
 */
function addMember(spaceName, member) {
    var params = {
        spacename: spaceName,
    };
    return Core.doPost(MEMBERS_API, member, params);
}
exports.addMember = addMember;
/**
 * Get Portal Roles
 * @param spaceName portal name
 */
function getSpaceRoles(spaceName) {
    var params = {
        spacename: spaceName,
    };
    return Core.doGet(ROLES_API, params);
}
exports.getSpaceRoles = getSpaceRoles;

},{"./core":15,"axios":22}],21:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios_1 = require("axios");
var Core = require("./core");
var WALL_API = "/api/messageBoards/{board-type}/{guid}";
var WALL_MESSAGE_TYPE_API = "/api/messageBoards/{board-type}/{guid}/{messageType}";
var WALL_MESSAGE_API = "/api/messageBoards/{board-type}/{guid}/messages/{mid}";
var ITEMS_PER_PAGE = 40;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["DEFAULT"] = 0] = "DEFAULT";
    MessageType[MessageType["PRIVATE"] = 1] = "PRIVATE";
    MessageType[MessageType["PUBLIC"] = 2] = "PUBLIC";
    MessageType[MessageType["HIDDEN"] = 3] = "HIDDEN";
    MessageType[MessageType["PRIVATE_HIDDEN"] = 4] = "PRIVATE_HIDDEN";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var BoardType;
(function (BoardType) {
    BoardType[BoardType["PERSON"] = 0] = "PERSON";
    BoardType[BoardType["SPACE"] = 1] = "SPACE";
})(BoardType = exports.BoardType || (exports.BoardType = {}));
function getMessageBoard(startIndex, itemsPerPage, params, projection) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return Core.getResourceUrl("urn:oracle:webcenter:messageBoard", null).then(function (url) {
        var resPromise = axios_1.default.get(url, {
            params: tslib_1.__assign({}, params, { projection: projection,
                startIndex: startIndex,
                itemsPerPage: itemsPerPage })
        });
        return resPromise.then(function (response) {
            return response.data;
        });
    });
}
exports.getMessageBoard = getMessageBoard;
function getMessages(guid, messageType, boardType, startIndex, itemsPerPage) {
    if (guid === void 0) { guid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    if (messageType === MessageType.DEFAULT) {
        var params = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid: guid,
            itemsPerPage: itemsPerPage,
            startIndex: startIndex,
        };
        return Core.doGet(WALL_API, params);
    }
    else {
        var mType = void 0;
        switch (messageType) {
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = null;
                break;
        }
        var pars = {
            "board-type": boardType === BoardType.SPACE ? "space" : "person",
            guid: guid,
            itemsPerPage: itemsPerPage,
            "messageType": mType,
            startIndex: startIndex,
        };
        return Core.doGet(WALL_MESSAGE_TYPE_API, pars);
    }
}
exports.getMessages = getMessages;
function getUserMessages(userGuid, messageType, startIndex, itemsPerPage) {
    if (userGuid === void 0) { userGuid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return getMessages(userGuid, messageType, BoardType.PERSON, startIndex, itemsPerPage);
}
exports.getUserMessages = getUserMessages;
function getPortalMessages(portalScopeId, startIndex, itemsPerPage) {
    if (startIndex === void 0) { startIndex = 0; }
    if (itemsPerPage === void 0) { itemsPerPage = ITEMS_PER_PAGE; }
    return getMessages(portalScopeId, MessageType.DEFAULT, BoardType.SPACE, startIndex, itemsPerPage);
}
exports.getPortalMessages = getPortalMessages;
function getVisibility(guid, messageType, boardType) {
    if (guid === void 0) { guid = "@me"; }
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    var mType = "private";
    if (guid === "@me") {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "hidden";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private_hidden";
                break;
            default:
                mType = "private";
                break;
        }
    }
    else {
        switch (messageType) {
            case MessageType.DEFAULT:
                mType = "private";
                break;
            case MessageType.PRIVATE:
                mType = "private";
                break;
            case MessageType.PUBLIC:
                mType = "public";
                break;
            case MessageType.HIDDEN:
                mType = "private";
                break;
            case MessageType.PRIVATE_HIDDEN:
                mType = "private";
                break;
            default:
                mType = "private";
                break;
        }
    }
    if (boardType === BoardType.SPACE) {
        mType = null;
    }
    return mType;
}
exports.getVisibility = getVisibility;
function post(messageText, messageType, boardType, guid, linkItem) {
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (guid === void 0) { guid = "@me"; }
    var wallMessageItem = {
        author: null,
        body: messageText,
        created: null,
        id: null,
        link: linkItem,
        links: null,
        resourceType: null,
        type: null,
        visibilityType: getVisibility(guid, messageType, boardType),
    };
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
    };
    return Core.doPost(WALL_API, wallMessageItem, pars);
}
exports.post = post;
function postMessage(messageText, messageType, userGuid, linkItem) {
    if (messageType === void 0) { messageType = MessageType.DEFAULT; }
    if (userGuid === void 0) { userGuid = "@me"; }
    return post(messageText, messageType, BoardType.PERSON, userGuid, linkItem);
}
exports.postMessage = postMessage;
function postToPortal(messageText, portalScopeId, linkItem) {
    return post(messageText, MessageType.PUBLIC, BoardType.SPACE, portalScopeId, linkItem);
}
exports.postToPortal = postToPortal;
function getMessage(messageId, boardType, guid) {
    if (boardType === void 0) { boardType = BoardType.PERSON; }
    if (guid === void 0) { guid = "@me"; }
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doGet(WALL_MESSAGE_API, pars);
}
exports.getMessage = getMessage;
function getUserMessage(messageId, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return getMessage(messageId, BoardType.PERSON, userGuid);
}
exports.getUserMessage = getUserMessage;
function getPortalMessage(messageId, portalScopeId) {
    return getMessage(messageId, BoardType.SPACE, portalScopeId);
}
exports.getPortalMessage = getPortalMessage;
function update(messageId, boardType, guid, messageItem) {
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doPut(WALL_MESSAGE_API, messageItem, pars);
}
exports.update = update;
function updateUserMessage(messageItem, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return update(messageItem.id, BoardType.PERSON, userGuid, messageItem);
}
exports.updateUserMessage = updateUserMessage;
function updatePortalMessage(messageItem, portalScopeId) {
    return this.update(messageItem.id, "space", portalScopeId, messageItem);
}
exports.updatePortalMessage = updatePortalMessage;
function deleteIntrn(messageId, boardType, guid) {
    var pars = {
        "board-type": boardType === BoardType.SPACE ? "space" : "person",
        guid: guid,
        "mid": messageId,
    };
    return Core.doDelete(WALL_MESSAGE_API, pars);
}
function deleteUserMessage(messageId, userGuid) {
    if (userGuid === void 0) { userGuid = "@me"; }
    return deleteIntrn(messageId, BoardType.PERSON, userGuid);
}
exports.deleteUserMessage = deleteUserMessage;
function deletePortalMessage(messageId, portalScopeId) {
    return deleteIntrn(messageId, BoardType.SPACE, portalScopeId);
}
exports.deletePortalMessage = deletePortalMessage;

},{"./core":15,"axios":22,"tslib":47}],22:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":24}],23:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))
},{"../core/createError":30,"./../core/settle":33,"./../helpers/btoa":37,"./../helpers/buildURL":38,"./../helpers/cookies":40,"./../helpers/isURLSameOrigin":42,"./../helpers/parseHeaders":44,"./../utils":46,"_process":4}],24:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":25,"./cancel/CancelToken":26,"./cancel/isCancel":27,"./core/Axios":28,"./defaults":35,"./helpers/bind":36,"./helpers/spread":45,"./utils":46}],25:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],26:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":25}],27:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],28:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":35,"./../helpers/combineURLs":39,"./../helpers/isAbsoluteURL":41,"./../utils":46,"./InterceptorManager":29,"./dispatchRequest":31}],29:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":46}],30:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, response);
};

},{"./enhanceError":32}],31:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":27,"../defaults":35,"./../utils":46,"./transformData":34}],32:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.response = response;
  return error;
};

},{}],33:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response
    ));
  }
};

},{"./createError":30}],34:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":46}],35:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))
},{"./adapters/http":23,"./adapters/xhr":23,"./helpers/normalizeHeaderName":43,"./utils":46,"_process":4}],36:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],37:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],38:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":46}],39:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],40:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":46}],41:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],42:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":46}],43:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":46}],44:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"./../utils":46}],45:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],46:[function(require,module,exports){
(function (Buffer){
'use strict';

var bind = require('./helpers/bind');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is a Node Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Node Buffer, otherwise false
 */
function isBuffer(val) {
  return ((typeof Buffer !== 'undefined') && (Buffer.isBuffer) && (Buffer.isBuffer(val)));
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

}).call(this,require("buffer").Buffer)
},{"./helpers/bind":36,"buffer":2}],47:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), q = [], c, i;
        return i = { next: verb("next"), "throw": verb("throw"), "return": verb("return") }, i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { return function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]), next(); }); }; }
        function next() { if (!c && q.length) resume((c = q.shift())[0], c[1]); }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(c[3], e); } }
        function step(r) { r.done ? settle(c[2], r) : r.value[0] === "yield" ? settle(c[2], { value: r.value[1], done: false }) : Promise.resolve(r.value[1]).then(r.value[0] === "delegate" ? delegate : fulfill, reject); }
        function delegate(r) { step(r.done ? r : { value: ["yield", r.value], done: false }); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { c = void 0, f(v), next(); }
    };

    __asyncDelegator = function (o) {
        var i = { next: verb("next"), "throw": verb("throw", function (e) { throw e; }), "return": verb("return", function (v) { return { value: v, done: true }; }) };
        return o = __asyncValues(o), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { return function (v) { return { value: ["delegate", (o[n] || f).call(o, v)], done: false }; }; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator];
        return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],48:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":49,"./sax":50}],49:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],50:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],51:[function(require,module,exports){
/*
 * xpath.js
 *
 * An XPath 1.0 library for JavaScript.
 *
 * Cameron McCormack <cam (at) mcc.id.au>
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike
 * License. To view a copy of this license, visit
 *
 *   http://creativecommons.org/licenses/by-sa/2.0/
 *
 * or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford,
 * California 94305, USA.
 *
 * Revision 20: April 26, 2011
 *   Fixed a typo resulting in FIRST_ORDERED_NODE_TYPE results being wrong,
 *   thanks to <shi_a009 (at) hotmail.com>.
 *
 * Revision 19: November 29, 2005
 *   Nodesets now store their nodes in a height balanced tree, increasing
 *   performance for the common case of selecting nodes in document order,
 *   thanks to S閎astien Cramatte <contact (at) zeninteractif.com>.
 *   AVL tree code adapted from Raimund Neumann <rnova (at) gmx.net>.
 *
 * Revision 18: October 27, 2005
 *   DOM 3 XPath support.  Caveats:
 *     - namespace prefixes aren't resolved in XPathEvaluator.createExpression,
 *       but in XPathExpression.evaluate.
 *     - XPathResult.invalidIteratorState is not implemented.
 *
 * Revision 17: October 25, 2005
 *   Some core XPath function fixes and a patch to avoid crashing certain
 *   versions of MSXML in PathExpr.prototype.getOwnerElement, thanks to
 *   S閎astien Cramatte <contact (at) zeninteractif.com>.
 *
 * Revision 16: September 22, 2005
 *   Workarounds for some IE 5.5 deficiencies.
 *   Fixed problem with prefix node tests on attribute nodes.
 *
 * Revision 15: May 21, 2005
 *   Fixed problem with QName node tests on elements with an xmlns="...".
 *
 * Revision 14: May 19, 2005
 *   Fixed QName node tests on attribute node regression.
 *
 * Revision 13: May 3, 2005
 *   Node tests are case insensitive now if working in an HTML DOM.
 *
 * Revision 12: April 26, 2005
 *   Updated licence.  Slight code changes to enable use of Dean
 *   Edwards' script compression, http://dean.edwards.name/packer/ .
 *
 * Revision 11: April 23, 2005
 *   Fixed bug with 'and' and 'or' operators, fix thanks to
 *   Sandy McArthur <sandy (at) mcarthur.org>.
 *
 * Revision 10: April 15, 2005
 *   Added support for a virtual root node, supposedly helpful for
 *   implementing XForms.  Fixed problem with QName node tests and
 *   the parent axis.
 *
 * Revision 9: March 17, 2005
 *   Namespace resolver tweaked so using the document node as the context
 *   for namespace lookups is equivalent to using the document element.
 *
 * Revision 8: February 13, 2005
 *   Handle implicit declaration of 'xmlns' namespace prefix.
 *   Fixed bug when comparing nodesets.
 *   Instance data can now be associated with a FunctionResolver, and
 *     workaround for MSXML not supporting 'localName' and 'getElementById',
 *     thanks to Grant Gongaware.
 *   Fix a few problems when the context node is the root node.
 *
 * Revision 7: February 11, 2005
 *   Default namespace resolver fix from Grant Gongaware
 *   <grant (at) gongaware.com>.
 *
 * Revision 6: February 10, 2005
 *   Fixed bug in 'number' function.
 *
 * Revision 5: February 9, 2005
 *   Fixed bug where text nodes not getting converted to string values.
 *
 * Revision 4: January 21, 2005
 *   Bug in 'name' function, fix thanks to Bill Edney.
 *   Fixed incorrect processing of namespace nodes.
 *   Fixed NamespaceResolver to resolve 'xml' namespace.
 *   Implemented union '|' operator.
 *
 * Revision 3: January 14, 2005
 *   Fixed bug with nodeset comparisons, bug lexing < and >.
 *
 * Revision 2: October 26, 2004
 *   QName node test namespace handling fixed.  Few other bug fixes.
 *
 * Revision 1: August 13, 2004
 *   Bug fixes from William J. Edney <bedney (at) technicalpursuit.com>.
 *   Added minimal licence.
 *
 * Initial version: June 14, 2004
 */

// non-node wrapper
var xpath = (typeof exports === 'undefined') ? {} : exports;

(function(exports) {
"use strict";

// XPathParser ///////////////////////////////////////////////////////////////

XPathParser.prototype = new Object();
XPathParser.prototype.constructor = XPathParser;
XPathParser.superclass = Object.prototype;

function XPathParser() {
	this.init();
}

XPathParser.prototype.init = function() {
	this.reduceActions = [];

	this.reduceActions[3] = function(rhs) {
		return new OrOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[5] = function(rhs) {
		return new AndOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[7] = function(rhs) {
		return new EqualsOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[8] = function(rhs) {
		return new NotEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[10] = function(rhs) {
		return new LessThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[11] = function(rhs) {
		return new GreaterThanOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[12] = function(rhs) {
		return new LessThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[13] = function(rhs) {
		return new GreaterThanOrEqualOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[15] = function(rhs) {
		return new PlusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[16] = function(rhs) {
		return new MinusOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[18] = function(rhs) {
		return new MultiplyOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[19] = function(rhs) {
		return new DivOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[20] = function(rhs) {
		return new ModOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[22] = function(rhs) {
		return new UnaryMinusOperation(rhs[1]);
	};
	this.reduceActions[24] = function(rhs) {
		return new BarOperation(rhs[0], rhs[2]);
	};
	this.reduceActions[25] = function(rhs) {
		return new PathExpr(undefined, undefined, rhs[0]);
	};
	this.reduceActions[27] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		return rhs[0];
	};
	this.reduceActions[28] = function(rhs) {
		rhs[0].locationPath = rhs[2];
		rhs[0].locationPath.steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[0];
	};
	this.reduceActions[29] = function(rhs) {
		return new PathExpr(rhs[0], [], undefined);
	};
	this.reduceActions[30] = function(rhs) {
		if (Utilities.instance_of(rhs[0], PathExpr)) {
			if (rhs[0].filterPredicates == undefined) {
				rhs[0].filterPredicates = [];
			}
			rhs[0].filterPredicates.push(rhs[1]);
			return rhs[0];
		} else {
			return new PathExpr(rhs[0], [rhs[1]], undefined);
		}
	};
	this.reduceActions[32] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[33] = function(rhs) {
		return new XString(rhs[0]);
	};
	this.reduceActions[34] = function(rhs) {
		return new XNumber(rhs[0]);
	};
	this.reduceActions[36] = function(rhs) {
		return new FunctionCall(rhs[0], []);
	};
	this.reduceActions[37] = function(rhs) {
		return new FunctionCall(rhs[0], rhs[2]);
	};
	this.reduceActions[38] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[39] = function(rhs) {
		rhs[2].unshift(rhs[0]);
		return rhs[2];
	};
	this.reduceActions[43] = function(rhs) {
		return new LocationPath(true, []);
	};
	this.reduceActions[44] = function(rhs) {
		rhs[1].absolute = true;
		return rhs[1];
	};
	this.reduceActions[46] = function(rhs) {
		return new LocationPath(false, [ rhs[0] ]);
	};
	this.reduceActions[47] = function(rhs) {
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[49] = function(rhs) {
		return new Step(rhs[0], rhs[1], []);
	};
	this.reduceActions[50] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], []);
	};
	this.reduceActions[51] = function(rhs) {
		return new Step(rhs[0], rhs[1], rhs[2]);
	};
	this.reduceActions[52] = function(rhs) {
		return new Step(Step.CHILD, rhs[0], rhs[1]);
	};
	this.reduceActions[54] = function(rhs) {
		return [ rhs[0] ];
	};
	this.reduceActions[55] = function(rhs) {
		rhs[1].unshift(rhs[0]);
		return rhs[1];
	};
	this.reduceActions[56] = function(rhs) {
		if (rhs[0] == "ancestor") {
			return Step.ANCESTOR;
		} else if (rhs[0] == "ancestor-or-self") {
			return Step.ANCESTORORSELF;
		} else if (rhs[0] == "attribute") {
			return Step.ATTRIBUTE;
		} else if (rhs[0] == "child") {
			return Step.CHILD;
		} else if (rhs[0] == "descendant") {
			return Step.DESCENDANT;
		} else if (rhs[0] == "descendant-or-self") {
			return Step.DESCENDANTORSELF;
		} else if (rhs[0] == "following") {
			return Step.FOLLOWING;
		} else if (rhs[0] == "following-sibling") {
			return Step.FOLLOWINGSIBLING;
		} else if (rhs[0] == "namespace") {
			return Step.NAMESPACE;
		} else if (rhs[0] == "parent") {
			return Step.PARENT;
		} else if (rhs[0] == "preceding") {
			return Step.PRECEDING;
		} else if (rhs[0] == "preceding-sibling") {
			return Step.PRECEDINGSIBLING;
		} else if (rhs[0] == "self") {
			return Step.SELF;
		}
		return -1;
	};
	this.reduceActions[57] = function(rhs) {
		return Step.ATTRIBUTE;
	};
	this.reduceActions[59] = function(rhs) {
		if (rhs[0] == "comment") {
			return new NodeTest(NodeTest.COMMENT, undefined);
		} else if (rhs[0] == "text") {
			return new NodeTest(NodeTest.TEXT, undefined);
		} else if (rhs[0] == "processing-instruction") {
			return new NodeTest(NodeTest.PI, undefined);
		} else if (rhs[0] == "node") {
			return new NodeTest(NodeTest.NODE, undefined);
		}
		return new NodeTest(-1, undefined);
	};
	this.reduceActions[60] = function(rhs) {
		return new NodeTest(NodeTest.PI, rhs[2]);
	};
	this.reduceActions[61] = function(rhs) {
		return rhs[1];
	};
	this.reduceActions[63] = function(rhs) {
		rhs[1].absolute = true;
		rhs[1].steps.unshift(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		return rhs[1];
	};
	this.reduceActions[64] = function(rhs) {
		rhs[0].steps.push(new Step(Step.DESCENDANTORSELF, new NodeTest(NodeTest.NODE, undefined), []));
		rhs[0].steps.push(rhs[2]);
		return rhs[0];
	};
	this.reduceActions[65] = function(rhs) {
		return new Step(Step.SELF, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[66] = function(rhs) {
		return new Step(Step.PARENT, new NodeTest(NodeTest.NODE, undefined), []);
	};
	this.reduceActions[67] = function(rhs) {
		return new VariableReference(rhs[1]);
	};
	this.reduceActions[68] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTANY, undefined);
	};
	this.reduceActions[69] = function(rhs) {
		var prefix = rhs[0].substring(0, rhs[0].indexOf(":"));
		return new NodeTest(NodeTest.NAMETESTPREFIXANY, prefix);
	};
	this.reduceActions[70] = function(rhs) {
		return new NodeTest(NodeTest.NAMETESTQNAME, rhs[0]);
	};
};

XPathParser.actionTable = [
	" s s        sssssssss    s ss  s  ss",
	"                 s                  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                rrrrr               ",
	" s s        sssssssss    s ss  s  ss",
	"rs  rrrrrrrr s  sssssrrrrrr  rrs rs ",
	" s s        sssssssss    s ss  s  ss",
	"                            s       ",
	"                            s       ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"  s                                 ",
	"                            s       ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"a                                   ",
	"r       s                    rr  r  ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrs  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr sr  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"                sssss               ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"              s                     ",
	"                             s      ",
	"                rrrrr               ",
	" s s        sssssssss    s sss s  ss",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s s        sssssssss      ss  s  ss",
	" s s        sssssssss    s ss  s  ss",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s           s  sssss          s  s ",
	" s           s  sssss          s  s ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr sr  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             s      ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             rr     ",
	"                             s      ",
	"                             rs     ",
	"r      sr                    rr  r  ",
	"r   s  rr            s       rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rssrr            rss     rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrr            rrrss   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrsss         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrr   rr  r  ",
	"r   rrrrrrrr         rrrrrr  rr  r  ",
	"                                 r  ",
	"                                 s  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  srrrrrrrr         rrrrrrs rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr  r  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	" s s        sssssssss    s ss  s  ss",
	"r  rrrrrrrrr         rrrrrrr rr rr  ",
	"                             r      "
];

XPathParser.actionTableNumber = [
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                 J                  ",
	"a  aaaaaaaaa         aaaaaaa aa  a  ",
	"                YYYYY               ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"K1  KKKKKKKK .  +*)('KKKKKK  KK# K\" ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"                            N       ",
	"                            O       ",
	"e  eeeeeeeee         eeeeeee ee ee  ",
	"f  fffffffff         fffffff ff ff  ",
	"d  ddddddddd         ddddddd dd dd  ",
	"B  BBBBBBBBB         BBBBBBB BB BB  ",
	"A  AAAAAAAAA         AAAAAAA AA AA  ",
	"  P                                 ",
	"                            Q       ",
	" 1           .  +*)('          #  \" ",
	"b  bbbbbbbbb         bbbbbbb bb  b  ",
	"                                    ",
	"!       S                    !!  !  ",
	"\"      T\"                    \"\"  \"  ",
	"$   V  $$            U       $$  $  ",
	"&   &ZY&&            &XW     &&  &  ",
	")   )))))            )))\\[   ))  )  ",
	".   ....._^]         .....   ..  .  ",
	"1   11111111         11111   11  1  ",
	"5   55555555         55555`  55  5  ",
	"7   77777777         777777  77  7  ",
	"9   99999999         999999  99  9  ",
	":  c::::::::         ::::::b :: a:  ",
	"I  fIIIIIIII         IIIIIIe II  I  ",
	"=  =========         ======= == ==  ",
	"?  ?????????         ??????? ?? ??  ",
	"C  CCCCCCCCC         CCCCCCC CC CC  ",
	"J   JJJJJJJJ         JJJJJJ  JJ  J  ",
	"M   MMMMMMMM         MMMMMM  MM  M  ",
	"N  NNNNNNNNN         NNNNNNN NN  N  ",
	"P  PPPPPPPPP         PPPPPPP PP  P  ",
	"                +*)('               ",
	"R  RRRRRRRRR         RRRRRRR RR aR  ",
	"U  UUUUUUUUU         UUUUUUU UU  U  ",
	"Z  ZZZZZZZZZ         ZZZZZZZ ZZ ZZ  ",
	"c  ccccccccc         ccccccc cc cc  ",
	"                             j      ",
	"L  fLLLLLLLL         LLLLLLe LL  L  ",
	"6   66666666         66666   66  6  ",
	"              k                     ",
	"                             l      ",
	"                XXXXX               ",
	" 1 0        /.-,+*)('    & %$m #  \"!",
	"_  f________         ______e __  _  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1 0        /.-,+*)('      %$  #  \"!",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	">  >>>>>>>>>         >>>>>>> >> >>  ",
	" 1           .  +*)('          #  \" ",
	" 1           .  +*)('          #  \" ",
	"Q  QQQQQQQQQ         QQQQQQQ QQ aQ  ",
	"V  VVVVVVVVV         VVVVVVV VV aV  ",
	"T  TTTTTTTTT         TTTTTTT TT  T  ",
	"@  @@@@@@@@@         @@@@@@@ @@ @@  ",
	"                             \x87      ",
	"[  [[[[[[[[[         [[[[[[[ [[ [[  ",
	"D  DDDDDDDDD         DDDDDDD DD DD  ",
	"                             HH     ",
	"                             \x88      ",
	"                             F\x89     ",
	"#      T#                    ##  #  ",
	"%   V  %%            U       %%  %  ",
	"'   'ZY''            'XW     ''  '  ",
	"(   (ZY((            (XW     ((  (  ",
	"+   +++++            +++\\[   ++  +  ",
	"*   *****            ***\\[   **  *  ",
	"-   -----            ---\\[   --  -  ",
	",   ,,,,,            ,,,\\[   ,,  ,  ",
	"0   00000_^]         00000   00  0  ",
	"/   /////_^]         /////   //  /  ",
	"2   22222222         22222   22  2  ",
	"3   33333333         33333   33  3  ",
	"4   44444444         44444   44  4  ",
	"8   88888888         888888  88  8  ",
	"                                 ^  ",
	"                                 \x8a  ",
	";  f;;;;;;;;         ;;;;;;e ;;  ;  ",
	"<  f<<<<<<<<         <<<<<<e <<  <  ",
	"O  OOOOOOOOO         OOOOOOO OO  O  ",
	"`  `````````         ``````` ``  `  ",
	"S  SSSSSSSSS         SSSSSSS SS  S  ",
	"W  WWWWWWWWW         WWWWWWW WW  W  ",
	"\\  \\\\\\\\\\\\\\\\\\         \\\\\\\\\\\\\\ \\\\ \\\\  ",
	"E  EEEEEEEEE         EEEEEEE EE EE  ",
	" 1 0        /.-,+*)('    & %$  #  \"!",
	"]  ]]]]]]]]]         ]]]]]]] ]] ]]  ",
	"                             G      "
];

XPathParser.gotoTable = [
	"3456789:;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"L456789:;<=>?@ AB  CDEFGH IJ ",
	"            M        EFGH IJ ",
	"       N;<=>?@ AB  CDEFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"            S        EFGH IJ ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"              e              ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                        h  J ",
	"              i          j   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ ABpqCDEFGH IJ ",
	"                             ",
	"  r6789:;<=>?@ AB  CDEFGH IJ ",
	"   s789:;<=>?@ AB  CDEFGH IJ ",
	"    t89:;<=>?@ AB  CDEFGH IJ ",
	"    u89:;<=>?@ AB  CDEFGH IJ ",
	"     v9:;<=>?@ AB  CDEFGH IJ ",
	"     w9:;<=>?@ AB  CDEFGH IJ ",
	"     x9:;<=>?@ AB  CDEFGH IJ ",
	"     y9:;<=>?@ AB  CDEFGH IJ ",
	"      z:;<=>?@ AB  CDEFGH IJ ",
	"      {:;<=>?@ AB  CDEFGH IJ ",
	"       |;<=>?@ AB  CDEFGH IJ ",
	"       };<=>?@ AB  CDEFGH IJ ",
	"       ~;<=>?@ AB  CDEFGH IJ ",
	"         \x7f=>?@ AB  CDEFGH IJ ",
	"\x80456789:;<=>?@ AB  CDEFGH IJ\x81",
	"            \x82        EFGH IJ ",
	"            \x83        EFGH IJ ",
	"                             ",
	"                     \x84 GH IJ ",
	"                     \x85 GH IJ ",
	"              i          \x86   ",
	"              i          \x87   ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"                             ",
	"o456789:;<=>?@ AB\x8cqCDEFGH IJ ",
	"                             ",
	"                             "
];

XPathParser.productions = [
	[1, 1, 2],
	[2, 1, 3],
	[3, 1, 4],
	[3, 3, 3, -9, 4],
	[4, 1, 5],
	[4, 3, 4, -8, 5],
	[5, 1, 6],
	[5, 3, 5, -22, 6],
	[5, 3, 5, -5, 6],
	[6, 1, 7],
	[6, 3, 6, -23, 7],
	[6, 3, 6, -24, 7],
	[6, 3, 6, -6, 7],
	[6, 3, 6, -7, 7],
	[7, 1, 8],
	[7, 3, 7, -25, 8],
	[7, 3, 7, -26, 8],
	[8, 1, 9],
	[8, 3, 8, -12, 9],
	[8, 3, 8, -11, 9],
	[8, 3, 8, -10, 9],
	[9, 1, 10],
	[9, 2, -26, 9],
	[10, 1, 11],
	[10, 3, 10, -27, 11],
	[11, 1, 12],
	[11, 1, 13],
	[11, 3, 13, -28, 14],
	[11, 3, 13, -4, 14],
	[13, 1, 15],
	[13, 2, 13, 16],
	[15, 1, 17],
	[15, 3, -29, 2, -30],
	[15, 1, -15],
	[15, 1, -16],
	[15, 1, 18],
	[18, 3, -13, -29, -30],
	[18, 4, -13, -29, 19, -30],
	[19, 1, 20],
	[19, 3, 20, -31, 19],
	[20, 1, 2],
	[12, 1, 14],
	[12, 1, 21],
	[21, 1, -28],
	[21, 2, -28, 14],
	[21, 1, 22],
	[14, 1, 23],
	[14, 3, 14, -28, 23],
	[14, 1, 24],
	[23, 2, 25, 26],
	[23, 1, 26],
	[23, 3, 25, 26, 27],
	[23, 2, 26, 27],
	[23, 1, 28],
	[27, 1, 16],
	[27, 2, 16, 27],
	[25, 2, -14, -3],
	[25, 1, -32],
	[26, 1, 29],
	[26, 3, -20, -29, -30],
	[26, 4, -21, -29, -15, -30],
	[16, 3, -33, 30, -34],
	[30, 1, 2],
	[22, 2, -4, 14],
	[24, 3, 14, -4, 23],
	[28, 1, -35],
	[28, 1, -2],
	[17, 2, -36, -18],
	[29, 1, -17],
	[29, 1, -19],
	[29, 1, -18]
];

XPathParser.DOUBLEDOT = 2;
XPathParser.DOUBLECOLON = 3;
XPathParser.DOUBLESLASH = 4;
XPathParser.NOTEQUAL = 5;
XPathParser.LESSTHANOREQUAL = 6;
XPathParser.GREATERTHANOREQUAL = 7;
XPathParser.AND = 8;
XPathParser.OR = 9;
XPathParser.MOD = 10;
XPathParser.DIV = 11;
XPathParser.MULTIPLYOPERATOR = 12;
XPathParser.FUNCTIONNAME = 13;
XPathParser.AXISNAME = 14;
XPathParser.LITERAL = 15;
XPathParser.NUMBER = 16;
XPathParser.ASTERISKNAMETEST = 17;
XPathParser.QNAME = 18;
XPathParser.NCNAMECOLONASTERISK = 19;
XPathParser.NODETYPE = 20;
XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL = 21;
XPathParser.EQUALS = 22;
XPathParser.LESSTHAN = 23;
XPathParser.GREATERTHAN = 24;
XPathParser.PLUS = 25;
XPathParser.MINUS = 26;
XPathParser.BAR = 27;
XPathParser.SLASH = 28;
XPathParser.LEFTPARENTHESIS = 29;
XPathParser.RIGHTPARENTHESIS = 30;
XPathParser.COMMA = 31;
XPathParser.AT = 32;
XPathParser.LEFTBRACKET = 33;
XPathParser.RIGHTBRACKET = 34;
XPathParser.DOT = 35;
XPathParser.DOLLAR = 36;

XPathParser.prototype.tokenize = function(s1) {
	var types = [];
	var values = [];
	var s = s1 + '\0';

	var pos = 0;
	var c = s.charAt(pos++);
	while (1) {
		while (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
			c = s.charAt(pos++);
		}
		if (c == '\0' || pos >= s.length) {
			break;
		}

		if (c == '(') {
			types.push(XPathParser.LEFTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ')') {
			types.push(XPathParser.RIGHTPARENTHESIS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '[') {
			types.push(XPathParser.LEFTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ']') {
			types.push(XPathParser.RIGHTBRACKET);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '@') {
			types.push(XPathParser.AT);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == ',') {
			types.push(XPathParser.COMMA);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '|') {
			types.push(XPathParser.BAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '+') {
			types.push(XPathParser.PLUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '-') {
			types.push(XPathParser.MINUS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '=') {
			types.push(XPathParser.EQUALS);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}
		if (c == '$') {
			types.push(XPathParser.DOLLAR);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == '.') {
			c = s.charAt(pos++);
			if (c == '.') {
				types.push(XPathParser.DOUBLEDOT);
				values.push("..");
				c = s.charAt(pos++);
				continue;
			}
			if (c >= '0' && c <= '9') {
				var number = "." + c;
				c = s.charAt(pos++);
				while (c >= '0' && c <= '9') {
					number += c;
					c = s.charAt(pos++);
				}
				types.push(XPathParser.NUMBER);
				values.push(number);
				continue;
			}
			types.push(XPathParser.DOT);
			values.push('.');
			continue;
		}

		if (c == '\'' || c == '"') {
			var delimiter = c;
			var literal = "";
			while (pos < s.length && (c = s.charAt(pos)) !== delimiter) {
				literal += c;
                pos += 1;
			}
            if (c !== delimiter) {
                throw XPathException.fromMessage("Unterminated string literal: " + delimiter + literal);
            }
            pos += 1;
			types.push(XPathParser.LITERAL);
			values.push(literal);
			c = s.charAt(pos++);
			continue;
		}

		if (c >= '0' && c <= '9') {
			var number = c;
			c = s.charAt(pos++);
			while (c >= '0' && c <= '9') {
				number += c;
				c = s.charAt(pos++);
			}
			if (c == '.') {
				if (s.charAt(pos) >= '0' && s.charAt(pos) <= '9') {
					number += c;
					number += s.charAt(pos++);
					c = s.charAt(pos++);
					while (c >= '0' && c <= '9') {
						number += c;
						c = s.charAt(pos++);
					}
				}
			}
			types.push(XPathParser.NUMBER);
			values.push(number);
			continue;
		}

		if (c == '*') {
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					types.push(XPathParser.MULTIPLYOPERATOR);
					values.push(c);
					c = s.charAt(pos++);
					continue;
				}
			}
			types.push(XPathParser.ASTERISKNAMETEST);
			values.push(c);
			c = s.charAt(pos++);
			continue;
		}

		if (c == ':') {
			if (s.charAt(pos) == ':') {
				types.push(XPathParser.DOUBLECOLON);
				values.push("::");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '/') {
			c = s.charAt(pos++);
			if (c == '/') {
				types.push(XPathParser.DOUBLESLASH);
				values.push("//");
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.SLASH);
			values.push('/');
			continue;
		}

		if (c == '!') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.NOTEQUAL);
				values.push("!=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
		}

		if (c == '<') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.LESSTHANOREQUAL);
				values.push("<=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.LESSTHAN);
			values.push('<');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '>') {
			if (s.charAt(pos) == '=') {
				types.push(XPathParser.GREATERTHANOREQUAL);
				values.push(">=");
				pos++;
				c = s.charAt(pos++);
				continue;
			}
			types.push(XPathParser.GREATERTHAN);
			values.push('>');
			c = s.charAt(pos++);
			continue;
		}

		if (c == '_' || Utilities.isLetter(c.charCodeAt(0))) {
			var name = c;
			c = s.charAt(pos++);
			while (Utilities.isNCNameChar(c.charCodeAt(0))) {
				name += c;
				c = s.charAt(pos++);
			}
			if (types.length > 0) {
				var last = types[types.length - 1];
				if (last != XPathParser.AT
						&& last != XPathParser.DOUBLECOLON
						&& last != XPathParser.LEFTPARENTHESIS
						&& last != XPathParser.LEFTBRACKET
						&& last != XPathParser.AND
						&& last != XPathParser.OR
						&& last != XPathParser.MOD
						&& last != XPathParser.DIV
						&& last != XPathParser.MULTIPLYOPERATOR
						&& last != XPathParser.SLASH
						&& last != XPathParser.DOUBLESLASH
						&& last != XPathParser.BAR
						&& last != XPathParser.PLUS
						&& last != XPathParser.MINUS
						&& last != XPathParser.EQUALS
						&& last != XPathParser.NOTEQUAL
						&& last != XPathParser.LESSTHAN
						&& last != XPathParser.LESSTHANOREQUAL
						&& last != XPathParser.GREATERTHAN
						&& last != XPathParser.GREATERTHANOREQUAL) {
					if (name == "and") {
						types.push(XPathParser.AND);
						values.push(name);
						continue;
					}
					if (name == "or") {
						types.push(XPathParser.OR);
						values.push(name);
						continue;
					}
					if (name == "mod") {
						types.push(XPathParser.MOD);
						values.push(name);
						continue;
					}
					if (name == "div") {
						types.push(XPathParser.DIV);
						values.push(name);
						continue;
					}
				}
			}
			if (c == ':') {
				if (s.charAt(pos) == '*') {
					types.push(XPathParser.NCNAMECOLONASTERISK);
					values.push(name + ":*");
					pos++;
					c = s.charAt(pos++);
					continue;
				}
				if (s.charAt(pos) == '_' || Utilities.isLetter(s.charCodeAt(pos))) {
					name += ':';
					c = s.charAt(pos++);
					while (Utilities.isNCNameChar(c.charCodeAt(0))) {
						name += c;
						c = s.charAt(pos++);
					}
					if (c == '(') {
						types.push(XPathParser.FUNCTIONNAME);
						values.push(name);
						continue;
					}
					types.push(XPathParser.QNAME);
					values.push(name);
					continue;
				}
				if (s.charAt(pos) == ':') {
					types.push(XPathParser.AXISNAME);
					values.push(name);
					continue;
				}
			}
			if (c == '(') {
				if (name == "comment" || name == "text" || name == "node") {
					types.push(XPathParser.NODETYPE);
					values.push(name);
					continue;
				}
				if (name == "processing-instruction") {
					if (s.charAt(pos) == ')') {
						types.push(XPathParser.NODETYPE);
					} else {
						types.push(XPathParser.PROCESSINGINSTRUCTIONWITHLITERAL);
					}
					values.push(name);
					continue;
				}
				types.push(XPathParser.FUNCTIONNAME);
				values.push(name);
				continue;
			}
			types.push(XPathParser.QNAME);
			values.push(name);
			continue;
		}

		throw new Error("Unexpected character " + c);
	}
	types.push(1);
	values.push("[EOF]");
	return [types, values];
};

XPathParser.SHIFT = 's';
XPathParser.REDUCE = 'r';
XPathParser.ACCEPT = 'a';

XPathParser.prototype.parse = function(s) {
	var types;
	var values;
	var res = this.tokenize(s);
	if (res == undefined) {
		return undefined;
	}
	types = res[0];
	values = res[1];
	var tokenPos = 0;
	var state = [];
	var tokenType = [];
	var tokenValue = [];
	var s;
	var a;
	var t;

	state.push(0);
	tokenType.push(1);
	tokenValue.push("_S");

	a = types[tokenPos];
	t = values[tokenPos++];
	while (1) {
		s = state[state.length - 1];
		switch (XPathParser.actionTable[s].charAt(a - 1)) {
			case XPathParser.SHIFT:
				tokenType.push(-a);
				tokenValue.push(t);
				state.push(XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32);
				a = types[tokenPos];
				t = values[tokenPos++];
				break;
			case XPathParser.REDUCE:
				var num = XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][1];
				var rhs = [];
				for (var i = 0; i < num; i++) {
					tokenType.pop();
					rhs.unshift(tokenValue.pop());
					state.pop();
				}
				var s_ = state[state.length - 1];
				tokenType.push(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0]);
				if (this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32] == undefined) {
					tokenValue.push(rhs[0]);
				} else {
					tokenValue.push(this.reduceActions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32](rhs));
				}
				state.push(XPathParser.gotoTable[s_].charCodeAt(XPathParser.productions[XPathParser.actionTableNumber[s].charCodeAt(a - 1) - 32][0] - 2) - 33);
				break;
			case XPathParser.ACCEPT:
				return new XPath(tokenValue.pop());
			default:
				throw new Error("XPath parse error");
		}
	}
};

// XPath /////////////////////////////////////////////////////////////////////

XPath.prototype = new Object();
XPath.prototype.constructor = XPath;
XPath.superclass = Object.prototype;

function XPath(e) {
	this.expression = e;
}

XPath.prototype.toString = function() {
	return this.expression.toString();
};

XPath.prototype.evaluate = function(c) {
	c.contextNode = c.expressionContextNode;
	c.contextSize = 1;
	c.contextPosition = 1;
	c.caseInsensitive = false;
	if (c.contextNode != null) {
		var doc = c.contextNode;
		if (doc.nodeType != 9 /*Node.DOCUMENT_NODE*/) {
			doc = doc.ownerDocument;
		}
		try {
			c.caseInsensitive = doc.implementation.hasFeature("HTML", "2.0");
		} catch (e) {
			c.caseInsensitive = true;
		}
	}
	return this.expression.evaluate(c);
};

XPath.XML_NAMESPACE_URI = "http://www.w3.org/XML/1998/namespace";
XPath.XMLNS_NAMESPACE_URI = "http://www.w3.org/2000/xmlns/";

// Expression ////////////////////////////////////////////////////////////////

Expression.prototype = new Object();
Expression.prototype.constructor = Expression;
Expression.superclass = Object.prototype;

function Expression() {
}

Expression.prototype.init = function() {
};

Expression.prototype.toString = function() {
	return "<Expression>";
};

Expression.prototype.evaluate = function(c) {
	throw new Error("Could not evaluate expression.");
};

// UnaryOperation ////////////////////////////////////////////////////////////

UnaryOperation.prototype = new Expression();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.superclass = Expression.prototype;

function UnaryOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryOperation.prototype.init = function(rhs) {
	this.rhs = rhs;
};

// UnaryMinusOperation ///////////////////////////////////////////////////////

UnaryMinusOperation.prototype = new UnaryOperation();
UnaryMinusOperation.prototype.constructor = UnaryMinusOperation;
UnaryMinusOperation.superclass = UnaryOperation.prototype;

function UnaryMinusOperation(rhs) {
	if (arguments.length > 0) {
		this.init(rhs);
	}
}

UnaryMinusOperation.prototype.init = function(rhs) {
	UnaryMinusOperation.superclass.init.call(this, rhs);
};

UnaryMinusOperation.prototype.evaluate = function(c) {
	return this.rhs.evaluate(c).number().negate();
};

UnaryMinusOperation.prototype.toString = function() {
	return "-" + this.rhs.toString();
};

// BinaryOperation ///////////////////////////////////////////////////////////

BinaryOperation.prototype = new Expression();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.superclass = Expression.prototype;

function BinaryOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BinaryOperation.prototype.init = function(lhs, rhs) {
	this.lhs = lhs;
	this.rhs = rhs;
};

// OrOperation ///////////////////////////////////////////////////////////////

OrOperation.prototype = new BinaryOperation();
OrOperation.prototype.constructor = OrOperation;
OrOperation.superclass = BinaryOperation.prototype;

function OrOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

OrOperation.prototype.init = function(lhs, rhs) {
	OrOperation.superclass.init.call(this, lhs, rhs);
};

OrOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " or " + this.rhs.toString() + ")";
};

OrOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// AndOperation //////////////////////////////////////////////////////////////

AndOperation.prototype = new BinaryOperation();
AndOperation.prototype.constructor = AndOperation;
AndOperation.superclass = BinaryOperation.prototype;

function AndOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

AndOperation.prototype.init = function(lhs, rhs) {
	AndOperation.superclass.init.call(this, lhs, rhs);
};

AndOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " and " + this.rhs.toString() + ")";
};

AndOperation.prototype.evaluate = function(c) {
	var b = this.lhs.evaluate(c).bool();
	if (!b.booleanValue()) {
		return b;
	}
	return this.rhs.evaluate(c).bool();
};

// EqualsOperation ///////////////////////////////////////////////////////////

EqualsOperation.prototype = new BinaryOperation();
EqualsOperation.prototype.constructor = EqualsOperation;
EqualsOperation.superclass = BinaryOperation.prototype;

function EqualsOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

EqualsOperation.prototype.init = function(lhs, rhs) {
	EqualsOperation.superclass.init.call(this, lhs, rhs);
};

EqualsOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " = " + this.rhs.toString() + ")";
};

EqualsOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).equals(this.rhs.evaluate(c));
};

// NotEqualOperation /////////////////////////////////////////////////////////

NotEqualOperation.prototype = new BinaryOperation();
NotEqualOperation.prototype.constructor = NotEqualOperation;
NotEqualOperation.superclass = BinaryOperation.prototype;

function NotEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

NotEqualOperation.prototype.init = function(lhs, rhs) {
	NotEqualOperation.superclass.init.call(this, lhs, rhs);
};

NotEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " != " + this.rhs.toString() + ")";
};

NotEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).notequal(this.rhs.evaluate(c));
};

// LessThanOperation /////////////////////////////////////////////////////////

LessThanOperation.prototype = new BinaryOperation();
LessThanOperation.prototype.constructor = LessThanOperation;
LessThanOperation.superclass = BinaryOperation.prototype;

function LessThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOperation.prototype.init = function(lhs, rhs) {
	LessThanOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthan(this.rhs.evaluate(c));
};

LessThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " < " + this.rhs.toString() + ")";
};

// GreaterThanOperation //////////////////////////////////////////////////////

GreaterThanOperation.prototype = new BinaryOperation();
GreaterThanOperation.prototype.constructor = GreaterThanOperation;
GreaterThanOperation.superclass = BinaryOperation.prototype;

function GreaterThanOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthan(this.rhs.evaluate(c));
};

GreaterThanOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " > " + this.rhs.toString() + ")";
};

// LessThanOrEqualOperation //////////////////////////////////////////////////

LessThanOrEqualOperation.prototype = new BinaryOperation();
LessThanOrEqualOperation.prototype.constructor = LessThanOrEqualOperation;
LessThanOrEqualOperation.superclass = BinaryOperation.prototype;

function LessThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

LessThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	LessThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

LessThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).lessthanorequal(this.rhs.evaluate(c));
};

LessThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " <= " + this.rhs.toString() + ")";
};

// GreaterThanOrEqualOperation ///////////////////////////////////////////////

GreaterThanOrEqualOperation.prototype = new BinaryOperation();
GreaterThanOrEqualOperation.prototype.constructor = GreaterThanOrEqualOperation;
GreaterThanOrEqualOperation.superclass = BinaryOperation.prototype;

function GreaterThanOrEqualOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

GreaterThanOrEqualOperation.prototype.init = function(lhs, rhs) {
	GreaterThanOrEqualOperation.superclass.init.call(this, lhs, rhs);
};

GreaterThanOrEqualOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).greaterthanorequal(this.rhs.evaluate(c));
};

GreaterThanOrEqualOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " >= " + this.rhs.toString() + ")";
};

// PlusOperation /////////////////////////////////////////////////////////////

PlusOperation.prototype = new BinaryOperation();
PlusOperation.prototype.constructor = PlusOperation;
PlusOperation.superclass = BinaryOperation.prototype;

function PlusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

PlusOperation.prototype.init = function(lhs, rhs) {
	PlusOperation.superclass.init.call(this, lhs, rhs);
};

PlusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().plus(this.rhs.evaluate(c).number());
};

PlusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " + " + this.rhs.toString() + ")";
};

// MinusOperation ////////////////////////////////////////////////////////////

MinusOperation.prototype = new BinaryOperation();
MinusOperation.prototype.constructor = MinusOperation;
MinusOperation.superclass = BinaryOperation.prototype;

function MinusOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MinusOperation.prototype.init = function(lhs, rhs) {
	MinusOperation.superclass.init.call(this, lhs, rhs);
};

MinusOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().minus(this.rhs.evaluate(c).number());
};

MinusOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " - " + this.rhs.toString() + ")";
};

// MultiplyOperation /////////////////////////////////////////////////////////

MultiplyOperation.prototype = new BinaryOperation();
MultiplyOperation.prototype.constructor = MultiplyOperation;
MultiplyOperation.superclass = BinaryOperation.prototype;

function MultiplyOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

MultiplyOperation.prototype.init = function(lhs, rhs) {
	MultiplyOperation.superclass.init.call(this, lhs, rhs);
};

MultiplyOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().multiply(this.rhs.evaluate(c).number());
};

MultiplyOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " * " + this.rhs.toString() + ")";
};

// DivOperation //////////////////////////////////////////////////////////////

DivOperation.prototype = new BinaryOperation();
DivOperation.prototype.constructor = DivOperation;
DivOperation.superclass = BinaryOperation.prototype;

function DivOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

DivOperation.prototype.init = function(lhs, rhs) {
	DivOperation.superclass.init.call(this, lhs, rhs);
};

DivOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().div(this.rhs.evaluate(c).number());
};

DivOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " div " + this.rhs.toString() + ")";
};

// ModOperation //////////////////////////////////////////////////////////////

ModOperation.prototype = new BinaryOperation();
ModOperation.prototype.constructor = ModOperation;
ModOperation.superclass = BinaryOperation.prototype;

function ModOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

ModOperation.prototype.init = function(lhs, rhs) {
	ModOperation.superclass.init.call(this, lhs, rhs);
};

ModOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).number().mod(this.rhs.evaluate(c).number());
};

ModOperation.prototype.toString = function() {
	return "(" + this.lhs.toString() + " mod " + this.rhs.toString() + ")";
};

// BarOperation //////////////////////////////////////////////////////////////

BarOperation.prototype = new BinaryOperation();
BarOperation.prototype.constructor = BarOperation;
BarOperation.superclass = BinaryOperation.prototype;

function BarOperation(lhs, rhs) {
	if (arguments.length > 0) {
		this.init(lhs, rhs);
	}
}

BarOperation.prototype.init = function(lhs, rhs) {
	BarOperation.superclass.init.call(this, lhs, rhs);
};

BarOperation.prototype.evaluate = function(c) {
	return this.lhs.evaluate(c).nodeset().union(this.rhs.evaluate(c).nodeset());
};

BarOperation.prototype.toString = function() {
	return this.lhs.toString() + " | " + this.rhs.toString();
};

// PathExpr //////////////////////////////////////////////////////////////////

PathExpr.prototype = new Expression();
PathExpr.prototype.constructor = PathExpr;
PathExpr.superclass = Expression.prototype;

function PathExpr(filter, filterPreds, locpath) {
	if (arguments.length > 0) {
		this.init(filter, filterPreds, locpath);
	}
}

PathExpr.prototype.init = function(filter, filterPreds, locpath) {
	PathExpr.superclass.init.call(this);
	this.filter = filter;
	this.filterPredicates = filterPreds;
	this.locationPath = locpath;
};

/**
 * Returns the topmost node of the tree containing node
 */
function findRoot(node) {
    while (node && node.parentNode) {
        node = node.parentNode;
    }

    return node;
}


PathExpr.prototype.evaluate = function(c) {
	var nodes;
	var xpc = new XPathContext();
	xpc.variableResolver = c.variableResolver;
	xpc.functionResolver = c.functionResolver;
	xpc.namespaceResolver = c.namespaceResolver;
	xpc.expressionContextNode = c.expressionContextNode;
	xpc.virtualRoot = c.virtualRoot;
	xpc.caseInsensitive = c.caseInsensitive;
	if (this.filter == null) {
		nodes = [ c.contextNode ];
	} else {
		var ns = this.filter.evaluate(c);
		if (!Utilities.instance_of(ns, XNodeSet)) {
			if (this.filterPredicates != null && this.filterPredicates.length > 0 || this.locationPath != null) {
				throw new Error("Path expression filter must evaluate to a nodset if predicates or location path are used");
			}
			return ns;
		}
		nodes = ns.toUnsortedArray();
		if (this.filterPredicates != null) {
			// apply each of the predicates in turn
			for (var j = 0; j < this.filterPredicates.length; j++) {
				var pred = this.filterPredicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					}
				}
				nodes = newNodes;
			}
		}
	}
	if (this.locationPath != null) {
		if (this.locationPath.absolute) {
			if (nodes[0].nodeType != 9 /*Node.DOCUMENT_NODE*/) {
				if (xpc.virtualRoot != null) {
					nodes = [ xpc.virtualRoot ];
				} else {
					if (nodes[0].ownerDocument == null) {
						// IE 5.5 doesn't have ownerDocument?
						var n = nodes[0];
						while (n.parentNode != null) {
							n = n.parentNode;
						}
						nodes = [ n ];
					} else {
						nodes = [ nodes[0].ownerDocument ];
					}
				}
			} else {
				nodes = [ nodes[0] ];
			}
		}
		for (var i = 0; i < this.locationPath.steps.length; i++) {
			var step = this.locationPath.steps[i];
			var newNodes = [];
			for (var j = 0; j < nodes.length; j++) {
				xpc.contextNode = nodes[j];
				switch (step.axis) {
					case Step.ANCESTOR:
						// look at all the ancestor nodes
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var m;
						if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
							m = this.getOwnerElement(xpc.contextNode);
						} else {
							m = xpc.contextNode.parentNode;
						}
						while (m != null) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
							m = m.parentNode;
						}
						break;

					case Step.ANCESTORORSELF:
						// look at all the ancestor nodes and the current node
						for (var m = xpc.contextNode; m != null; m = m.nodeType == 2 /*Node.ATTRIBUTE_NODE*/ ? this.getOwnerElement(m) : m.parentNode) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
							if (m === xpc.virtualRoot) {
								break;
							}
						}
						break;

					case Step.ATTRIBUTE:
						// look at the attributes
						var nnm = xpc.contextNode.attributes;
						if (nnm != null) {
							for (var k = 0; k < nnm.length; k++) {
								var m = nnm.item(k);
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
							}
						}
						break;

					case Step.CHILD:
						// look at all child elements
						for (var m = xpc.contextNode.firstChild; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.DESCENDANT:
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.DESCENDANTORSELF:
						// look at self
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						// look at all descendant nodes
						var st = [ xpc.contextNode.firstChild ];
						while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.FOLLOWING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						var st = [];
						if (xpc.contextNode.firstChild != null) {
							st.unshift(xpc.contextNode.firstChild);
						} else {
							st.unshift(xpc.contextNode.nextSibling);
						}
						for (var m = xpc.contextNode.parentNode; m != null && m.nodeType != 9 /*Node.DOCUMENT_NODE*/ && m !== xpc.virtualRoot; m = m.parentNode) {
							st.unshift(m.nextSibling);
						}
						do {
							for (var m = st.pop(); m != null; ) {
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.push(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						} while (st.length > 0);
						break;

					case Step.FOLLOWINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.nextSibling; m != null; m = m.nextSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.NAMESPACE:
						var n = {};
						if (xpc.contextNode.nodeType == 1 /*Node.ELEMENT_NODE*/) {
							n["xml"] = XPath.XML_NAMESPACE_URI;
							n["xmlns"] = XPath.XMLNS_NAMESPACE_URI;
							for (var m = xpc.contextNode; m != null && m.nodeType == 1 /*Node.ELEMENT_NODE*/; m = m.parentNode) {
								for (var k = 0; k < m.attributes.length; k++) {
									var attr = m.attributes.item(k);
									var nm = String(attr.name);
									if (nm == "xmlns") {
										if (n[""] == undefined) {
											n[""] = attr.value;
										}
									} else if (nm.length > 6 && nm.substring(0, 6) == "xmlns:") {
										var pre = nm.substring(6, nm.length);
										if (n[pre] == undefined) {
											n[pre] = attr.value;
										}
									}
								}
							}
							for (var pre in n) {
								var nsn = new XPathNamespace(pre, n[pre], xpc.contextNode);
								if (step.nodeTest.matches(nsn, xpc)) {
									newNodes.push(nsn);
								}
							}
						}
						break;

					case Step.PARENT:
						m = null;
						if (xpc.contextNode !== xpc.virtualRoot) {
							if (xpc.contextNode.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
								m = this.getOwnerElement(xpc.contextNode);
							} else {
								m = xpc.contextNode.parentNode;
							}
						}
						if (m != null && step.nodeTest.matches(m, xpc)) {
							newNodes.push(m);
						}
						break;

					case Step.PRECEDING:
						var st;
						if (xpc.virtualRoot != null) {
							st = [ xpc.virtualRoot ];
						} else {
                            // cannot rely on .ownerDocument because the node may be in a document fragment
                            st = [findRoot(xpc.contextNode)];
						}
						outer: while (st.length > 0) {
							for (var m = st.pop(); m != null; ) {
								if (m == xpc.contextNode) {
									break outer;
								}
								if (step.nodeTest.matches(m, xpc)) {
									newNodes.unshift(m);
								}
								if (m.firstChild != null) {
									st.push(m.nextSibling);
									m = m.firstChild;
								} else {
									m = m.nextSibling;
								}
							}
						}
						break;

					case Step.PRECEDINGSIBLING:
						if (xpc.contextNode === xpc.virtualRoot) {
							break;
						}
						for (var m = xpc.contextNode.previousSibling; m != null; m = m.previousSibling) {
							if (step.nodeTest.matches(m, xpc)) {
								newNodes.push(m);
							}
						}
						break;

					case Step.SELF:
						if (step.nodeTest.matches(xpc.contextNode, xpc)) {
							newNodes.push(xpc.contextNode);
						}
						break;

					default:
				}
			}
			nodes = newNodes;
			// apply each of the predicates in turn
			for (var j = 0; j < step.predicates.length; j++) {
				var pred = step.predicates[j];
				var newNodes = [];
				xpc.contextSize = nodes.length;
				for (xpc.contextPosition = 1; xpc.contextPosition <= xpc.contextSize; xpc.contextPosition++) {
					xpc.contextNode = nodes[xpc.contextPosition - 1];
					if (this.predicateMatches(pred, xpc)) {
						newNodes.push(xpc.contextNode);
					} else {
					}
				}
				nodes = newNodes;
			}
		}
	}
	var ns = new XNodeSet();
	ns.addArray(nodes);
	return ns;
};

PathExpr.prototype.predicateMatches = function(pred, c) {
	var res = pred.evaluate(c);
	if (Utilities.instance_of(res, XNumber)) {
		return c.contextPosition == res.numberValue();
	}
	return res.booleanValue();
};

PathExpr.prototype.toString = function() {
	if (this.filter != undefined) {
		var s = this.filter.toString();
		if (Utilities.instance_of(this.filter, XString)) {
			s = "'" + s + "'";
		}
		if (this.filterPredicates != undefined) {
			for (var i = 0; i < this.filterPredicates.length; i++) {
				s = s + "[" + this.filterPredicates[i].toString() + "]";
			}
		}
		if (this.locationPath != undefined) {
			if (!this.locationPath.absolute) {
				s += "/";
			}
			s += this.locationPath.toString();
		}
		return s;
	}
	return this.locationPath.toString();
};

PathExpr.prototype.getOwnerElement = function(n) {
	// DOM 2 has ownerElement
	if (n.ownerElement) {
		return n.ownerElement;
	}
	// DOM 1 Internet Explorer can use selectSingleNode (ironically)
	try {
		if (n.selectSingleNode) {
			return n.selectSingleNode("..");
		}
	} catch (e) {
	}
	// Other DOM 1 implementations must use this egregious search
	var doc = n.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? n
			: n.ownerDocument;
	var elts = doc.getElementsByTagName("*");
	for (var i = 0; i < elts.length; i++) {
		var elt = elts.item(i);
		var nnm = elt.attributes;
		for (var j = 0; j < nnm.length; j++) {
			var an = nnm.item(j);
			if (an === n) {
				return elt;
			}
		}
	}
	return null;
};

// LocationPath //////////////////////////////////////////////////////////////

LocationPath.prototype = new Object();
LocationPath.prototype.constructor = LocationPath;
LocationPath.superclass = Object.prototype;

function LocationPath(abs, steps) {
	if (arguments.length > 0) {
		this.init(abs, steps);
	}
}

LocationPath.prototype.init = function(abs, steps) {
	this.absolute = abs;
	this.steps = steps;
};

LocationPath.prototype.toString = function() {
	var s;
	if (this.absolute) {
		s = "/";
	} else {
		s = "";
	}
	for (var i = 0; i < this.steps.length; i++) {
		if (i != 0) {
			s += "/";
		}
		s += this.steps[i].toString();
	}
	return s;
};

// Step //////////////////////////////////////////////////////////////////////

Step.prototype = new Object();
Step.prototype.constructor = Step;
Step.superclass = Object.prototype;

function Step(axis, nodetest, preds) {
	if (arguments.length > 0) {
		this.init(axis, nodetest, preds);
	}
}

Step.prototype.init = function(axis, nodetest, preds) {
	this.axis = axis;
	this.nodeTest = nodetest;
	this.predicates = preds;
};

Step.prototype.toString = function() {
	var s;
	switch (this.axis) {
		case Step.ANCESTOR:
			s = "ancestor";
			break;
		case Step.ANCESTORORSELF:
			s = "ancestor-or-self";
			break;
		case Step.ATTRIBUTE:
			s = "attribute";
			break;
		case Step.CHILD:
			s = "child";
			break;
		case Step.DESCENDANT:
			s = "descendant";
			break;
		case Step.DESCENDANTORSELF:
			s = "descendant-or-self";
			break;
		case Step.FOLLOWING:
			s = "following";
			break;
		case Step.FOLLOWINGSIBLING:
			s = "following-sibling";
			break;
		case Step.NAMESPACE:
			s = "namespace";
			break;
		case Step.PARENT:
			s = "parent";
			break;
		case Step.PRECEDING:
			s = "preceding";
			break;
		case Step.PRECEDINGSIBLING:
			s = "preceding-sibling";
			break;
		case Step.SELF:
			s = "self";
			break;
	}
	s += "::";
	s += this.nodeTest.toString();
	for (var i = 0; i < this.predicates.length; i++) {
		s += "[" + this.predicates[i].toString() + "]";
	}
	return s;
};

Step.ANCESTOR = 0;
Step.ANCESTORORSELF = 1;
Step.ATTRIBUTE = 2;
Step.CHILD = 3;
Step.DESCENDANT = 4;
Step.DESCENDANTORSELF = 5;
Step.FOLLOWING = 6;
Step.FOLLOWINGSIBLING = 7;
Step.NAMESPACE = 8;
Step.PARENT = 9;
Step.PRECEDING = 10;
Step.PRECEDINGSIBLING = 11;
Step.SELF = 12;

// NodeTest //////////////////////////////////////////////////////////////////

NodeTest.prototype = new Object();
NodeTest.prototype.constructor = NodeTest;
NodeTest.superclass = Object.prototype;

function NodeTest(type, value) {
	if (arguments.length > 0) {
		this.init(type, value);
	}
}

NodeTest.prototype.init = function(type, value) {
	this.type = type;
	this.value = value;
};

NodeTest.prototype.toString = function() {
	switch (this.type) {
		case NodeTest.NAMETESTANY:
			return "*";
		case NodeTest.NAMETESTPREFIXANY:
			return this.value + ":*";
		case NodeTest.NAMETESTRESOLVEDANY:
			return "{" + this.value + "}*";
		case NodeTest.NAMETESTQNAME:
			return this.value;
		case NodeTest.NAMETESTRESOLVEDNAME:
			return "{" + this.namespaceURI + "}" + this.value;
		case NodeTest.COMMENT:
			return "comment()";
		case NodeTest.TEXT:
			return "text()";
		case NodeTest.PI:
			if (this.value != undefined) {
				return "processing-instruction(\"" + this.value + "\")";
			}
			return "processing-instruction()";
		case NodeTest.NODE:
			return "node()";
	}
	return "<unknown nodetest type>";
};

NodeTest.prototype.matches = function (n, xpc) {
    var nType = n.nodeType;

	switch (this.type) {
		case NodeTest.NAMETESTANY:
			if (nType === 2 /*Node.ATTRIBUTE_NODE*/
					|| nType === 1 /*Node.ELEMENT_NODE*/
					|| nType === XPathNamespace.XPATH_NAMESPACE_NODE) {
				return true;
			}
			return false;
		case NodeTest.NAMETESTPREFIXANY:
			if (nType === 2 /*Node.ATTRIBUTE_NODE*/ || nType === 1 /*Node.ELEMENT_NODE*/) {
				var ns = xpc.namespaceResolver.getNamespace(this.value, xpc.expressionContextNode);
				if (ns == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}
				return ns === (n.namespaceURI || '');
			}
			return false;
		case NodeTest.NAMETESTQNAME:
			if (nType === 2 /*Node.ATTRIBUTE_NODE*/
					|| nType === 1 /*Node.ELEMENT_NODE*/
					|| nType === XPathNamespace.XPATH_NAMESPACE_NODE) {
				var test = Utilities.resolveQName(this.value, xpc.namespaceResolver, xpc.expressionContextNode, false);
				if (test[0] == null) {
					throw new Error("Cannot resolve QName " + this.value);
				}

				test[0] = String(test[0]) || null;
				test[1] = String(test[1]);

				var node = [
                    String(n.namespaceURI || '') || null,
                    // localName will be null if the node was created with DOM1 createElement()
                    String(n.localName || n.nodeName)
                ];

				if (xpc.caseInsensitive) {
					return test[0] === node[0] && test[1].toLowerCase() === node[1].toLowerCase();
				}

				return test[0] === node[0] && test[1] === node[1];
			}
			return false;
		case NodeTest.COMMENT:
			return nType === 8 /*Node.COMMENT_NODE*/;
		case NodeTest.TEXT:
			return nType === 3 /*Node.TEXT_NODE*/ || nType == 4 /*Node.CDATA_SECTION_NODE*/;
		case NodeTest.PI:
			return nType === 7 /*Node.PROCESSING_INSTRUCTION_NODE*/
				&& (this.value == null || n.nodeName == this.value);
		case NodeTest.NODE:
			return nType === 9 /*Node.DOCUMENT_NODE*/
				|| nType === 1 /*Node.ELEMENT_NODE*/
				|| nType === 2 /*Node.ATTRIBUTE_NODE*/
				|| nType === 3 /*Node.TEXT_NODE*/
				|| nType === 4 /*Node.CDATA_SECTION_NODE*/
				|| nType === 8 /*Node.COMMENT_NODE*/
				|| nType === 7 /*Node.PROCESSING_INSTRUCTION_NODE*/;
	}
	return false;
};

NodeTest.NAMETESTANY = 0;
NodeTest.NAMETESTPREFIXANY = 1;
NodeTest.NAMETESTQNAME = 2;
NodeTest.COMMENT = 3;
NodeTest.TEXT = 4;
NodeTest.PI = 5;
NodeTest.NODE = 6;

// VariableReference /////////////////////////////////////////////////////////

VariableReference.prototype = new Expression();
VariableReference.prototype.constructor = VariableReference;
VariableReference.superclass = Expression.prototype;

function VariableReference(v) {
	if (arguments.length > 0) {
		this.init(v);
	}
}

VariableReference.prototype.init = function(v) {
	this.variable = v;
};

VariableReference.prototype.toString = function() {
	return "$" + this.variable;
};

VariableReference.prototype.evaluate = function(c) {
    var parts = Utilities.resolveQName(this.variable, c.namespaceResolver, c.contextNode, false);

    if (parts[0] == null) {
        throw new Error("Cannot resolve QName " + fn);
    }
	var result = c.variableResolver.getVariable(parts[1], parts[0]);
    if (!result) {
        throw XPathException.fromMessage("Undeclared variable: " + this.toString());
    }
    return result;
};

// FunctionCall //////////////////////////////////////////////////////////////

FunctionCall.prototype = new Expression();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.superclass = Expression.prototype;

function FunctionCall(fn, args) {
	if (arguments.length > 0) {
		this.init(fn, args);
	}
}

FunctionCall.prototype.init = function(fn, args) {
	this.functionName = fn;
	this.arguments = args;
};

FunctionCall.prototype.toString = function() {
	var s = this.functionName + "(";
	for (var i = 0; i < this.arguments.length; i++) {
		if (i > 0) {
			s += ", ";
		}
		s += this.arguments[i].toString();
	}
	return s + ")";
};

FunctionCall.prototype.evaluate = function(c) {
    var f = FunctionResolver.getFunctionFromContext(this.functionName, c);

    if (!f) {
		throw new Error("Unknown function " + this.functionName);
	}

    var a = [c].concat(this.arguments);
	return f.apply(c.functionResolver.thisArg, a);
};

// XString ///////////////////////////////////////////////////////////////////

XString.prototype = new Expression();
XString.prototype.constructor = XString;
XString.superclass = Expression.prototype;

function XString(s) {
	if (arguments.length > 0) {
		this.init(s);
	}
}

XString.prototype.init = function(s) {
	this.str = String(s);
};

XString.prototype.toString = function() {
	return this.str;
};

XString.prototype.evaluate = function(c) {
	return this;
};

XString.prototype.string = function() {
	return this;
};

XString.prototype.number = function() {
	return new XNumber(this.str);
};

XString.prototype.bool = function() {
	return new XBoolean(this.str);
};

XString.prototype.nodeset = function() {
	throw new Error("Cannot convert string to nodeset");
};

XString.prototype.stringValue = function() {
	return this.str;
};

XString.prototype.numberValue = function() {
	return this.number().numberValue();
};

XString.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XString.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().equals(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.equals);
	}
	return new XBoolean(this.str == r.str);
};

XString.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.number().notequal(r);
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithString(this, Operators.notequal);
	}
	return new XBoolean(this.str != r.str);
};

XString.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XString.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XString.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XString.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// XNumber ///////////////////////////////////////////////////////////////////

XNumber.prototype = new Expression();
XNumber.prototype.constructor = XNumber;
XNumber.superclass = Expression.prototype;

function XNumber(n) {
	if (arguments.length > 0) {
		this.init(n);
	}
}

XNumber.prototype.init = function(n) {
	this.num = typeof n === "string" ? this.parse(n) : Number(n);
};

XNumber.prototype.numberFormat = /^\s*-?[0-9]*\.?[0-9]+\s*$/;

XNumber.prototype.parse = function(s) {
    // XPath representation of numbers is more restrictive than what Number() or parseFloat() allow
    return this.numberFormat.test(s) ? parseFloat(s) : Number.NaN;
};

function padSmallNumber(numberStr) {
	var parts = numberStr.split('e-');
	var base = parts[0].replace('.', '');
	var exponent = Number(parts[1]);
	
	for (var i = 0; i < exponent - 1; i += 1) {
		base = '0' + base;
	}
	
	return '0.' + base;
}

function padLargeNumber(numberStr) {
	var parts = numberStr.split('e');
	var base = parts[0].replace('.', '');
	var exponent = Number(parts[1]);
	var zerosToAppend = exponent + 1 - base.length;
	
	for (var i = 0; i < zerosToAppend; i += 1){
		base += '0';
	}
	
	return base;
}

XNumber.prototype.toString = function() {
	var strValue = this.num.toString();

	if (strValue.indexOf('e-') !== -1) {
		return padSmallNumber(strValue);
	}
    
	if (strValue.indexOf('e') !== -1) {
		return padLargeNumber(strValue);
	}
	
	return strValue;
};

XNumber.prototype.evaluate = function(c) {
	return this;
};

XNumber.prototype.string = function() {
	
	
	return new XString(this.toString());
};

XNumber.prototype.number = function() {
	return this;
};

XNumber.prototype.bool = function() {
	return new XBoolean(this.num);
};

XNumber.prototype.nodeset = function() {
	throw new Error("Cannot convert number to nodeset");
};

XNumber.prototype.stringValue = function() {
	return this.string().stringValue();
};

XNumber.prototype.numberValue = function() {
	return this.num;
};

XNumber.prototype.booleanValue = function() {
	return this.bool().booleanValue();
};

XNumber.prototype.negate = function() {
	return new XNumber(-this.num);
};

XNumber.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().equals(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.equals(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.equals);
	}
	return new XBoolean(this.num == r.num);
};

XNumber.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XBoolean)) {
		return this.bool().notequal(r);
	}
	if (Utilities.instance_of(r, XString)) {
		return this.notequal(r.number());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.notequal);
	}
	return new XBoolean(this.num != r.num);
};

XNumber.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthan(r.number());
	}
	return new XBoolean(this.num < r.num);
};

XNumber.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthan(r.number());
	}
	return new XBoolean(this.num > r.num);
};

XNumber.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.lessthanorequal(r.number());
	}
	return new XBoolean(this.num <= r.num);
};

XNumber.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean) || Utilities.instance_of(r, XString)) {
		return this.greaterthanorequal(r.number());
	}
	return new XBoolean(this.num >= r.num);
};

XNumber.prototype.plus = function(r) {
	return new XNumber(this.num + r.num);
};

XNumber.prototype.minus = function(r) {
	return new XNumber(this.num - r.num);
};

XNumber.prototype.multiply = function(r) {
	return new XNumber(this.num * r.num);
};

XNumber.prototype.div = function(r) {
	return new XNumber(this.num / r.num);
};

XNumber.prototype.mod = function(r) {
	return new XNumber(this.num % r.num);
};

// XBoolean //////////////////////////////////////////////////////////////////

XBoolean.prototype = new Expression();
XBoolean.prototype.constructor = XBoolean;
XBoolean.superclass = Expression.prototype;

function XBoolean(b) {
	if (arguments.length > 0) {
		this.init(b);
	}
}

XBoolean.prototype.init = function(b) {
	this.b = Boolean(b);
};

XBoolean.prototype.toString = function() {
	return this.b.toString();
};

XBoolean.prototype.evaluate = function(c) {
	return this;
};

XBoolean.prototype.string = function() {
	return new XString(this.b);
};

XBoolean.prototype.number = function() {
	return new XNumber(this.b);
};

XBoolean.prototype.bool = function() {
	return this;
};

XBoolean.prototype.nodeset = function() {
	throw new Error("Cannot convert boolean to nodeset");
};

XBoolean.prototype.stringValue = function() {
	return this.string().stringValue();
};

XBoolean.prototype.numberValue = function() {
	return this.num().numberValue();
};

XBoolean.prototype.booleanValue = function() {
	return this.b;
};

XBoolean.prototype.not = function() {
	return new XBoolean(!this.b);
};

XBoolean.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.equals(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.equals);
	}
	return new XBoolean(this.b == r.b);
};

XBoolean.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString) || Utilities.instance_of(r, XNumber)) {
		return this.notequal(r.bool());
	}
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithBoolean(this, Operators.notequal);
	}
	return new XBoolean(this.b != r.b);
};

XBoolean.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthanorequal);
	}
	return this.number().lessthan(r.number());
};

XBoolean.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthanorequal);
	}
	return this.number().greaterthan(r.number());
};

XBoolean.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.greaterthan);
	}
	return this.number().lessthanorequal(r.number());
};

XBoolean.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XNodeSet)) {
		return r.compareWithNumber(this.number(), Operators.lessthan);
	}
	return this.number().greaterthanorequal(r.number());
};

// AVLTree ///////////////////////////////////////////////////////////////////

AVLTree.prototype = new Object();
AVLTree.prototype.constructor = AVLTree;
AVLTree.superclass = Object.prototype;

function AVLTree(n) {
	this.init(n);
}

AVLTree.prototype.init = function(n) {
	this.left = null;
    this.right = null;
	this.node = n;
	this.depth = 1;
};

AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? 0 : this.left.depth;
    var rdepth = this.right == null ? 0 : this.right.depth;

	if (ldepth > rdepth + 1) {
        // LR or LL rotation
        var lldepth = this.left.left  == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;

        if (lldepth < lrdepth) {
            // LR rotation consists of a RR rotation of the left child
            this.left.rotateRR();
            // plus a LL rotation of this node, which happens anyway
        }
        this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
        // RR or RL rorarion
		var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
		var rldepth = this.right.left  == null ? 0 : this.right.left.depth;

        if (rldepth > rrdepth) {
            // RR rotation consists of a LL rotation of the right child
            this.right.rotateLL();
            // plus a RR rotation of this node, which happens anyway
        }
        this.rotateRR();
    }
};

AVLTree.prototype.rotateLL = function() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    var nodeBefore = this.node;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.rotateRR = function() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    var nodeBefore = this.node;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.updateInNewLocation = function() {
    this.getDepthFromChildren();
};

AVLTree.prototype.getDepthFromChildren = function() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
};

function nodeOrder(n1, n2) {
	if (n1 === n2) {
		return 0;
	}

	if (n1.compareDocumentPosition) {
	    var cpos = n1.compareDocumentPosition(n2);

        if (cpos & 0x01) {
            // not in the same document; return an arbitrary result (is there a better way to do this)
            return 1;
        }
        if (cpos & 0x0A) {
            // n2 precedes or contains n1
            return 1;
        }
        if (cpos & 0x14) {
            // n2 follows or is contained by n1
            return -1;
        }

	    return 0;
	}

	var d1 = 0,
	    d2 = 0;
	for (var m1 = n1; m1 != null; m1 = m1.parentNode || m1.ownerElement) {
		d1++;
	}
	for (var m2 = n2; m2 != null; m2 = m2.parentNode || m2.ownerElement) {
		d2++;
	}

    // step up to same depth
	if (d1 > d2) {
		while (d1 > d2) {
			n1 = n1.parentNode || n1.ownerElement;
			d1--;
		}
		if (n1 === n2) {
			return 1;
		}
	} else if (d2 > d1) {
		while (d2 > d1) {
			n2 = n2.parentNode || n2.ownerElement;
			d2--;
		}
		if (n1 === n2) {
			return -1;
		}
	}

    var n1Par = n1.parentNode || n1.ownerElement,
        n2Par = n2.parentNode || n2.ownerElement;

    // find common parent
	while (n1Par !== n2Par) {
		n1 = n1Par;
		n2 = n2Par;
		n1Par = n1.parentNode || n1.ownerElement;
	    n2Par = n2.parentNode || n2.ownerElement;
	}
    
    var n1isAttr = Utilities.isAttribute(n1);
    var n2isAttr = Utilities.isAttribute(n2);
    
    if (n1isAttr && !n2isAttr) {
        return -1;
    }
    if (!n1isAttr && n2isAttr) {
        return 1;
    }
    
    if(n1Par) {
	    var cn = n1isAttr ? n1Par.attributes : n1Par.childNodes,
	        len = cn.length;
        for (var i = 0; i < len; i += 1) {
            var n = cn[i];
            if (n === n1) {
                return -1;
            }
            if (n === n2) {
                return 1;
            }
        }
    }        
    
    throw new Error('Unexpected: could not determine node order');
}

AVLTree.prototype.add = function(n)  {
	if (n === this.node) {
        return false;
    }

	var o = nodeOrder(n, this.node);

    var ret = false;
    if (o == -1) {
        if (this.left == null) {
            this.left = new AVLTree(n);
            ret = true;
        } else {
            ret = this.left.add(n);
            if (ret) {
                this.balance();
            }
        }
    } else if (o == 1) {
        if (this.right == null) {
            this.right = new AVLTree(n);
            ret = true;
        } else {
            ret = this.right.add(n);
            if (ret) {
                this.balance();
            }
        }
    }

    if (ret) {
        this.getDepthFromChildren();
    }
    return ret;
};

// XNodeSet //////////////////////////////////////////////////////////////////

XNodeSet.prototype = new Expression();
XNodeSet.prototype.constructor = XNodeSet;
XNodeSet.superclass = Expression.prototype;

function XNodeSet() {
	this.init();
}

XNodeSet.prototype.init = function() {
    this.tree = null;
	this.nodes = [];
	this.size = 0;
};

XNodeSet.prototype.toString = function() {
	var p = this.first();
	if (p == null) {
		return "";
	}
	return this.stringForNode(p);
};

XNodeSet.prototype.evaluate = function(c) {
	return this;
};

XNodeSet.prototype.string = function() {
	return new XString(this.toString());
};

XNodeSet.prototype.stringValue = function() {
	return this.toString();
};

XNodeSet.prototype.number = function() {
	return new XNumber(this.string());
};

XNodeSet.prototype.numberValue = function() {
	return Number(this.string());
};

XNodeSet.prototype.bool = function() {
	return new XBoolean(this.booleanValue());
};

XNodeSet.prototype.booleanValue = function() {
	return !!this.size;
};

XNodeSet.prototype.nodeset = function() {
	return this;
};

XNodeSet.prototype.stringForNode = function(n) {
	if (n.nodeType == 9   /*Node.DOCUMENT_NODE*/ || 
        n.nodeType == 1   /*Node.ELEMENT_NODE */ || 
        n.nodeType === 11 /*Node.DOCUMENT_FRAGMENT*/) {
		return this.stringForContainerNode(n);
	}
    if (n.nodeType === 2 /* Node.ATTRIBUTE_NODE */) {
        return n.value || n.nodeValue;
    }
	if (n.isNamespaceNode) {
		return n.namespace;
	}
	return n.nodeValue;
};

XNodeSet.prototype.stringForContainerNode = function(n) {
	var s = "";
	for (var n2 = n.firstChild; n2 != null; n2 = n2.nextSibling) {
        var nt = n2.nodeType;
        //  Element,    Text,       CDATA,      Document,   Document Fragment
        if (nt === 1 || nt === 3 || nt === 4 || nt === 9 || nt === 11) {
            s += this.stringForNode(n2);
        }
	}
	return s;
};

XNodeSet.prototype.buildTree = function () {
    if (!this.tree && this.nodes.length) {
        this.tree = new AVLTree(this.nodes[0]);
        for (var i = 1; i < this.nodes.length; i += 1) {
            this.tree.add(this.nodes[i]);
        }
    }

    return this.tree;
};

XNodeSet.prototype.first = function() {
	var p = this.buildTree();
	if (p == null) {
		return null;
	}
	while (p.left != null) {
		p = p.left;
	}
	return p.node;
};

XNodeSet.prototype.add = function(n) {
    for (var i = 0; i < this.nodes.length; i += 1) {
        if (n === this.nodes[i]) {
            return;
        }
    }

    this.tree = null;
    this.nodes.push(n);
    this.size += 1;
};

XNodeSet.prototype.addArray = function(ns) {
	for (var i = 0; i < ns.length; i += 1) {
		this.add(ns[i]);
	}
};

/**
 * Returns an array of the node set's contents in document order
 */
XNodeSet.prototype.toArray = function() {
	var a = [];
	this.toArrayRec(this.buildTree(), a);
	return a;
};

XNodeSet.prototype.toArrayRec = function(t, a) {
	if (t != null) {
		this.toArrayRec(t.left, a);
		a.push(t.node);
		this.toArrayRec(t.right, a);
	}
};

/**
 * Returns an array of the node set's contents in arbitrary order
 */
XNodeSet.prototype.toUnsortedArray = function () {
    return this.nodes.slice();
};

XNodeSet.prototype.compareWithString = function(r, o) {
	var a = this.toUnsortedArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XString(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithNumber = function(r, o) {
	var a = this.toUnsortedArray();
	for (var i = 0; i < a.length; i++) {
		var n = a[i];
		var l = new XNumber(this.stringForNode(n));
		var res = o(l, r);
		if (res.booleanValue()) {
			return res;
		}
	}
	return new XBoolean(false);
};

XNodeSet.prototype.compareWithBoolean = function(r, o) {
	return o(this.bool(), r);
};

XNodeSet.prototype.compareWithNodeSet = function(r, o) {
	var arr = this.toUnsortedArray();
	var oInvert = function (lop, rop) { return o(rop, lop); };
	
	for (var i = 0; i < arr.length; i++) {
		var l = new XString(this.stringForNode(arr[i]));

		var res = r.compareWithString(l, oInvert);
		if (res.booleanValue()) {
			return res;
		}
	}
	
	return new XBoolean(false);
};

XNodeSet.prototype.equals = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.equals);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.equals);
	}
	return this.compareWithNodeSet(r, Operators.equals);
};

XNodeSet.prototype.notequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithString(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.notequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.notequal);
	}
	return this.compareWithNodeSet(r, Operators.notequal);
};

XNodeSet.prototype.lessthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthan);
	}
	return this.compareWithNodeSet(r, Operators.lessthan);
};

XNodeSet.prototype.greaterthan = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthan);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthan);
	}
	return this.compareWithNodeSet(r, Operators.greaterthan);
};

XNodeSet.prototype.lessthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.lessthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.lessthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.lessthanorequal);
};

XNodeSet.prototype.greaterthanorequal = function(r) {
	if (Utilities.instance_of(r, XString)) {
		return this.compareWithNumber(r.number(), Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XNumber)) {
		return this.compareWithNumber(r, Operators.greaterthanorequal);
	}
	if (Utilities.instance_of(r, XBoolean)) {
		return this.compareWithBoolean(r, Operators.greaterthanorequal);
	}
	return this.compareWithNodeSet(r, Operators.greaterthanorequal);
};

XNodeSet.prototype.union = function(r) {
	var ns = new XNodeSet();
    ns.addArray(this.toUnsortedArray());
	ns.addArray(r.toUnsortedArray());
	return ns;
};

// XPathNamespace ////////////////////////////////////////////////////////////

XPathNamespace.prototype = new Object();
XPathNamespace.prototype.constructor = XPathNamespace;
XPathNamespace.superclass = Object.prototype;

function XPathNamespace(pre, ns, p) {
	this.isXPathNamespace = true;
	this.ownerDocument = p.ownerDocument;
	this.nodeName = "#namespace";
	this.prefix = pre;
	this.localName = pre;
	this.namespaceURI = ns;
	this.nodeValue = ns;
	this.ownerElement = p;
	this.nodeType = XPathNamespace.XPATH_NAMESPACE_NODE;
}

XPathNamespace.prototype.toString = function() {
	return "{ \"" + this.prefix + "\", \"" + this.namespaceURI + "\" }";
};

// Operators /////////////////////////////////////////////////////////////////

var Operators = new Object();

Operators.equals = function(l, r) {
	return l.equals(r);
};

Operators.notequal = function(l, r) {
	return l.notequal(r);
};

Operators.lessthan = function(l, r) {
	return l.lessthan(r);
};

Operators.greaterthan = function(l, r) {
	return l.greaterthan(r);
};

Operators.lessthanorequal = function(l, r) {
	return l.lessthanorequal(r);
};

Operators.greaterthanorequal = function(l, r) {
	return l.greaterthanorequal(r);
};

// XPathContext //////////////////////////////////////////////////////////////

XPathContext.prototype = new Object();
XPathContext.prototype.constructor = XPathContext;
XPathContext.superclass = Object.prototype;

function XPathContext(vr, nr, fr) {
	this.variableResolver = vr != null ? vr : new VariableResolver();
	this.namespaceResolver = nr != null ? nr : new NamespaceResolver();
	this.functionResolver = fr != null ? fr : new FunctionResolver();
}

// VariableResolver //////////////////////////////////////////////////////////

VariableResolver.prototype = new Object();
VariableResolver.prototype.constructor = VariableResolver;
VariableResolver.superclass = Object.prototype;

function VariableResolver() {
}

VariableResolver.prototype.getVariable = function(ln, ns) {
	return null;
};

// FunctionResolver //////////////////////////////////////////////////////////

FunctionResolver.prototype = new Object();
FunctionResolver.prototype.constructor = FunctionResolver;
FunctionResolver.superclass = Object.prototype;

function FunctionResolver(thisArg) {
	this.thisArg = thisArg != null ? thisArg : Functions;
	this.functions = new Object();
	this.addStandardFunctions();
}

FunctionResolver.prototype.addStandardFunctions = function() {
	this.functions["{}last"] = Functions.last;
	this.functions["{}position"] = Functions.position;
	this.functions["{}count"] = Functions.count;
	this.functions["{}id"] = Functions.id;
	this.functions["{}local-name"] = Functions.localName;
	this.functions["{}namespace-uri"] = Functions.namespaceURI;
	this.functions["{}name"] = Functions.name;
	this.functions["{}string"] = Functions.string;
	this.functions["{}concat"] = Functions.concat;
	this.functions["{}starts-with"] = Functions.startsWith;
	this.functions["{}contains"] = Functions.contains;
	this.functions["{}substring-before"] = Functions.substringBefore;
	this.functions["{}substring-after"] = Functions.substringAfter;
	this.functions["{}substring"] = Functions.substring;
	this.functions["{}string-length"] = Functions.stringLength;
	this.functions["{}normalize-space"] = Functions.normalizeSpace;
	this.functions["{}translate"] = Functions.translate;
	this.functions["{}boolean"] = Functions.boolean_;
	this.functions["{}not"] = Functions.not;
	this.functions["{}true"] = Functions.true_;
	this.functions["{}false"] = Functions.false_;
	this.functions["{}lang"] = Functions.lang;
	this.functions["{}number"] = Functions.number;
	this.functions["{}sum"] = Functions.sum;
	this.functions["{}floor"] = Functions.floor;
	this.functions["{}ceiling"] = Functions.ceiling;
	this.functions["{}round"] = Functions.round;
};

FunctionResolver.prototype.addFunction = function(ns, ln, f) {
	this.functions["{" + ns + "}" + ln] = f;
};

FunctionResolver.getFunctionFromContext = function(qName, context) {
    var parts = Utilities.resolveQName(qName, context.namespaceResolver, context.contextNode, false);

    if (parts[0] === null) {
        throw new Error("Cannot resolve QName " + name);
    }

    return context.functionResolver.getFunction(parts[1], parts[0]);
};

FunctionResolver.prototype.getFunction = function(localName, namespace) {
	return this.functions["{" + namespace + "}" + localName];
};

// NamespaceResolver /////////////////////////////////////////////////////////

NamespaceResolver.prototype = new Object();
NamespaceResolver.prototype.constructor = NamespaceResolver;
NamespaceResolver.superclass = Object.prototype;

function NamespaceResolver() {
}

NamespaceResolver.prototype.getNamespace = function(prefix, n) {
	if (prefix == "xml") {
		return XPath.XML_NAMESPACE_URI;
	} else if (prefix == "xmlns") {
		return XPath.XMLNS_NAMESPACE_URI;
	}
	if (n.nodeType == 9 /*Node.DOCUMENT_NODE*/) {
		n = n.documentElement;
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		n = PathExpr.prototype.getOwnerElement(n);
	} else if (n.nodeType != 1 /*Node.ELEMENT_NODE*/) {
		n = n.parentNode;
	}
	while (n != null && n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		var nnm = n.attributes;
		for (var i = 0; i < nnm.length; i++) {
			var a = nnm.item(i);
			var aname = a.name || a.nodeName;
			if ((aname === "xmlns" && prefix === "")
					|| aname === "xmlns:" + prefix) {
				return String(a.value || a.nodeValue);
			}
		}
		n = n.parentNode;
	}
	return null;
};

// Functions /////////////////////////////////////////////////////////////////

var Functions = new Object();

Functions.last = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function last expects ()");
	}
	return new XNumber(c.contextSize);
};

Functions.position = function() {
	var c = arguments[0];
	if (arguments.length != 1) {
		throw new Error("Function position expects ()");
	}
	return new XNumber(c.contextPosition);
};

Functions.count = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of(ns = arguments[1].evaluate(c), XNodeSet)) {
		throw new Error("Function count expects (node-set)");
	}
	return new XNumber(ns.size);
};

Functions.id = function() {
	var c = arguments[0];
	var id;
	if (arguments.length != 2) {
		throw new Error("Function id expects (object)");
	}
	id = arguments[1].evaluate(c);
	if (Utilities.instance_of(id, XNodeSet)) {
		id = id.toArray().join(" ");
	} else {
		id = id.stringValue();
	}
	var ids = id.split(/[\x0d\x0a\x09\x20]+/);
	var count = 0;
	var ns = new XNodeSet();
	var doc = c.contextNode.nodeType == 9 /*Node.DOCUMENT_NODE*/
			? c.contextNode
			: c.contextNode.ownerDocument;
	for (var i = 0; i < ids.length; i++) {
		var n;
		if (doc.getElementById) {
			n = doc.getElementById(ids[i]);
		} else {
			n = Utilities.getElementById(doc, ids[i]);
		}
		if (n != null) {
			ns.add(n);
			count++;
		}
	}
	return ns;
};

Functions.localName = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function local-name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}

	return new XString(n.localName ||     //  standard elements and attributes
	                   n.baseName  ||     //  IE
					   n.target    ||     //  processing instructions
                       n.nodeName  ||     //  DOM1 elements
					   "");               //  fallback
};

Functions.namespaceURI = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function namespace-uri expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	return new XString(n.namespaceURI);
};

Functions.name = function() {
	var c = arguments[0];
	var n;
	if (arguments.length == 1) {
		n = c.contextNode;
	} else if (arguments.length == 2) {
		n = arguments[1].evaluate(c).first();
	} else {
		throw new Error("Function name expects (node-set?)");
	}
	if (n == null) {
		return new XString("");
	}
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		return new XString(n.nodeName);
	} else if (n.nodeType == 2 /*Node.ATTRIBUTE_NODE*/) {
		return new XString(n.name || n.nodeName);
	} else if (n.nodeType === 7 /*Node.PROCESSING_INSTRUCTION_NODE*/) {
	    return new XString(n.target || n.nodeName);
	} else if (n.localName == null) {
		return new XString("");
	} else {
		return new XString(n.localName);
	}
};

Functions.string = function() {
	var c = arguments[0];
	if (arguments.length == 1) {
		return new XString(XNodeSet.prototype.stringForNode(c.contextNode));
	} else if (arguments.length == 2) {
		return arguments[1].evaluate(c).string();
	}
	throw new Error("Function string expects (object?)");
};

Functions.concat = function() {
	var c = arguments[0];
	if (arguments.length < 3) {
		throw new Error("Function concat expects (string, string, string*)");
	}
	var s = "";
	for (var i = 1; i < arguments.length; i++) {
		s += arguments[i].evaluate(c).stringValue();
	}
	return new XString(s);
};

Functions.startsWith = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function startsWith expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.substring(0, s2.length) == s2);
};

Functions.contains = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function contains expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XBoolean(s1.indexOf(s2) !== -1);
};

Functions.substringBefore = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-before expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	return new XString(s1.substring(0, s1.indexOf(s2)));
};

Functions.substringAfter = function() {
	var c = arguments[0];
	if (arguments.length != 3) {
		throw new Error("Function substring-after expects (string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	if (s2.length == 0) {
		return new XString(s1);
	}
	var i = s1.indexOf(s2);
	if (i == -1) {
		return new XString("");
	}
	return new XString(s1.substring(i + s2.length));
};

Functions.substring = function() {
	var c = arguments[0];
	if (!(arguments.length == 3 || arguments.length == 4)) {
		throw new Error("Function substring expects (string, number, number?)");
	}
	var s = arguments[1].evaluate(c).stringValue();
	var n1 = Math.round(arguments[2].evaluate(c).numberValue()) - 1;
	var n2 = arguments.length == 4 ? n1 + Math.round(arguments[3].evaluate(c).numberValue()) : undefined;
	return new XString(s.substring(n1, n2));
};

Functions.stringLength = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function string-length expects (string?)");
	}
	return new XNumber(s.length);
};

Functions.normalizeSpace = function() {
	var c = arguments[0];
	var s;
	if (arguments.length == 1) {
		s = XNodeSet.prototype.stringForNode(c.contextNode);
	} else if (arguments.length == 2) {
		s = arguments[1].evaluate(c).stringValue();
	} else {
		throw new Error("Function normalize-space expects (string?)");
	}
	var i = 0;
	var j = s.length - 1;
	while (Utilities.isSpace(s.charCodeAt(j))) {
		j--;
	}
	var t = "";
	while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
		i++;
	}
	while (i <= j) {
		if (Utilities.isSpace(s.charCodeAt(i))) {
			t += " ";
			while (i <= j && Utilities.isSpace(s.charCodeAt(i))) {
				i++;
			}
		} else {
			t += s.charAt(i);
			i++;
		}
	}
	return new XString(t);
};

Functions.translate = function() {
	var c = arguments[0];
	if (arguments.length != 4) {
		throw new Error("Function translate expects (string, string, string)");
	}
	var s1 = arguments[1].evaluate(c).stringValue();
	var s2 = arguments[2].evaluate(c).stringValue();
	var s3 = arguments[3].evaluate(c).stringValue();
	var map = [];
	for (var i = 0; i < s2.length; i++) {
		var j = s2.charCodeAt(i);
		if (map[j] == undefined) {
			var k = i > s3.length ? "" : s3.charAt(i);
			map[j] = k;
		}
	}
	var t = "";
	for (var i = 0; i < s1.length; i++) {
		var c = s1.charCodeAt(i);
		var r = map[c];
		if (r == undefined) {
			t += s1.charAt(i);
		} else {
			t += r;
		}
	}
	return new XString(t);
};

Functions.boolean_ = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function boolean expects (object)");
	}
	return arguments[1].evaluate(c).bool();
};

Functions.not = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function not expects (object)");
	}
	return arguments[1].evaluate(c).bool().not();
};

Functions.true_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function true expects ()");
	}
	return new XBoolean(true);
};

Functions.false_ = function() {
	if (arguments.length != 1) {
		throw new Error("Function false expects ()");
	}
	return new XBoolean(false);
};

Functions.lang = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function lang expects (string)");
	}
	var lang;
	for (var n = c.contextNode; n != null && n.nodeType != 9 /*Node.DOCUMENT_NODE*/; n = n.parentNode) {
		var a = n.getAttributeNS(XPath.XML_NAMESPACE_URI, "lang");
		if (a != null) {
			lang = String(a);
			break;
		}
	}
	if (lang == null) {
		return new XBoolean(false);
	}
	var s = arguments[1].evaluate(c).stringValue();
	return new XBoolean(lang.substring(0, s.length) == s
				&& (lang.length == s.length || lang.charAt(s.length) == '-'));
};

Functions.number = function() {
	var c = arguments[0];
	if (!(arguments.length == 1 || arguments.length == 2)) {
		throw new Error("Function number expects (object?)");
	}
	if (arguments.length == 1) {
		return new XNumber(XNodeSet.prototype.stringForNode(c.contextNode));
	}
	return arguments[1].evaluate(c).number();
};

Functions.sum = function() {
	var c = arguments[0];
	var ns;
	if (arguments.length != 2 || !Utilities.instance_of((ns = arguments[1].evaluate(c)), XNodeSet)) {
		throw new Error("Function sum expects (node-set)");
	}
	ns = ns.toUnsortedArray();
	var n = 0;
	for (var i = 0; i < ns.length; i++) {
		n += new XNumber(XNodeSet.prototype.stringForNode(ns[i])).numberValue();
	}
	return new XNumber(n);
};

Functions.floor = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function floor expects (number)");
	}
	return new XNumber(Math.floor(arguments[1].evaluate(c).numberValue()));
};

Functions.ceiling = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function ceiling expects (number)");
	}
	return new XNumber(Math.ceil(arguments[1].evaluate(c).numberValue()));
};

Functions.round = function() {
	var c = arguments[0];
	if (arguments.length != 2) {
		throw new Error("Function round expects (number)");
	}
	return new XNumber(Math.round(arguments[1].evaluate(c).numberValue()));
};

// Utilities /////////////////////////////////////////////////////////////////

var Utilities = new Object();

Utilities.isAttribute = function (val) {
    return val && (val.nodeType === 2 || val.ownerElement);
}

Utilities.splitQName = function(qn) {
	var i = qn.indexOf(":");
	if (i == -1) {
		return [ null, qn ];
	}
	return [ qn.substring(0, i), qn.substring(i + 1) ];
};

Utilities.resolveQName = function(qn, nr, n, useDefault) {
	var parts = Utilities.splitQName(qn);
	if (parts[0] != null) {
		parts[0] = nr.getNamespace(parts[0], n);
	} else {
		if (useDefault) {
			parts[0] = nr.getNamespace("", n);
			if (parts[0] == null) {
				parts[0] = "";
			}
		} else {
			parts[0] = "";
		}
	}
	return parts;
};

Utilities.isSpace = function(c) {
	return c == 0x9 || c == 0xd || c == 0xa || c == 0x20;
};

Utilities.isLetter = function(c) {
	return c >= 0x0041 && c <= 0x005A ||
		c >= 0x0061 && c <= 0x007A ||
		c >= 0x00C0 && c <= 0x00D6 ||
		c >= 0x00D8 && c <= 0x00F6 ||
		c >= 0x00F8 && c <= 0x00FF ||
		c >= 0x0100 && c <= 0x0131 ||
		c >= 0x0134 && c <= 0x013E ||
		c >= 0x0141 && c <= 0x0148 ||
		c >= 0x014A && c <= 0x017E ||
		c >= 0x0180 && c <= 0x01C3 ||
		c >= 0x01CD && c <= 0x01F0 ||
		c >= 0x01F4 && c <= 0x01F5 ||
		c >= 0x01FA && c <= 0x0217 ||
		c >= 0x0250 && c <= 0x02A8 ||
		c >= 0x02BB && c <= 0x02C1 ||
		c == 0x0386 ||
		c >= 0x0388 && c <= 0x038A ||
		c == 0x038C ||
		c >= 0x038E && c <= 0x03A1 ||
		c >= 0x03A3 && c <= 0x03CE ||
		c >= 0x03D0 && c <= 0x03D6 ||
		c == 0x03DA ||
		c == 0x03DC ||
		c == 0x03DE ||
		c == 0x03E0 ||
		c >= 0x03E2 && c <= 0x03F3 ||
		c >= 0x0401 && c <= 0x040C ||
		c >= 0x040E && c <= 0x044F ||
		c >= 0x0451 && c <= 0x045C ||
		c >= 0x045E && c <= 0x0481 ||
		c >= 0x0490 && c <= 0x04C4 ||
		c >= 0x04C7 && c <= 0x04C8 ||
		c >= 0x04CB && c <= 0x04CC ||
		c >= 0x04D0 && c <= 0x04EB ||
		c >= 0x04EE && c <= 0x04F5 ||
		c >= 0x04F8 && c <= 0x04F9 ||
		c >= 0x0531 && c <= 0x0556 ||
		c == 0x0559 ||
		c >= 0x0561 && c <= 0x0586 ||
		c >= 0x05D0 && c <= 0x05EA ||
		c >= 0x05F0 && c <= 0x05F2 ||
		c >= 0x0621 && c <= 0x063A ||
		c >= 0x0641 && c <= 0x064A ||
		c >= 0x0671 && c <= 0x06B7 ||
		c >= 0x06BA && c <= 0x06BE ||
		c >= 0x06C0 && c <= 0x06CE ||
		c >= 0x06D0 && c <= 0x06D3 ||
		c == 0x06D5 ||
		c >= 0x06E5 && c <= 0x06E6 ||
		c >= 0x0905 && c <= 0x0939 ||
		c == 0x093D ||
		c >= 0x0958 && c <= 0x0961 ||
		c >= 0x0985 && c <= 0x098C ||
		c >= 0x098F && c <= 0x0990 ||
		c >= 0x0993 && c <= 0x09A8 ||
		c >= 0x09AA && c <= 0x09B0 ||
		c == 0x09B2 ||
		c >= 0x09B6 && c <= 0x09B9 ||
		c >= 0x09DC && c <= 0x09DD ||
		c >= 0x09DF && c <= 0x09E1 ||
		c >= 0x09F0 && c <= 0x09F1 ||
		c >= 0x0A05 && c <= 0x0A0A ||
		c >= 0x0A0F && c <= 0x0A10 ||
		c >= 0x0A13 && c <= 0x0A28 ||
		c >= 0x0A2A && c <= 0x0A30 ||
		c >= 0x0A32 && c <= 0x0A33 ||
		c >= 0x0A35 && c <= 0x0A36 ||
		c >= 0x0A38 && c <= 0x0A39 ||
		c >= 0x0A59 && c <= 0x0A5C ||
		c == 0x0A5E ||
		c >= 0x0A72 && c <= 0x0A74 ||
		c >= 0x0A85 && c <= 0x0A8B ||
		c == 0x0A8D ||
		c >= 0x0A8F && c <= 0x0A91 ||
		c >= 0x0A93 && c <= 0x0AA8 ||
		c >= 0x0AAA && c <= 0x0AB0 ||
		c >= 0x0AB2 && c <= 0x0AB3 ||
		c >= 0x0AB5 && c <= 0x0AB9 ||
		c == 0x0ABD ||
		c == 0x0AE0 ||
		c >= 0x0B05 && c <= 0x0B0C ||
		c >= 0x0B0F && c <= 0x0B10 ||
		c >= 0x0B13 && c <= 0x0B28 ||
		c >= 0x0B2A && c <= 0x0B30 ||
		c >= 0x0B32 && c <= 0x0B33 ||
		c >= 0x0B36 && c <= 0x0B39 ||
		c == 0x0B3D ||
		c >= 0x0B5C && c <= 0x0B5D ||
		c >= 0x0B5F && c <= 0x0B61 ||
		c >= 0x0B85 && c <= 0x0B8A ||
		c >= 0x0B8E && c <= 0x0B90 ||
		c >= 0x0B92 && c <= 0x0B95 ||
		c >= 0x0B99 && c <= 0x0B9A ||
		c == 0x0B9C ||
		c >= 0x0B9E && c <= 0x0B9F ||
		c >= 0x0BA3 && c <= 0x0BA4 ||
		c >= 0x0BA8 && c <= 0x0BAA ||
		c >= 0x0BAE && c <= 0x0BB5 ||
		c >= 0x0BB7 && c <= 0x0BB9 ||
		c >= 0x0C05 && c <= 0x0C0C ||
		c >= 0x0C0E && c <= 0x0C10 ||
		c >= 0x0C12 && c <= 0x0C28 ||
		c >= 0x0C2A && c <= 0x0C33 ||
		c >= 0x0C35 && c <= 0x0C39 ||
		c >= 0x0C60 && c <= 0x0C61 ||
		c >= 0x0C85 && c <= 0x0C8C ||
		c >= 0x0C8E && c <= 0x0C90 ||
		c >= 0x0C92 && c <= 0x0CA8 ||
		c >= 0x0CAA && c <= 0x0CB3 ||
		c >= 0x0CB5 && c <= 0x0CB9 ||
		c == 0x0CDE ||
		c >= 0x0CE0 && c <= 0x0CE1 ||
		c >= 0x0D05 && c <= 0x0D0C ||
		c >= 0x0D0E && c <= 0x0D10 ||
		c >= 0x0D12 && c <= 0x0D28 ||
		c >= 0x0D2A && c <= 0x0D39 ||
		c >= 0x0D60 && c <= 0x0D61 ||
		c >= 0x0E01 && c <= 0x0E2E ||
		c == 0x0E30 ||
		c >= 0x0E32 && c <= 0x0E33 ||
		c >= 0x0E40 && c <= 0x0E45 ||
		c >= 0x0E81 && c <= 0x0E82 ||
		c == 0x0E84 ||
		c >= 0x0E87 && c <= 0x0E88 ||
		c == 0x0E8A ||
		c == 0x0E8D ||
		c >= 0x0E94 && c <= 0x0E97 ||
		c >= 0x0E99 && c <= 0x0E9F ||
		c >= 0x0EA1 && c <= 0x0EA3 ||
		c == 0x0EA5 ||
		c == 0x0EA7 ||
		c >= 0x0EAA && c <= 0x0EAB ||
		c >= 0x0EAD && c <= 0x0EAE ||
		c == 0x0EB0 ||
		c >= 0x0EB2 && c <= 0x0EB3 ||
		c == 0x0EBD ||
		c >= 0x0EC0 && c <= 0x0EC4 ||
		c >= 0x0F40 && c <= 0x0F47 ||
		c >= 0x0F49 && c <= 0x0F69 ||
		c >= 0x10A0 && c <= 0x10C5 ||
		c >= 0x10D0 && c <= 0x10F6 ||
		c == 0x1100 ||
		c >= 0x1102 && c <= 0x1103 ||
		c >= 0x1105 && c <= 0x1107 ||
		c == 0x1109 ||
		c >= 0x110B && c <= 0x110C ||
		c >= 0x110E && c <= 0x1112 ||
		c == 0x113C ||
		c == 0x113E ||
		c == 0x1140 ||
		c == 0x114C ||
		c == 0x114E ||
		c == 0x1150 ||
		c >= 0x1154 && c <= 0x1155 ||
		c == 0x1159 ||
		c >= 0x115F && c <= 0x1161 ||
		c == 0x1163 ||
		c == 0x1165 ||
		c == 0x1167 ||
		c == 0x1169 ||
		c >= 0x116D && c <= 0x116E ||
		c >= 0x1172 && c <= 0x1173 ||
		c == 0x1175 ||
		c == 0x119E ||
		c == 0x11A8 ||
		c == 0x11AB ||
		c >= 0x11AE && c <= 0x11AF ||
		c >= 0x11B7 && c <= 0x11B8 ||
		c == 0x11BA ||
		c >= 0x11BC && c <= 0x11C2 ||
		c == 0x11EB ||
		c == 0x11F0 ||
		c == 0x11F9 ||
		c >= 0x1E00 && c <= 0x1E9B ||
		c >= 0x1EA0 && c <= 0x1EF9 ||
		c >= 0x1F00 && c <= 0x1F15 ||
		c >= 0x1F18 && c <= 0x1F1D ||
		c >= 0x1F20 && c <= 0x1F45 ||
		c >= 0x1F48 && c <= 0x1F4D ||
		c >= 0x1F50 && c <= 0x1F57 ||
		c == 0x1F59 ||
		c == 0x1F5B ||
		c == 0x1F5D ||
		c >= 0x1F5F && c <= 0x1F7D ||
		c >= 0x1F80 && c <= 0x1FB4 ||
		c >= 0x1FB6 && c <= 0x1FBC ||
		c == 0x1FBE ||
		c >= 0x1FC2 && c <= 0x1FC4 ||
		c >= 0x1FC6 && c <= 0x1FCC ||
		c >= 0x1FD0 && c <= 0x1FD3 ||
		c >= 0x1FD6 && c <= 0x1FDB ||
		c >= 0x1FE0 && c <= 0x1FEC ||
		c >= 0x1FF2 && c <= 0x1FF4 ||
		c >= 0x1FF6 && c <= 0x1FFC ||
		c == 0x2126 ||
		c >= 0x212A && c <= 0x212B ||
		c == 0x212E ||
		c >= 0x2180 && c <= 0x2182 ||
		c >= 0x3041 && c <= 0x3094 ||
		c >= 0x30A1 && c <= 0x30FA ||
		c >= 0x3105 && c <= 0x312C ||
		c >= 0xAC00 && c <= 0xD7A3 ||
		c >= 0x4E00 && c <= 0x9FA5 ||
		c == 0x3007 ||
		c >= 0x3021 && c <= 0x3029;
};

Utilities.isNCNameChar = function(c) {
	return c >= 0x0030 && c <= 0x0039
		|| c >= 0x0660 && c <= 0x0669
		|| c >= 0x06F0 && c <= 0x06F9
		|| c >= 0x0966 && c <= 0x096F
		|| c >= 0x09E6 && c <= 0x09EF
		|| c >= 0x0A66 && c <= 0x0A6F
		|| c >= 0x0AE6 && c <= 0x0AEF
		|| c >= 0x0B66 && c <= 0x0B6F
		|| c >= 0x0BE7 && c <= 0x0BEF
		|| c >= 0x0C66 && c <= 0x0C6F
		|| c >= 0x0CE6 && c <= 0x0CEF
		|| c >= 0x0D66 && c <= 0x0D6F
		|| c >= 0x0E50 && c <= 0x0E59
		|| c >= 0x0ED0 && c <= 0x0ED9
		|| c >= 0x0F20 && c <= 0x0F29
		|| c == 0x002E
		|| c == 0x002D
		|| c == 0x005F
		|| Utilities.isLetter(c)
		|| c >= 0x0300 && c <= 0x0345
		|| c >= 0x0360 && c <= 0x0361
		|| c >= 0x0483 && c <= 0x0486
		|| c >= 0x0591 && c <= 0x05A1
		|| c >= 0x05A3 && c <= 0x05B9
		|| c >= 0x05BB && c <= 0x05BD
		|| c == 0x05BF
		|| c >= 0x05C1 && c <= 0x05C2
		|| c == 0x05C4
		|| c >= 0x064B && c <= 0x0652
		|| c == 0x0670
		|| c >= 0x06D6 && c <= 0x06DC
		|| c >= 0x06DD && c <= 0x06DF
		|| c >= 0x06E0 && c <= 0x06E4
		|| c >= 0x06E7 && c <= 0x06E8
		|| c >= 0x06EA && c <= 0x06ED
		|| c >= 0x0901 && c <= 0x0903
		|| c == 0x093C
		|| c >= 0x093E && c <= 0x094C
		|| c == 0x094D
		|| c >= 0x0951 && c <= 0x0954
		|| c >= 0x0962 && c <= 0x0963
		|| c >= 0x0981 && c <= 0x0983
		|| c == 0x09BC
		|| c == 0x09BE
		|| c == 0x09BF
		|| c >= 0x09C0 && c <= 0x09C4
		|| c >= 0x09C7 && c <= 0x09C8
		|| c >= 0x09CB && c <= 0x09CD
		|| c == 0x09D7
		|| c >= 0x09E2 && c <= 0x09E3
		|| c == 0x0A02
		|| c == 0x0A3C
		|| c == 0x0A3E
		|| c == 0x0A3F
		|| c >= 0x0A40 && c <= 0x0A42
		|| c >= 0x0A47 && c <= 0x0A48
		|| c >= 0x0A4B && c <= 0x0A4D
		|| c >= 0x0A70 && c <= 0x0A71
		|| c >= 0x0A81 && c <= 0x0A83
		|| c == 0x0ABC
		|| c >= 0x0ABE && c <= 0x0AC5
		|| c >= 0x0AC7 && c <= 0x0AC9
		|| c >= 0x0ACB && c <= 0x0ACD
		|| c >= 0x0B01 && c <= 0x0B03
		|| c == 0x0B3C
		|| c >= 0x0B3E && c <= 0x0B43
		|| c >= 0x0B47 && c <= 0x0B48
		|| c >= 0x0B4B && c <= 0x0B4D
		|| c >= 0x0B56 && c <= 0x0B57
		|| c >= 0x0B82 && c <= 0x0B83
		|| c >= 0x0BBE && c <= 0x0BC2
		|| c >= 0x0BC6 && c <= 0x0BC8
		|| c >= 0x0BCA && c <= 0x0BCD
		|| c == 0x0BD7
		|| c >= 0x0C01 && c <= 0x0C03
		|| c >= 0x0C3E && c <= 0x0C44
		|| c >= 0x0C46 && c <= 0x0C48
		|| c >= 0x0C4A && c <= 0x0C4D
		|| c >= 0x0C55 && c <= 0x0C56
		|| c >= 0x0C82 && c <= 0x0C83
		|| c >= 0x0CBE && c <= 0x0CC4
		|| c >= 0x0CC6 && c <= 0x0CC8
		|| c >= 0x0CCA && c <= 0x0CCD
		|| c >= 0x0CD5 && c <= 0x0CD6
		|| c >= 0x0D02 && c <= 0x0D03
		|| c >= 0x0D3E && c <= 0x0D43
		|| c >= 0x0D46 && c <= 0x0D48
		|| c >= 0x0D4A && c <= 0x0D4D
		|| c == 0x0D57
		|| c == 0x0E31
		|| c >= 0x0E34 && c <= 0x0E3A
		|| c >= 0x0E47 && c <= 0x0E4E
		|| c == 0x0EB1
		|| c >= 0x0EB4 && c <= 0x0EB9
		|| c >= 0x0EBB && c <= 0x0EBC
		|| c >= 0x0EC8 && c <= 0x0ECD
		|| c >= 0x0F18 && c <= 0x0F19
		|| c == 0x0F35
		|| c == 0x0F37
		|| c == 0x0F39
		|| c == 0x0F3E
		|| c == 0x0F3F
		|| c >= 0x0F71 && c <= 0x0F84
		|| c >= 0x0F86 && c <= 0x0F8B
		|| c >= 0x0F90 && c <= 0x0F95
		|| c == 0x0F97
		|| c >= 0x0F99 && c <= 0x0FAD
		|| c >= 0x0FB1 && c <= 0x0FB7
		|| c == 0x0FB9
		|| c >= 0x20D0 && c <= 0x20DC
		|| c == 0x20E1
		|| c >= 0x302A && c <= 0x302F
		|| c == 0x3099
		|| c == 0x309A
		|| c == 0x00B7
		|| c == 0x02D0
		|| c == 0x02D1
		|| c == 0x0387
		|| c == 0x0640
		|| c == 0x0E46
		|| c == 0x0EC6
		|| c == 0x3005
		|| c >= 0x3031 && c <= 0x3035
		|| c >= 0x309D && c <= 0x309E
		|| c >= 0x30FC && c <= 0x30FE;
};

Utilities.coalesceText = function(n) {
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		if (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
			var s = m.nodeValue;
			var first = m;
			m = m.nextSibling;
			while (m != null && (m.nodeType == 3 /*Node.TEXT_NODE*/ || m.nodeType == 4 /*Node.CDATA_SECTION_NODE*/)) {
				s += m.nodeValue;
				var del = m;
				m = m.nextSibling;
				del.parentNode.removeChild(del);
			}
			if (first.nodeType == 4 /*Node.CDATA_SECTION_NODE*/) {
				var p = first.parentNode;
				if (first.nextSibling == null) {
					p.removeChild(first);
					p.appendChild(p.ownerDocument.createTextNode(s));
				} else {
					var next = first.nextSibling;
					p.removeChild(first);
					p.insertBefore(p.ownerDocument.createTextNode(s), next);
				}
			} else {
				first.nodeValue = s;
			}
			if (m == null) {
				break;
			}
		} else if (m.nodeType == 1 /*Node.ELEMENT_NODE*/) {
			Utilities.coalesceText(m);
		}
	}
};

Utilities.instance_of = function(o, c) {
	while (o != null) {
		if (o.constructor === c) {
			return true;
		}
		if (o === Object) {
			return false;
		}
		o = o.constructor.superclass;
	}
	return false;
};

Utilities.getElementById = function(n, id) {
	// Note that this does not check the DTD to check for actual
	// attributes of type ID, so this may be a bit wrong.
	if (n.nodeType == 1 /*Node.ELEMENT_NODE*/) {
		if (n.getAttribute("id") == id
				|| n.getAttributeNS(null, "id") == id) {
			return n;
		}
	}
	for (var m = n.firstChild; m != null; m = m.nextSibling) {
		var res = Utilities.getElementById(m, id);
		if (res != null) {
			return res;
		}
	}
	return null;
};

// XPathException ////////////////////////////////////////////////////////////

var XPathException = (function () {
    function getMessage(code, exception) {
        var msg = exception ? ": " + exception.toString() : "";
        switch (code) {
            case XPathException.INVALID_EXPRESSION_ERR:
                return "Invalid expression" + msg;
            case XPathException.TYPE_ERR:
                return "Type error" + msg;
        }
        return null;
    }

    function XPathException(code, error, message) {
        var err = Error.call(this, getMessage(code, error) || message);

        err.code = code;
        err.exception = error;

        return err;
    }

    XPathException.prototype = Object.create(Error.prototype);
    XPathException.prototype.constructor = XPathException;
    XPathException.superclass = Error;

    XPathException.prototype.toString = function() {
        return this.message;
    };

    XPathException.fromMessage = function(message, error) {
        return new XPathException(null, error, message);
    };

    XPathException.INVALID_EXPRESSION_ERR = 51;
    XPathException.TYPE_ERR = 52;

    return XPathException;
})();

// XPathExpression ///////////////////////////////////////////////////////////

XPathExpression.prototype = {};
XPathExpression.prototype.constructor = XPathExpression;
XPathExpression.superclass = Object.prototype;

function XPathExpression(e, r, p) {
	this.xpath = p.parse(e);
	this.context = new XPathContext();
	this.context.namespaceResolver = new XPathNSResolverWrapper(r);
}

XPathExpression.prototype.evaluate = function(n, t, res) {
	this.context.expressionContextNode = n;
	var result = this.xpath.evaluate(this.context);
	return new XPathResult(result, t);
}

// XPathNSResolverWrapper ////////////////////////////////////////////////////

XPathNSResolverWrapper.prototype = {};
XPathNSResolverWrapper.prototype.constructor = XPathNSResolverWrapper;
XPathNSResolverWrapper.superclass = Object.prototype;

function XPathNSResolverWrapper(r) {
	this.xpathNSResolver = r;
}

XPathNSResolverWrapper.prototype.getNamespace = function(prefix, n) {
    if (this.xpathNSResolver == null) {
        return null;
    }
	return this.xpathNSResolver.lookupNamespaceURI(prefix);
};

// NodeXPathNSResolver ///////////////////////////////////////////////////////

NodeXPathNSResolver.prototype = {};
NodeXPathNSResolver.prototype.constructor = NodeXPathNSResolver;
NodeXPathNSResolver.superclass = Object.prototype;

function NodeXPathNSResolver(n) {
	this.node = n;
	this.namespaceResolver = new NamespaceResolver();
}

NodeXPathNSResolver.prototype.lookupNamespaceURI = function(prefix) {
	return this.namespaceResolver.getNamespace(prefix, this.node);
};

// XPathResult ///////////////////////////////////////////////////////////////

XPathResult.prototype = {};
XPathResult.prototype.constructor = XPathResult;
XPathResult.superclass = Object.prototype;

function XPathResult(v, t) {
	if (t == XPathResult.ANY_TYPE) {
		if (v.constructor === XString) {
			t = XPathResult.STRING_TYPE;
		} else if (v.constructor === XNumber) {
			t = XPathResult.NUMBER_TYPE;
		} else if (v.constructor === XBoolean) {
			t = XPathResult.BOOLEAN_TYPE;
		} else if (v.constructor === XNodeSet) {
			t = XPathResult.UNORDERED_NODE_ITERATOR_TYPE;
		}
	}
	this.resultType = t;
	switch (t) {
		case XPathResult.NUMBER_TYPE:
			this.numberValue = v.numberValue();
			return;
		case XPathResult.STRING_TYPE:
			this.stringValue = v.stringValue();
			return;
		case XPathResult.BOOLEAN_TYPE:
			this.booleanValue = v.booleanValue();
			return;
		case XPathResult.ANY_UNORDERED_NODE_TYPE:
		case XPathResult.FIRST_ORDERED_NODE_TYPE:
			if (v.constructor === XNodeSet) {
				this.singleNodeValue = v.first();
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
		case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
			if (v.constructor === XNodeSet) {
				this.invalidIteratorState = false;
				this.nodes = v.toArray();
				this.iteratorIndex = 0;
				return;
			}
			break;
		case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
		case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
			if (v.constructor === XNodeSet) {
				this.nodes = v.toArray();
				this.snapshotLength = this.nodes.length;
				return;
			}
			break;
	}
	throw new XPathException(XPathException.TYPE_ERR);
};

XPathResult.prototype.iterateNext = function() {
	if (this.resultType != XPathResult.UNORDERED_NODE_ITERATOR_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[this.iteratorIndex++];
};

XPathResult.prototype.snapshotItem = function(i) {
	if (this.resultType != XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE
			&& this.resultType != XPathResult.ORDERED_NODE_SNAPSHOT_TYPE) {
		throw new XPathException(XPathException.TYPE_ERR);
	}
	return this.nodes[i];
};

XPathResult.ANY_TYPE = 0;
XPathResult.NUMBER_TYPE = 1;
XPathResult.STRING_TYPE = 2;
XPathResult.BOOLEAN_TYPE = 3;
XPathResult.UNORDERED_NODE_ITERATOR_TYPE = 4;
XPathResult.ORDERED_NODE_ITERATOR_TYPE = 5;
XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
XPathResult.ORDERED_NODE_SNAPSHOT_TYPE = 7;
XPathResult.ANY_UNORDERED_NODE_TYPE = 8;
XPathResult.FIRST_ORDERED_NODE_TYPE = 9;

// DOM 3 XPath support ///////////////////////////////////////////////////////

function installDOM3XPathSupport(doc, p) {
	doc.createExpression = function(e, r) {
		try {
			return new XPathExpression(e, r, p);
		} catch (e) {
			throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e);
		}
	};
	doc.createNSResolver = function(n) {
		return new NodeXPathNSResolver(n);
	};
	doc.evaluate = function(e, cn, r, t, res) {
		if (t < 0 || t > 9) {
			throw { code: 0, toString: function() { return "Request type not supported"; } };
		}
        return doc.createExpression(e, r, p).evaluate(cn, t, res);
	};
};

// ---------------------------------------------------------------------------

// Install DOM 3 XPath support for the current document.
try {
	var shouldInstall = true;
	try {
		if (document.implementation
				&& document.implementation.hasFeature
				&& document.implementation.hasFeature("XPath", null)) {
			shouldInstall = false;
		}
	} catch (e) {
	}
	if (shouldInstall) {
		installDOM3XPathSupport(document, new XPathParser());
	}
} catch (e) {
}

// ---------------------------------------------------------------------------
// exports for node.js

installDOM3XPathSupport(exports, new XPathParser());

(function() {
    var parser = new XPathParser();

    var defaultNSResolver = new NamespaceResolver();
    var defaultFunctionResolver = new FunctionResolver();
    var defaultVariableResolver = new VariableResolver();

    function makeNSResolverFromFunction(func) {
        return {
            getNamespace: function (prefix, node) {
                var ns = func(prefix, node);

                return ns || defaultNSResolver.getNamespace(prefix, node);
            }
        };
    }

    function makeNSResolverFromObject(obj) {
        return makeNSResolverFromFunction(obj.getNamespace.bind(obj));
    }

    function makeNSResolverFromMap(map) {
        return makeNSResolverFromFunction(function (prefix) {
            return map[prefix];
        });
    }

    function makeNSResolver(resolver) {
        if (resolver && typeof resolver.getNamespace === "function") {
            return makeNSResolverFromObject(resolver);
        }

        if (typeof resolver === "function") {
            return makeNSResolverFromFunction(resolver);
        }

        // assume prefix -> uri mapping
        if (typeof resolver === "object") {
            return makeNSResolverFromMap(resolver);
        }

        return defaultNSResolver;
    }

    /** Converts native JavaScript types to their XPath library equivalent */
    function convertValue(value) {
        if (value === null ||
            typeof value === "undefined" ||
            value instanceof XString ||
            value instanceof XBoolean ||
            value instanceof XNumber ||
            value instanceof XNodeSet) {
            return value;
        }

        switch (typeof value) {
            case "string": return new XString(value);
            case "boolean": return new XBoolean(value);
            case "number": return new XNumber(value);
        }

        // assume node(s)
        var ns = new XNodeSet();
        ns.addArray([].concat(value));
        return ns;
    }

    function makeEvaluator(func) {
        return function (context) {
            var args = Array.prototype.slice.call(arguments, 1).map(function (arg) {
                return arg.evaluate(context);
            });
            var result = func.apply(this, [].concat(context, args));
            return convertValue(result);
        };
    }

    function makeFunctionResolverFromFunction(func) {
        return {
            getFunction: function (name, namespace) {
                var found = func(name, namespace);
                if (found) {
                    return makeEvaluator(found);
                }
                return defaultFunctionResolver.getFunction(name, namespace);
            }
        };
    }

    function makeFunctionResolverFromObject(obj) {
        return makeFunctionResolverFromFunction(obj.getFunction.bind(obj));
    }

    function makeFunctionResolverFromMap(map) {
        return makeFunctionResolverFromFunction(function (name) {
            return map[name];
        });
    }

    function makeFunctionResolver(resolver) {
        if (resolver && typeof resolver.getFunction === "function") {
            return makeFunctionResolverFromObject(resolver);
        }

        if (typeof resolver === "function") {
            return makeFunctionResolverFromFunction(resolver);
        }

        // assume map
        if (typeof resolver === "object") {
            return makeFunctionResolverFromMap(resolver);
        }

        return defaultFunctionResolver;
    }

    function makeVariableResolverFromFunction(func) {
        return {
            getVariable: function (name, namespace) {
                var value = func(name, namespace);
                return convertValue(value);
            }
        };
    }

    function makeVariableResolver(resolver) {
        if (resolver) {
            if (typeof resolver.getVariable === "function") {
                return makeVariableResolverFromFunction(resolver.getVariable.bind(resolver));
            }

            if (typeof resolver === "function") {
                return makeVariableResolverFromFunction(resolver);
            }

            // assume map
            if (typeof resolver === "object") {
                return makeVariableResolverFromFunction(function (name) {
                    return resolver[name];
                });
            }
        }

        return defaultVariableResolver;
    }

    function makeContext(options) {
        var context = new XPathContext();

        if (options) {
            context.namespaceResolver = makeNSResolver(options.namespaces);
            context.functionResolver = makeFunctionResolver(options.functions);
            context.variableResolver = makeVariableResolver(options.variables);
            context.expressionContextNode = options.node;
        } else {
            context.namespaceResolver = defaultNSResolver;
        }

        return context;
    }

    function evaluate(parsedExpression, options) {
        var context = makeContext(options);

        return parsedExpression.evaluate(context);
    }

    var evaluatorPrototype = {
        evaluate: function (options) {
            return evaluate(this.expression, options);
        }

        ,evaluateNumber: function (options) {
            return this.evaluate(options).numberValue();
        }

        ,evaluateString: function (options) {
            return this.evaluate(options).stringValue();
        }

        ,evaluateBoolean: function (options) {
            return this.evaluate(options).booleanValue();
        }

        ,evaluateNodeSet: function (options) {
            return this.evaluate(options).nodeset();
        }

        ,select: function (options) {
            return this.evaluateNodeSet(options).toArray()
        }

        ,select1: function (options) {
            return this.select(options)[0];
        }
    };

    function parse(xpath) {
        var parsed = parser.parse(xpath);

        return Object.create(evaluatorPrototype, {
            expression: {
                value: parsed
            }
        });
    }

    exports.parse = parse;
})();

exports.XPath = XPath;
exports.XPathParser = XPathParser;
exports.XPathResult = XPathResult;

exports.Step = Step;
exports.NodeTest = NodeTest;
exports.BarOperation = BarOperation;

exports.NamespaceResolver = NamespaceResolver;
exports.FunctionResolver = FunctionResolver;
exports.VariableResolver = VariableResolver;

exports.Utilities = Utilities;

exports.XPathContext = XPathContext;
exports.XNodeSet = XNodeSet;
exports.XBoolean = XBoolean;
exports.XString = XString;
exports.XNumber = XNumber;

// helper
exports.select = function(e, doc, single) {
	return exports.selectWithResolver(e, doc, null, single);
};

exports.useNamespaces = function(mappings) {
	var resolver = {
		mappings: mappings || {},
		lookupNamespaceURI: function(prefix) {
			return this.mappings[prefix];
		}
	};

	return function(e, doc, single) {
		return exports.selectWithResolver(e, doc, resolver, single);
	};
};

exports.selectWithResolver = function(e, doc, resolver, single) {
	var expression = new XPathExpression(e, resolver, new XPathParser());
	var type = XPathResult.ANY_TYPE;

	var result = expression.evaluate(doc, type, null);

	if (result.resultType == XPathResult.STRING_TYPE) {
		result = result.stringValue;
	}
	else if (result.resultType == XPathResult.NUMBER_TYPE) {
		result = result.numberValue;
	}
	else if (result.resultType == XPathResult.BOOLEAN_TYPE) {
		result = result.booleanValue;
	}
	else {
		result = result.nodes;
		if (single) {
			result = result[0];
		}
	}

	return result;
};

exports.select1 = function(e, doc) {
	return exports.select(e, doc, true);
};

// end non-node wrapper
})(xpath);

},{}]},{},[18]);
