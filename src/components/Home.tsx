import * as React from 'react';
import AppState from '../stores/AppState';
import { observer } from 'mobx-react';
import styles from './styles.css';
import c from 'classnames';

@observer
class Home extends React.Component<{ appState: AppState }, any> {

  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
  }

  exeLisp = () => {
    this.props.appState.exeLisp(["+", ["+", 2,5,7], 2, 3, ["+", 2,5,4]]);
  }

  onChange (event) {
    this.props.appState.updateProperty(event.target.name, event.target.value)
  }

  render() {
    return (
      <div>
        <div className="container">
          <h1 className='title is-1'>
            Lisp Playground
          </h1>
          <div className="field">
            <div className="control">
              <button className='button' onClick={this.exeLisp}>EXECUTE</button>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <textarea className="textarea" placeholder="Textarea"name="lispSource" value={this.props.appState.lispSource} onChange={this.onChange}></textarea>
            </div>
          </div>
        </div>
        <div className={c(styles.lispresult, 'container')}>
          <div className="field">
            <label className="label">Result</label>
            <div className="control">
              <textarea className="textarea" placeholder="Textarea" value={this.props.appState.lispresult} readOnly></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
