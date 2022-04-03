// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
// Copyright (c) 2021, Madhatter, Fandom Gold Society
//
// Please see the included LICENSE file for more information.

import * as readLastLines from "read-last-lines";
import express from "express";
import geoip from "geoip-lite";
import {utils} from "./utils.js";
import * as path from "path";
import * as fs from "fs";

function safeResolve(relPath) {
  var safeSuffix = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.resolve(safeSuffix);
}

export const apiServer = {

  createServer: function (config, nodeDirectory, onDataCallback) {
    const app = express();

    app.listen(config.api.port, () => {
      console.log("API server running on port " + config.api.port);
    });

    app.get("/getInfo", (req, res) => {
      var statusResponse = onDataCallback();
      res.set('Access-Control-Allow-Origin', '*');
      res.set('X-Powered-By', 'FangoNodeGuard');
      res.json(statusResponse);
    });

    app.get("/getDaemonLog", (req, res) => {
      readLastLines.read(path.join(nodeDirectory, 'fangod.log'), 500).then((lines) => {
        res.send(lines);
      });
    });

    app.get("/getGuardianLog", (req, res) => {
      readLastLines.read(path.join(utils.ensureUserDataDir(), 'debug.log'), 500).then((lines) => {
        res.send(lines);
      });
    });

    app.get("/getPeersData", (req, res) => {
      var statusResponse = onDataCallback();
      var peerGeoData = [];

      if ((statusResponse.blockchain) && (statusResponse.blockchain.connections)) {
        statusResponse.blockchain.connections.forEach(function (value) {
          peerGeoData.push(geoip.lookup(value));
        });
      }

      res.send(peerGeoData);
    });

    app.get("/index.html", (req, res) => {
      res.sendFile(path.resolve('html/index.html'));
    });

    app.get("/dashboard.html", (req, res) => {
      res.sendFile(path.resolve('html/dashboard.html'));
    });

    app.get("/daemonLog.html", (req, res) => {
      res.sendFile(path.resolve('html/daemonLog.html'));
    });

    app.get("/peers.html", (req, res) => {
      res.sendFile(path.resolve('html/peers.html'));
    });

    app.get("*", (req, res) => {
      if (path.extname(req.path) !== '.map') {
        var pathName = safeResolve('html' + req.path);

        if (fs.existsSync(pathName)) {
          res.sendFile(pathName);
        } else {
          res.status(404).send('Not found');
        }
      } else {
        res.status(404).send('Not found');
      }
    });
  }
};
