import {
  ExtensionInitializerContext,
  CoreStart,
  Extension,
  Logger,
  CoreSetupForExtension,
} from '../../../src/core/server';

import { HelloWorldExtensionSetup, HelloWorldExtensionStart } from './types';
import { defineRoutes } from './routes';

export class HelloWorldExtension
  implements Extension<HelloWorldExtensionSetup, HelloWorldExtensionStart> {
  private readonly logger: Logger;

  constructor(initializerContext: ExtensionInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetupForExtension) {
    this.logger.debug('helloWorld: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('helloWorld: Started');
    return {};
  }

  public stop() {}
}
