/* globals define */
(function (root, factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.atom = factory()
  }
}(this, function () {
  'use strict'

  // @TODO: move to wasmuth
  function toConst (str) {
    let ret = ''
    let prevLowercase = false
    for (let s of str) {
      const isUppercase = s.toUpperCase() === s
      if (isUppercase && prevLowercase) {
        ret += '_'
      }
      ret += s
      prevLowercase = !isUppercase
    }
    return ret.replace(/_+/g, '_').toUpperCase()
  }

  // @TODO: move to wasmuth
  function toFnName (str) {
    let ret = ''
    let prevUnderscore = false
    for (let s of str) {
      const isUnderscore = s === '_'
      if (isUnderscore) {
        prevUnderscore = true
        continue
      }
      if (!isUnderscore && prevUnderscore) {
        ret += s
        prevUnderscore = false
      } else {
        ret += s.toLowerCase()
      }
    }
    return ret
  }

  function createActions (actionTypes, name, store) {
    const actions = {}
    actionTypes.forEach(type => {
      actions[toFnName(type).replace(name, 'is')] = function () {
        const args = Array.prototype.slice.call(arguments)
        const action = {type, payload: {args}}
        return store != null
          ? store.dispatch(action)
          : action
      }
    })
    return actions
  }

  function createReducer (actionTypes, name, Variant) {
    const reduce = {}
    actionTypes.forEach(type => {
      reduce[type] = function (action, state) {
        const {type, payload} = action
        const fnName = toFnName(type).replace(name, '')
        if (payload.args.length) {
          state[name] = Variant[fnName].apply(Variant, payload.args)
        } else {
          state[name] = Variant[fnName]
        }
        return state
      }
    })
    return function reducer (action, state) {
      if (reduce[action.type] != null) {
        return reduce[action.type](action, state)
      }
      return state
    }
  }

  return function createVariantReducer (wrapper, store) {
    const name = Object.keys(wrapper)[0]
    const nameUpper = toConst(name)
    const Variant = wrapper[name]
    const proto = Object.getPrototypeOf(Variant)
    const types = Object.keys(proto._types)
    const actionTypes = types.map(s => nameUpper + '_' + toConst(s))
    const actions = createActions(actionTypes, name.toLowerCase(), store)
    const reducer = createReducer(actionTypes, name.toLowerCase(), Variant)
    return {actions, reducer}
  }
}))
