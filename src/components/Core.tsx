import * as   React from 'react';
import * as styles from './styles.css';

/**
 * <Core />
 * Wraps all our child components to provide global navigation.
 * This makes it simple to have a component at the index '/' route
 * of our application.
 */

const Core = ({ children }) =>
  <div>
    <main className={styles.scopedClassName}>
      {children}
    </main>
  </div>;

export default Core;
