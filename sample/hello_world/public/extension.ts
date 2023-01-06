import { i18n } from '@osd/i18n';
import {
  AppMountParameters,
  CoreSetupForExtension,
  CoreStart,
  Extension,
} from '../../../src/core/public';
import {
  HelloWorldExtensionSetup,
  HelloWorldExtensionStart,
  AppExtensionStartDependencies,
} from './types';
import { EXTENSION_NAME } from '../common';

export class HelloWorldExtension
  implements Extension<HelloWorldExtensionSetup, HelloWorldExtensionStart> {
  public setup(core: CoreSetupForExtension): HelloWorldExtensionSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'helloWorld',
      title: EXTENSION_NAME,
      category: {
        id: 'extensions',
        label: 'OpenSearch Extensions',
        order: 4000,
      },
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppExtensionStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('helloWorld.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: EXTENSION_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): HelloWorldExtensionStart {
    return {};
  }

  public stop() {}
}
