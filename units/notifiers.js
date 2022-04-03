// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
// Copyright (c) 2021, Madhatter, Fandom Gold Society
//
// Please see the included LICENSE file for more information.

//const nodemailer = require("nodemailer");
import * as nodemailer from "nodemailer";

import {vsprintf} from "sprintf-js";
import request from "request";

//const oPath = require("object-path");
import objectPath from "object-path";


//const os = require("os");
import * as os from "os";

function notifyViaDiscord(config, msgText, msgType, nodeData) {
  if (objectPath.get(config, 'error.notify.discord.url', '')) {
    var hookOptions = {
      uri: objectPath.get(config, 'error.notify.discord.url', ''),
      method: "POST",
      json: {
        content: vsprintf("Node **%s** reported an error -> %s \n", [
          nodeData.name,
          msgText
        ])
      }
    };

    request(hookOptions, function () {
      // for now its fire and forget, no matter if error occurs
    });
  }
}

function notifyViaEmail(config, msgText, msgType, nodeData) {
  var auth = null;

  if (objectPath.get(config, 'error.notify.email.auth.username', '')) {
    auth = {
      user: objectPath.get(config, 'error.notify.email.auth.username', ''),
      pass: objectPath.get(config, 'error.notify.email.auth.password', '')
    };
  }

  // create transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: objectPath.get(config, 'error.notify.email.smtp.host', ''),
    port: objectPath.get(config, 'error.notify.email.smtp.port', 25),
    secure: objectPath.get(config, 'error.notify.email.smtp.secure', false),
    auth: auth,
    tls: {
      rejectUnauthorized: false
    }
  });

  const bodyContentHTML = vsprintf("Node <B>%s</B> reported an error -> %s", [
    nodeData.name,
    msgText
  ]);

  const bodyContentPlain = vsprintf("Node **%s** reported an error -> %s", [
    nodeData.name,
    msgText
  ]);

  // setup email data with unicode symbols
  const mailOptions = {
    from: objectPath.get(config, 'error.notify.email.message.from', ''),
    to: objectPath.get(config, 'error.notify.email.message.to', ''),
    subject: objectPath.get(config, 'error.notify.email.message.subject', 'Fango Node Guard Error'),
    text: bodyContentPlain, // plain text body
    html: bodyContentHTML  // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    // for now its fire and forget, no matter if error occurs
  });
}

export const notifiers = {

  notifyOnError: function (config, msgText, msgType, nodeData) {
    // check if we need to notify the Discord
    if (config.error.notify.discord) {
      notifyViaDiscord(config, msgText, msgType, nodeData);
    }

    if (config.error.notify.email) {
      notifyViaEmail(config, msgText, msgType, nodeData);
    }
  }
};
