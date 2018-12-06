// // action types
// const FETCHING_KITTENS = 'FETCHING_KITTENS'
// const GOT_KITTENS = 'GOT_KITTENS'
// const FAILED_KITTENS = 'FAILED_KITTENS'

// // action creators
// const fetchingKittens = () => ({type: FETCHING_KITTENS})
// const gotKittens = (kittens) => ({type: GOT_KITTENS, payload: kittens})
// const failedKittens = (error) => ({type: FAILED_KITTENS, error})

// const reducer = (action, oldState = {}) => {
//   switch (action.type) {
//     case FETCHING_KITTENS:
//       return ({...oldState, kittens: Variant.Loading})
//     case GOT_KITTENS:
//       return ({...oldState, kittens: Variant.Loaded(action.payload)})
//     case FAILED_KITTENS: return ({...oldState, kittens: Variant.Failed(action.error)})
//     default: return oldState
//   }
// }

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
        store.dispatch({
          type: type,
          payload: {args}
        })
      }
    })
    return actions
  }

  return function createVariantReducer (wrapper, store) {
    const name = Object.keys(wrapper)[0]
    const nameUpper = toConst(name)
    const Variant = wrapper[name]
    const proto = Object.getPrototypeOf(Variant)
    const types = Object.keys(proto._types)
    const actionTypes = types.map(s => nameUpper + '_' + toConst(s))
    const actions = createActions(actionTypes, name.toLowerCase(), store)
    console.log({name, actions})
  }
}))
