var Variant = require('../dist/variant-type')
var test = require('tape')

function isNumber (n) { return typeof n === 'number' }

test('returns type with constructors', function (t) {
  var Point = Variant({Point: [isNumber, isNumber]})
  t.equal(typeof Point.Point, 'function')
  t.end()
})

test('constructors create object with fields in array', function (t) {
  var Point = Variant({Point: [isNumber, isNumber]})
  var point = Point.Point(5, 10)
  t.equal(point[0], 5)
  t.equal(point[1], 10)
  t.end()
})

test('throws if field value does not pass validator', function (t) {
  var Point = Variant({Point: [isNumber, isNumber]})
  t.throws(function () {
    Point.Point('lol', 10)
  })
  t.end()
})

test('throws on too many arguments', function (t) {
  var Foo = Variant({Foo: [Number, Number]})
  t.throws(function () {
    Foo.Foo(3, 3, 3)
  })
  t.end()
})

test('accepts boolean true with primitive constructors', function (t) {
  var Exists = Variant({Exists: [Boolean]})
  t.equal(true, Exists.Exists(true)[0])
  t.end()
})

test('accepts boolean false with primitive constructors', function (t) {
  var Exists = Variant({Exists: [Boolean]})
  t.equal(false, Exists.Exists(false)[0])
  t.end()
})

test('throws on boolean with primitive constructors', function (t) {
  var Exists = Variant({Exists: [Boolean]})
  t.throws(function () {
    Exists.Exists('12')
  })
  t.end()
})
