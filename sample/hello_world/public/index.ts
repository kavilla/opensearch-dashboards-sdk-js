import './index.scss';

import { HelloWorldExtension } from './extension';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `extension()` initializer.
export function extension() {
  return new HelloWorldExtension();
}
export { HelloWorldExtensionSetup, HelloWorldExtensionStart } from './types';
