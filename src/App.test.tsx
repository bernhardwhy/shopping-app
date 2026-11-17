import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('./shared/config', () => ({
  firebaseDB: {
    database: () => ({
      ref: () => ({
        child: () => ({ on: jest.fn() })
      })
    })
  }
}));

it('renders the application shell while loading groceries', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  expect(div.querySelector('.App')).not.toBeNull();
  expect(div.textContent).toContain('loading data...');
  ReactDOM.unmountComponentAtNode(div);
});
