import generateWeb3API from './generateWeb3API';

export default function (arg) {
  // TODO make this purely functional
  let store;
  let dispatch;
  let resolvedWeb3;
  function getStore() { return store; }
  function getDispatch() { return dispatch; }

  // todo document
  function resolveWeb3() {
    if (resolvedWeb3) {
      return resolvedWeb3;
    }
    if (typeof arg === 'function') {
      return arg({ getStore, getDispatch, generateWeb3API });
    }
    resolvedWeb3 = (typeof arg !== 'function') && Object.keys(arg).reduce((o, key) => ({
      ...o, [key]: generateWeb3API({ network: { key }, web3: arg[key], getStore, getDispatch }),
    }), {});
    return resolvedWeb3;
  }
  function mapStateToProps(state) {
    store = state;
    return { web3Redux: store.web3Redux };
  }
  function mapDispatchToProps(newDispatch) {
    dispatch = newDispatch;
    return {};
  }
  function mergeProps(stateProps, dispatchProps, ownProps) {
    const networks = resolveWeb3();
    return {
      ...ownProps,
      web3Redux: {
        networks: Object.keys(networks).reduce((o, k) => ({ ...o, [k]: {
          ...networks[k],
          status: store.web3Redux.getIn(['networks', k, 'status']) || {},
        } }), {}),
        status: store.web3Redux.getIn(['status']) || {},
      },
    };
  }
  return [mapStateToProps, mapDispatchToProps, mergeProps];
}
