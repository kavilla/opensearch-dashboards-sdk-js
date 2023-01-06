import { ExtensionInitializerContext } from '../../../src/core/server';
import { HelloWorldExtension } from './extension';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `extension()` initializer.

export function extension(initializerContext: ExtensionInitializerContext) {
  return new HelloWorldExtension(initializerContext);
}

export { HelloWorldExtensionSetup, HelloWorldExtensionStart } from './types';
