import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppExtensionStartDependencies } from './types';
import { HelloWorldApp } from './components/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  {}: AppExtensionStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <HelloWorldApp basename={appBasePath} notifications={notifications} http={http} />,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
