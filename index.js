import check from 'check-arg-types'

const toType = check.prototype.toType

export default function VariantFactory (types) {
  check(arguments, ['object'])

  const typeNames = Object.keys(types).concat(['_'])
  let caseFns

  function Variant () {}

  Variant.prototype._types = types

  typeNames.forEach(key => {
    Variant.prototype[key] = function () {
      const args = Array.prototype.slice.call(arguments)
      if (args.length !== types[key].length) {
        const msg = 'Arguments did not match for ' + key + ': Expected ' + types[key].length + ', Received ' + args.length
        throw new E(msg, types[key], args)
      }

      const badArg = args.findIndex((val, idx) =>
        (types[key][idx] === Boolean)
          ? toType(val) !== 'boolean'
          : !types[key][idx](val)
      )
      if (badArg > -1) {
        const msg = 'Bad argument at index ' + badArg + ': Expected ' + types[key][badArg] + ', Received "' + args[badArg] + '"'
        throw new E(msg, types[key], args)
      }

      return caseFns != null
        ? caseFns[key].apply(this, arguments)
        : args
    }
  })

  Variant.prototype.case = function (cases) {
    caseFns = cases
    const caseKeys = Object.keys(cases)
    caseKeys.forEach(caseKey => {
      if (!typeNames.includes(caseKey)) {
        console.warn('Invalid case key given for Variant', {caseKey, typeNames})
        return
      }
      this[caseKey] = function caseKey () {
        const key = caseKey.prototype._name
        if (arguments.length > 0) {
          const args = Array.prototype.slice.call(arguments)
          return function () { return cases[key].apply(this, args) }
        } else {
          return cases[key](arguments)
        }
      }
      this[caseKey].prototype._name = caseKey
    })

    return function caseClosure (type) {
      check(arguments, ['function'])
      const res = type()
      return res
    }
  }

  return new Variant()
}

function E (message, expected, received) {
  this.message = message
  this.name = 'VariantException'
  this.toString = function () {
    return this.name + ': ' + this.message
  }
  console.error({expected, received})
}
