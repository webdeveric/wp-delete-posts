import React from 'react';
import ReactDOM from 'react-dom';
import DeletePostsApp from './delete-posts-app';

ReactDOM.render(
  <DeletePostsApp ajaxurl={window.ajaxurl} nonce={window.deletePosts.nonce || ''}/>,
  document.querySelector('#delete-posts-app')
);
