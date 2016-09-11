import EventEmitter from 'events';

const emitter = new EventEmitter();

export default class Connector{
  constructor(web3, contract, walletBar) {
    this.web3 = web3;
    this.contract = contract;
    this.walletBar = walletBar;
    this.emitter = emitter;
  }

  on(listeners) {
    for (let eventName in listeners){
      console.log("eventName", eventName)
      emitter.on(eventName, listeners[eventName]);
    }
  }

  getBounties(callback){
    let contract = this.contract;
    contract.numBounties.call().then(value => {
      let bountiesArray = []
      for (var i = 1; i <= value.toNumber(); i++) {
        bountiesArray.push(i);
      }
      Promise.all(bountiesArray.map(index => {
        return contract.bountiesIndex.call(index).then(address => {
          return contract.bounties.call(address);
        })
      })).then(function(bounties){
        return bounties.map(bounty => {
          console.log('getBounties')
          var object =  {
            name: bounty[0],
            target: bounty[1],
            invariant: bounty[2],
            reward: bounty[3] || 0,
          }
          return object
        })
      }).then(bounty => { if(bounty) callback(bounty); })
    })
  }

  register({name, target, invariant}){
    var account = this.walletBar.getCurrentAccount();
    this.walletBar.createSecureSigner();
    this.contract.register.estimateGas(name, target, invariant, { from: account }, function (err1, gas) {
      if(err1) return alert("Error: "+err1);
        this.contract.register.sendTransaction(name, target, invariant, { gas: gas, from: account }, function (err2, hash) {
          if(err2) return alert("Error: "+err2);
            alert('Tx hash: '+hash);
          });
    });
  }

  exploit(target, invariant, exploit){
    var account = this.walletBar.getCurrentAccount();
    this.walletBar.createSecureSigner();
    this.contract.exploit.estimateGas(target, invariant, exploit, { from: account }, function (err1, gas) {
      if(err1) return alert("Error: "+err1);
        this.contract.exploit.sendTransaction(target, invariant, exploit, { gas: gas, from: account }, function (err2, hash) {
          if(err2) return alert("Error: "+err2);
            alert('Tx hash: '+hash);
          });
    });
  }
}
