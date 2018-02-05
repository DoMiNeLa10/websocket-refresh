/*global WebSocket */
(() => {
  const port = 8888,
        retryTime = 10 * 60 * 1000;

  const log = (...things) => console.log("Refresh client:", ...things);

  const RefreshSocket = class {
    constructor (address = `ws://${window.location.hostname}:${port}`) {
      this.address = address;
      this.init();
    }

    init () {
      let refreshSocket = new WebSocket(this.address, "refresh-protocol");

      log(`Trying to open connection to ${this.address}…`);

      refreshSocket.addEventListener(
        "open",
        () => log(`Refresh socket to ${this.address} opened successfully`));

      refreshSocket.addEventListener(
        "message",
        () => {
          refreshSocket.close();
          window.location.reload(true);
        });

      refreshSocket.addEventListener(
        "close",
        () => {
          log(`Refresh socket to ${this.address} closed`);
          window.setTimeout(() => this.init(), retryTime);
        });
    }
  };

  let socket = new RefreshSocket();
})();
