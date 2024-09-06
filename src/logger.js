var LOGGLY_COLLECTOR_DOMAIN = 'logs-01.loggly.com',
  LOGGLY_PROXY_DOMAIN = 'loggly';

// Utility function to generate a UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// LogglyTracker class definition
class LogglyTracker {
  constructor() {
    this.key = null;
    this.tag = 'jslogger';
    /**
     * If the script or its requests are blocked by ad blockers, you can proxy requests from your own domain.
     * Set useProxyDomain property to true
     */
    this.useDomainProxy = false;
    /**
     * Set the useUtfEncoding value to true to prevent special characters from showing 
     * as odd or unusual characters in Loggly Search. Special characters will be easier 
     * to read and understand in your log events.
     */
    this.useUtfEncoding = false;
    this.session_id = this.initSession(); // Set the session_id in-memory
    this.user_id = null;  // Initialize user_id as null
  }

  initSession() {
    // Create and return a new session ID in memory
    return uuid();
  }

  setKey(key) {
    this.key = key;
    this.setInputUrl();
  }

  setTag(tag) {
    this.tag = tag;
  }

  setDomainProxy(useDomainProxy) {
    this.useDomainProxy = useDomainProxy;
    this.setInputUrl();
  }

  setUtfEncoding(useUtfEncoding) {
    this.useUtfEncoding = useUtfEncoding;
  }

  setUserId(user_id) {
    this.user_id = user_id;  // Set the user_id
  }

  setInputUrl() {
    const protocol = 'https'
    const logglyDomain = this.useDomainProxy ? `/${LOGGLY_PROXY_DOMAIN}/inputs/` : `/${LOGGLY_COLLECTOR_DOMAIN}/inputs/`;
    this.inputUrl = `${protocol}://${logglyDomain}${this.key}/tag/${this.tag}`;
  }

  async push(data) {
    if (!this.key) return;

    if (typeof data === 'string') {
      data = { text: data };
    }

    data.sessionId = this.session_id; // Add session_id to the data

    if (this.user_id) {
      data.user_id = this.user_id; // Add user_id to the data
    }

    try {
      await fetch(this.inputUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': this.useUtfEncoding ? 'text/plain; charset=utf-8' : 'text/plain',
        },
        body: JSON.stringify(data),
      });
    } catch (ex) {
      console.error("Failed to log to Loggly:", ex, "Log data:", data);
    }
  }
}

export default LogglyTracker;