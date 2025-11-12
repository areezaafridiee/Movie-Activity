// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import MovieScreen from './MovieScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <MovieScreen />
    </>
  );
};

export default App;