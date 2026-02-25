export class MatrixClient {
  async getUserId() {
    return "@mock:example.org";
  }
}

export const LogService = {
  setLogger: () => {},
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

export class ConsoleLogger {
  trace() {}
  debug() {}
  info() {}
  warn() {}
  error() {}
}

export class SimpleFsStorageProvider {}

export class RustSdkCryptoStorageProvider {}

export const AutojoinRoomsMixin = {
  setupOnClient: () => {},
};
