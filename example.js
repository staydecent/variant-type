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

const store = atom([], { kittens: Kittens.Unloaded })
const { actions, reducer } = createVariantReducer({ Kittens }, store)
store.addReducer(reducer)

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

actions.isLoading()

actions.isLoaded(['Whiskers', 'Ferdinand'])

actions.isFailed(Error('oh noes!'))
