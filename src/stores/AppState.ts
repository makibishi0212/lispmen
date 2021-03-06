import { observable, action } from 'mobx';
import {Lisp} from '../lisp';

const hasWindow = typeof window !== 'undefined';

export interface AppStateProps {
  message: string;
  lispSource: string;
}

/*
* This is the entry point for the app's state. All stores should go here.
*/
class AppState implements AppStateProps {
  @observable message = 'message';
  @observable lispSource = '((lambda (a b) (+ a b 5)) 2 3)';
  @observable lispresult = '';

  intervalId: any;
  lisp: Lisp = new Lisp()

  constructor() {
    if (hasWindow) {
      
    }
  }

  @action exeLisp = () => {
    this.lispresult = this.lisp.execute(this.lispSource) as string;
  }

  @action setMessage(message: string) {
    this.message = message;
  }

  @action updateProperty (key, value) {
    this[key] = value
  }

  reload(store: AppStateProps) {
    Object.assign(this, store);
    return this;
  }

  unload() {
    clearInterval(this.intervalId);
  }
}

export default AppState;
