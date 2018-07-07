import { observable, action } from 'mobx';
import {Lisp} from '../lisp';

const hasWindow = typeof window !== 'undefined';

export interface AppStateProps {
  timer: number;
}

/*
* This is the entry point for the app's state. All stores should go here.
*/
class AppState implements AppStateProps {
  @observable timer = 0;
  @observable message = '';

  intervalId: any;

  constructor() {
    if (hasWindow) {
      
    }
  }

  @action exeLisp = (source: Array<any>) => {
    const lisp = new Lisp(source).execute();
  }

  @action setMessage(message: string) {
    this.message = message;
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
