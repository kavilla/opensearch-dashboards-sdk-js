/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConnectionOptions as TlsConnectionOptions } from 'tls';
import { URL } from 'url';
import { Duration } from 'moment';
import { ClientOptions, NodeOptions } from '@opensearch-project/opensearch';
import { OpenSearchConfig } from '../opensearch_config';
import { DEFAULT_HEADERS } from './default_headers';

/**
 * Configuration options to be used to create a {@link IClusterClient | cluster client} using the
 * {@link OpenSearchServiceStart.createClient | createClient API}
 *
 * @public
 */
export type OpenSearchClientConfig = Pick<
  OpenSearchConfig,
  | 'customHeaders'
  | 'logQueries'
  | 'sniffOnStart'
  | 'sniffOnConnectionFault'
  | 'requestHeadersWhitelist'
  | 'sniffInterval'
  | 'hosts'
  | 'username'
  | 'password'
  | 'disablePrototypePoisoningProtection'
> & {
  memoryCircuitBreaker?:
    | OpenSearchConfig['memoryCircuitBreaker']
    | ClientOptions['memoryCircuitBreaker'];
  pingTimeout?: OpenSearchConfig['pingTimeout'] | ClientOptions['pingTimeout'];
  requestTimeout?: OpenSearchConfig['requestTimeout'] | ClientOptions['requestTimeout'];
  ssl?: Partial<OpenSearchConfig['ssl']>;
  keepAlive?: boolean;
};

/**
 * Parse the client options from given client config and `scoped` flag.
 *
 * @param config The config to generate the client options from.
 * @param scoped if true, will adapt the configuration to be used by a scoped client
 *        (will remove basic auth and ssl certificates)
 */
export function parseClientOptions(config: OpenSearchClientConfig, scoped: boolean): ClientOptions {
  const clientOptions: ClientOptions = {
    sniffOnStart: config.sniffOnStart,
    sniffOnConnectionFault: config.sniffOnConnectionFault,
    headers: {
      ...DEFAULT_HEADERS,
      ...config.customHeaders,
    },
  };
  if (config.memoryCircuitBreaker != null) {
    clientOptions.memoryCircuitBreaker = config.memoryCircuitBreaker;
  }
  if (config.pingTimeout != null) {
    clientOptions.pingTimeout = getDurationAsMs(config.pingTimeout);
  }
  if (config.requestTimeout != null) {
    clientOptions.requestTimeout = getDurationAsMs(config.requestTimeout);
  }
  if (config.sniffInterval != null) {
    clientOptions.sniffInterval =
      typeof config.sniffInterval === 'boolean'
        ? config.sniffInterval
        : getDurationAsMs(config.sniffInterval);
  }
  if (config.keepAlive) {
    clientOptions.agent = {
      keepAlive: config.keepAlive,
    };
  }

  if (config.username && config.password && !scoped) {
    clientOptions.auth = {
      username: config.username,
      password: config.password,
    };
  }

  clientOptions.nodes = config.hosts.map((host) => convertHost(host));

  if (config.ssl) {
    clientOptions.ssl = generateSslConfig(
      config.ssl,
      scoped && !config.ssl.alwaysPresentCertificate
    );
  }

  if (config.disablePrototypePoisoningProtection != null) {
    clientOptions.disablePrototypePoisoningProtection = config.disablePrototypePoisoningProtection;
  }

  return clientOptions;
}

const generateSslConfig = (
  sslConfig: Required<OpenSearchClientConfig>['ssl'],
  ignoreCertAndKey: boolean
): TlsConnectionOptions => {
  const ssl: TlsConnectionOptions = {
    ca: sslConfig.certificateAuthorities,
  };

  const verificationMode = sslConfig.verificationMode;
  switch (verificationMode) {
    case 'none':
      ssl.rejectUnauthorized = false;
      break;
    case 'certificate':
      ssl.rejectUnauthorized = true;
      // by default, NodeJS is checking the server identify
      ssl.checkServerIdentity = () => undefined;
      break;
    case 'full':
      ssl.rejectUnauthorized = true;
      break;
    default:
      throw new Error(`Unknown ssl verificationMode: ${verificationMode}`);
  }

  // Add client certificate and key if required by opensearch
  if (!ignoreCertAndKey && sslConfig.certificate && sslConfig.key) {
    ssl.cert = sslConfig.certificate;
    ssl.key = sslConfig.key;
    ssl.passphrase = sslConfig.keyPassphrase;
  }

  return ssl;
};

const convertHost = (host: string): NodeOptions => {
  const url = new URL(host);
  const isHTTPS = url.protocol === 'https:';
  url.port = url.port || (isHTTPS ? '443' : '80');

  return {
    url,
  };
};

const getDurationAsMs = (duration: number | Duration) =>
  typeof duration === 'number' ? duration : duration.asMilliseconds();