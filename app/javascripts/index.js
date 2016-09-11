import {} from "../stylesheets/app.css";
import 'react-notifications/lib/notifications.css';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './components/app';
import Connector from './connector';

function setup(){
  return new Promise(function(resolve,reject){

    // PUT YOUR UNIQUE ID HERE
    //  (from the devadmin page, the one with '-edgware' appended)
    var dappId = 'com-bountymax-poc-edgware';

    // PUT YOUR CALLBACK URL HERE
    var callbackUrl = 'http://127.0.0.1/';
    // the callback must EXACTLY match the string configured in the devadmin web UI.
    // e.g. be careful of trailing slashes

    // PUT YOUR CONTRACT ADDRESS HERE
    var contractAddress = '0xad459d49e9fc14dd972759c5e9ee60ee4976a9dd';

    var walletBar = new WalletBar({
       dappNamespace: dappId,
       authServiceCallbackUrl: callbackUrl
    })

    var web3 = new Web3();
    web3.setProvider(walletBar.getHook('edgware'));
    resolve({web3, walletBar});
  })
}

window.onload = function() {
  setup().then(({web3, walletBar}) => {
    Bountymax.setProvider(web3.currentProvider);
    let contract = Bountymax.deployed();
    let connector = new Connector(web3, contract, walletBar);
    contract.allEvents({}, function(error, data) {
      console.log('allEvents',data.event, data.args)
      let message;
      switch (data.event) {
        case 'BountyClaimed':
          // message = `Congratulation! you won ${data.args.amount.toNumber()}`
          message = `Congratulation! you successfully exploited`;
          connector.emitter.emit('notification', {status:'success', message: message});
          break;
        case 'ExploitFailed':
          message = `Your exploitation did not work. Try again`
          connector.emitter.emit('notification', {status:'error', message: message});
          break;
        default:
          connector.emitter.emit('notification', {status:'info', message: data.event});
      }
    });

    window.connector = connector;
    injectTapEventPlugin();
    ReactDOM.render(
      <App connector={connector}/>,
      document.getElementById('app')
    );
  })
}
