import * as React from 'react';
import AppState from '../stores/AppState';
import { observer } from 'mobx-react';

@observer
class Home extends React.Component<{ appState: AppState }, any> {

  exeLisp = () => {
    this.props.appState.exeLisp(["+", ["+", 2,5,7], 2, 3, ["+", 2,5,4]]);
  }

  render() {
    return (
      <div className="home">
        <h1 className='title is-1'>
          Lisp Playground
        </h1>
        <button onClick={this.exeLisp}>LispTest</button>
      </div>
    );
  }
}

export default Home;
