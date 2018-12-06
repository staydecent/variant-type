# variant-type

A Variant is a data structure ([tagged union](https://en.wikipedia.org/wiki/Tagged_union)) that can be used to represent any other data type. You define the various potential types and the variant can only represent one of those types at any one time.

A good use for this, is representing parts of your React/Redux app state.

```javascript
const Any = () => true

const Request = Variant({
  Unloaded: [],
  Loading: [],
  Loaded: [Any],
  Failed: [Error] // might have to make this `any`, given that JS can throw non-Errors…
})

// ...

componentDidMount () {
  setState({request: Request.Loading})

  fetchSomething
    .then((results) => setState({request: Request.Loaded(results)}))
    .catch(e => setState({request: Request.Failed(e)}))
}

// ...

render () {
  return Request.case({
    Unloaded: () => 'Nothing to see here.',
    Loading: () => 'Please be patient.',
    Loaded: (data) => `Got this data: ${data}`,
    Failed: (error) => `Sorry: ${error}`,
    _: () => 'Uh, how did you even get here?'
  })
}
```
