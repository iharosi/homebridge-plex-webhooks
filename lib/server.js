const express = require('express');
const ip = require('ip');
const { get } = require('lodash');
const multer = require('multer');
const landingPage = require('./landingPage');
const { LISTENING_PORT } = require('./constants');

class WebhooksServer {
  constructor(log, config, callback) {
    this.log = log;
    this.callback = callback;
    this.port = get(config, 'server.port') || LISTENING_PORT;
    this.address = get(config, 'server.address') || ip.address();
    this.upload = multer({ dest: '/tmp/' });
  }

  errorHandler(error) {
    const { code, address, port } = error;

    switch (code) {
      case 'EADDRNOTAVAIL':
        this.log.error(`Error: address is not available ${address}:${port}`);
        break;
      default:
        this.log.error(error);
    }
  }

  launch() {
    const { log, callback, port, address, upload } = this;
    const app = express();

    app.post('/', upload.single('thumb'), (req, res) => {
      const rawPayload = get(req, 'body.payload', '');
      const payload = JSON.parse(rawPayload);

      log.verbose(rawPayload);
      callback(payload);
      res.sendStatus(200);
    });
    app.get('/', (req, res) => {
      res.type('html');
      res.status(200).send(
        landingPage(`http://${address}:${port}`)
      );
    });
    app.listen(port, address, () => {
      log.info(
        `Server is listening at http://${address}:${port}`
      );
    }).on('error', this.errorHandler.bind(this));
  }
}

module.exports = WebhooksServer;
