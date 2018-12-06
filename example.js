const Variant = require('./dist/variant-type')
const createVariantReducer = require('./create-variant-reducer')
const atom = require('atom')

const Any = () => true

const Kittens = Variant({
  Unloaded: [],
  Loading: [],
  Loaded: [Any],
  Failed: [Error] // might have to make this `any`, given that JS can throw non-Errors…
})

// action types
const FETCHING_KITTENS = 'FETCHING_KITTENS'
const GOT_KITTENS = 'GOT_KITTENS'
const FAILED_KITTENS = 'FAILED_KITTENS'

// action creators
const fetchingKittens = () => ({type: FETCHING_KITTENS})
const gotKittens = (kittens) => ({type: GOT_KITTENS, payload: kittens})
const failedKittens = (error) => ({type: FAILED_KITTENS, error})

const reducer = (action, oldState = {}) => {
  switch (action.type) {
    case FETCHING_KITTENS:
      return ({...oldState, kittens: Kittens.Loading})
    case GOT_KITTENS:
      return ({...oldState, kittens: Kittens.Loaded(action.payload)})
    case FAILED_KITTENS: return ({...oldState, kittens: Kittens.Failed(action.error)})
    default: return oldState
  }
}

createVariantReducer({Kittens})

const store = atom(reducer, {kittens: Kittens.Unloaded})

// This is how you would decide what to render in your React app
const renderRequest = Kittens.case({
  Unloaded: () => 'Nothing to see here.',
  Loading: () => 'Please be patient.',
  Loaded: (data) => `Got this data: ${data}`,
  Failed: (error) => `Sorry: ${error}`,
  _: () => 'Uh, how did you even get here?'
})

const debugKittens = () => {
  const state = store.getState()
  const res = renderRequest(state.kittens)
  console.log('debugKittens:', res)
}

debugKittens()

store.subscribe(debugKittens)

store.dispatch(fetchingKittens())

store.dispatch(gotKittens(['Whiskers', 'Ferdinand']))

store.dispatch(failedKittens(Error('oh noes!')))
