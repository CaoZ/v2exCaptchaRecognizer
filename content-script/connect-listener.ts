export class ConnectListener {
    private port: chrome.runtime.Port;
    constructor(callback: (message: Object, port: chrome.runtime.Port) => void) {
        this.port = chrome.runtime.connect({});
        this.port.onMessage.addListener(callback);
    }

    post(message: Object) {
        this.port.postMessage(message);
    }
}
