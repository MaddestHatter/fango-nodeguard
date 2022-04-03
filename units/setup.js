// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
// Copyright (c) 2021, Madhatter, Fandom Gold Society
//
// Please see the included LICENSE file for more information.

import inquirer from "inquirer";
import objectPath from "object-path";
import * as fs from "fs";

export const setup = {
  Initialize: function (configFileName) {
    const configOpts = JSON.parse(fs.readFileSync(configFileName), "utf8");

    var questions = [
      {
        type: 'input',
        name: 'nodePath',
        message: 'Please input the path to the "fangod" executable (if you do not know what to put in, leave it empty)',
        default: objectPath.get(configOpts, 'node.path', '')
      },
      {
        type: 'input',
        name: 'nodeName',
        message: 'Please input name for your node (this will be what others see)',
        default: objectPath.get(configOpts, 'node.name', ''),
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'Node name cannot be empty!';
          }
        }
      },
      {
        type: 'confirm',
        name: 'useFeeAddress',
        message: 'Will this be a fee based remote node?',
        default: objectPath.has(configOpts, 'node.feeAddr'),
      },
      {
        type: 'input',
        name: 'feeAddress',
        message: 'Please input the fee address for your node (earnings will be sent to that address)',
        default: objectPath.get(configOpts, 'node.feeAddr', ''),
        when: function (answers) {
          return answers.useFeeAddress;
        }
      },
      {
        type: 'confirm',
        name: 'reachableOutside',
        message: 'Will your node be accessible from the outside?',
        default: objectPath.get(configOpts, 'node.bindAddr', '127.0.0.1') == '0.0.0.0' ? true : false
      },
      {
        type: 'confirm',
        name: 'autoUpdate',
        message: 'Will your node have auto update enabled?',
        default: objectPath.get(configOpts, 'node.autoUpdate', false)
      },
      {
        type: 'confirm',
        name: 'nodeUrl',
        message: 'Will your node have a custom url? (if you do not know about it, just leave it empty)',
        default: objectPath.has(configOpts, 'url')
      },
      {
        type: 'input',
        name: 'nodeUrlHost',
        message: 'Input the node url hostname',
        default: objectPath.get(configOpts, 'url.host', ''),
        when: function (answers) {
          return answers.nodeUrl;
        }
      },
      {
        type: 'input',
        name: 'nodeUrlPort',
        message: 'Input the node url port',
        default: objectPath.get(configOpts, 'url.port', ''),
        when: function (answers) {
          return answers.nodeUrl;
        }
      },
      {
        type: 'confirm',
        name: 'usePool',
        message: 'Do you want to be listed in the nodes pool?',
        default: objectPath.has(configOpts, 'pool.notify')
      },
      {
        type: 'input',
        name: 'poolURL',
        message: 'Please input the URL of the pool (default value should be ok)',
        default: objectPath.get(configOpts, 'pool.notify.url', ''),
        when: function (answers) {
          return answers.usePool;
        }
      },
      {
        type: 'confirm',
        name: 'notifyDiscord',
        message: 'Do you want to be notified on Discord in case of problems?',
        default: objectPath.has(configOpts, 'error.notify.discord')
      },
      {
        type: 'input',
        name: 'discordHookURL',
        message: 'Please input the Discord hook to which error message will be sent',
        default: objectPath.get(configOpts, 'error.notify.discord.url', ''),
        when: function (answers) {
          return answers.notifyDiscord;
        }
      },
      {
        type: 'confirm',
        name: 'notifyEmail',
        message: 'Do you want to be notified over email in case of problems?',
        default: objectPath.has(configOpts, 'error.notify.email')
      },
      {
        type: 'input',
        name: 'emailSMTPHost',
        message: 'Please input the SMTP server hostname',
        default: objectPath.get(configOpts, 'error.notify.email.smtp.host', ''),
        when: function (answers) {
          return answers.notifyEmail;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'SMTP server host cannot be empty!';
          }
        }
      },
      {
        type: 'input',
        name: 'emailSMTPPort',
        message: 'Please input the SMTP server port',
        default: objectPath.get(configOpts, 'error.notify.email.smtp.port', 25),
        when: function (answers) {
          return answers.notifyEmail;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'SMTP server port cannot be empty!';
          }
        }
      },
      {
        type: 'confirm',
        name: 'emailSMTPSecure',
        message: 'Is the SMTP connection secure?',
        default: objectPath.get(configOpts, 'error.notify.email.smtp.secure', false),
        when: function (answers) {
          return answers.notifyEmail;
        }
      },
      {
        type: 'confirm',
        name: 'emailRequireAuth',
        message: 'Does the SMTP server requere authentication for sending out emails (most do)?',
        default: true,
        when: function (answers) {
          return answers.notifyEmail;
        }
      },
      {
        type: 'input',
        name: 'emailAuthUsername',
        message: 'Please input the SMTP server "username"',
        default: objectPath.get(configOpts, 'error.notify.email.auth.username', ''),
        when: function (answers) {
          return answers.emailRequireAuth;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'SMTP server "username" cannot be empty!';
          }
        }
      },
      {
        type: 'password',
        name: 'emailAuthPassword',
        message: 'Please input the SMTP server "password"',
        default: objectPath.get(configOpts, 'error.notify.email.auth.password', ''),
        when: function (answers) {
          return answers.emailRequireAuth;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'SMTP server "password" cannot be empty!';
          }
        }
      },
      {
        type: 'input',
        name: 'emailMessageFrom',
        message: 'Please input the email "from" field value',
        default: objectPath.get(configOpts, 'error.notify.email.message.from', ''),
        when: function (answers) {
          return answers.notifyEmail;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'Email "from" field cannot be empty!';
          }
        }
      },
      {
        type: 'input',
        name: 'emailMessageTo',
        message: 'Please input the email "to" field value',
        default: objectPath.get(configOpts, 'error.notify.email.message.to', ''),
        when: function (answers) {
          return answers.notifyEmail;
        },
        validate: function (value) {
          if (value) {
            return true;
          } else {
            return 'Email "to" field cannot be empty!';
          }
        }
      },
      {
        type: 'input',
        name: 'emailMessageSubject',
        message: 'Please input the email "subject" field value',
        default: objectPath.get(configOpts, 'error.notify.email.message.subject', ''),
        when: function (answers) {
          return answers.notifyEmail;
        }
      },
    ];

    inquirer.prompt(questions).then(answers => {
      // node name is mandatory
      objectPath.set(configOpts, 'node.name', answers.nodeName);
      answers.nodePath ? objectPath.set(configOpts, 'node.path', answers.nodePath) : objectPath.del(configOpts, 'node.path');
      answers.reachableOutside ? objectPath.set(configOpts, 'node.bindAddr', '0.0.0.0') : objectPath.set(configOpts, 'node.bindAddr', '127.0.0.1');
      answers.autoUpdate ? objectPath.set(configOpts, 'node.autoUpdate', true) : objectPath.del(configOpts, 'node.autoUpdate');

      answers.useFeeAddress ? objectPath.set(configOpts, 'node.feeAddr', answers.feeAddress) : objectPath.del(configOpts, 'node.feeAddr');
      answers.usePool ? objectPath.set(configOpts, 'pool.notify.url', answers.poolURL) : objectPath.del(configOpts, 'pool.notify');
      answers.notifyDiscord ? objectPath.set(configOpts, 'error.notify.discord.url', answers.discordHookURL) : objectPath.del(configOpts, 'error.notify.discord');

      if (answers.nodeUrl) {
        objectPath.set(configOpts, 'url.host', answers.nodeUrlHost);
        objectPath.set(configOpts, 'url.port', answers.nodeUrlPort);
      } else {
        objectPath.del(configOpts, 'url');
      }

      if (answers.notifyEmail) {
        objectPath.set(configOpts, 'error.notify.email.smtp.host', answers.emailSMTPHost);
        objectPath.set(configOpts, 'error.notify.email.smtp.port', answers.emailSMTPPort);
        objectPath.set(configOpts, 'error.notify.email.smtp.secure', answers.emailSMTPSecure);

        if (answers.emailRequireAuth) {
          objectPath.set(configOpts, 'error.notify.email.auth.username', answers.emailAuthUsername);
          objectPath.set(configOpts, 'error.notify.email.auth.password', answers.emailAuthPassword);
        } else {
          objectPath.del(configOpts, 'error.notify.email.auth');
        }

        objectPath.set(configOpts, 'error.notify.email.message.from', answers.emailMessageFrom);
        objectPath.set(configOpts, 'error.notify.email.message.to', answers.emailMessageTo);
        objectPath.set(configOpts, 'error.notify.email.message.subject', answers.emailMessageSubject);
      } else {
        objectPath.del(configOpts, 'error.notify.email');
      }

      fs.writeFile(configFileName, JSON.stringify(configOpts, null, 2), function (err) {
        if (err) {
          console.log('\nError trying to save the changes: ' + err);
        } else {
          console.log('\nYour changes have been saved!');
        }
      });
    });
  }
};
