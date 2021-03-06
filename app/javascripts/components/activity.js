import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List';

export default class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      activities:[]
    };
  }

  componentDidMount(){
    let contract = this.props.connector.contract;
    let activities = this.state.activities;
    contract.allEvents({fromBlock:0}, (error, data) => {
      console.log('allEvents', data.event);
      let message;
      switch (data.event) {
        case 'ExploitSucceeded':
          message = `successfully exploited. Withdraw it now!`;
          break;
        case 'BountyClaimed':
          message = `successfully claimed`;
          break;
        case 'ExploitFailed':
          message = `failed to claim`
          break;
        case 'BountyRegistered':
          message = `registered ${data.args.name} contract with deposit of ${data.args.deposit.toNumber()}`;
          break;
        default:
          message = data.event;
          break;
      }

      activities.push({
        event:data.event,
        blockNumber:data.blockNumber,
        address:data.address,
        message:message
      });
      this.setState({activities: activities});
    });
  }

  handleOpen(){
    this.setState({open: true});
  };

  handleClose(a,b){
    this.setState({open: false});
  };

  render(){
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />
    ];

    return (
      <span>
        <FlatButton style={{color:'white'}} label="Activity" onClick={this.handleOpen.bind(this)} />
        <Dialog
          title="Activities"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
          contentStyle={{width:'90%', maxWidth:'none'}}
        >
          <div>
            <List>
              {
                this.state.activities.sort((a, b) => { return b.blockNumber - a.blockNumber }).map((a) => {
                  return (
                    <ListItem insetChildren={true} disabled={true}
                      primaryText={
                        <p>At block {a.blockNumber}, {a.address} {a.message}</p>
                      }
                    />
                  )
                })
              }
            </List>
          </div>
        </Dialog>
      </span>
    );
  }
}
