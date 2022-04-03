// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
// Copyright (c) 2021, Madhatter, Fandom Gold Society
//
// Please see the included LICENSE file for more information.

import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import * as mainEngine from "./units/engine.js";
import {vsprintf} from "sprintf-js"; 
import {download} from "./units/download.js";
import {service} from "./units/service.js";
import {setup} from "./units/setup.js";
import {utils} from "./units/utils.js";
import * as path from "path";
import * as fs from "fs";

const pjson = JSON.parse(fs.readFileSync("./package.json","utf8"));

try {
  
  var cmdOptionDef = [ 
    { name: "config", type: String },
    { name: "daemon", type: String }, 
    { name: "service",type: String }, 
    { name: "setup", type: Boolean },
    { name: "node", type: String },
    { name: "update", type: Boolean },
    { name: "version", type: Boolean },
    { name: "help", alias: "h", type: Boolean }
  ];
 
  var cmdOptions = commandLineArgs(cmdOptionDef);

} catch (err) {
  console.error("\nUknown command line parameter. Use --help for instructions.");
  process.exit();
}

if (cmdOptions.help) {
  const sections = [
    {
      header: 'Fango Node Guardian',
      content: 'This is a guardian app for the fango node daemon. Handles restarts, sends notifications, registers to pool...'
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'config',
          typeLabel: '{underline file}',
          description: 'The path to configuration file. If empty it uses the config.json in the same directory as the app.'
        },
        {
          name: 'daemon',
          typeLabel: '{underline file}',
          description: 'The path to node daemon executable. If empty it uses the same directory as the app.'
        },
        {
          name: 'setup',
          description: 'Initiates the interactive config setup for the guardian'
        },
        {
          name: 'service',
          description: 'Controls the service behaviour. Possible values are: "install", "remove", "start", "stop"'
        },
        {
          name: 'node',
          description: 'Node related commands. Possible values are: "update"'
        },
        {
          name: 'update',
          description: 'Update the guardian instance to the latest version'
        },
        {
          name: 'version',
          description: 'Shows the verion of the Guardian app'
        },
        {
          name: 'help',
          description: 'Shows this help instructions'
        }
      ]
    },
    {
      header: 'Service option values',
      optionList: [
        {
          name: 'install',
          description: 'Install the guardian as a service in the OS.'
        },
        {
          name: 'remove',
          description: 'Removes the guardian as a service from the OS.'
        },
        {
          name: 'start',
          description: 'Starts the guardian as OS service.'
        },
        {
          name: 'stop',
          description: 'Stops the guardian as OS service.'
        }
      ]
    },
    {
      header: 'Node option values',
      optionList: [
        {
          name: 'update',
          description: 'Updates to the latest stable version of the node daemon. Node must be stoped first'
        }
      ]
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
} else if (cmdOptions.version) {
  console.log(vsprintf('\nFango node guardian version %s\n', [pjson.version]));
} else {
  const rootPath = process.cwd();
  const configFileName = cmdOptions.config || path.join(rootPath, "config.json");

  if (!fs.existsSync(configFileName)) {
    console.log(vsprintf('\n"%s" does not exist! Specify the correct path to the config file or create config.json in the same directory as the application. You can use the config.json.sample as an example\n', [
      configFileName,
    ]));
  } else {
    // read config option to use them either in engine or setup module
    const configOpts = JSON.parse(fs.readFileSync(cmdOptions.config || path.join(rootPath, "config.json"), "utf8"));

    // check if arguments are specified if not make an empty array
    if (!(configOpts.node && configOpts.node.args)) {
      configOpts.node.args = [];
    }

    if (configOpts.node && configOpts.node.bindAddr) {
      var addrIndex = configOpts.node.args.indexOf("--rpc-bind-ip");

      if (addrIndex == -1) {
        // add bind address to arguments
        configOpts.node.args.push("--rpc-bind-ip");
        configOpts.node.args.push(configOpts.node.bindAddr);
      } else {
        configOpts.node.args[addrIndex + 1] = configOpts.node.bindAddr;
      }
    }

    if (configOpts.node && configOpts.node.port) {
      var portIndex = configOpts.node.args.indexOf("--rpc-bind-port");

      if (portIndex == -1) {
        // add fee address to arguments
        configOpts.node.args.push("--rpc-bind-port");
        configOpts.node.args.push(configOpts.node.port);
      } else {
        configOpts.node.args[portIndex + 1] = configOpts.node.port;
      }
    }

    if (configOpts.node && configOpts.node.indexes) {
      // enable blockchain explorer 
      configOpts.node.args.push("--enable-blockchain-indexes");
    }

    if (configOpts.node && configOpts.node.autosave) {
      // enable autosave every 720 blocks 
      configOpts.node.args.push("--enable-autosave");
    }


    if (configOpts.node && configOpts.node.feeAddr) {
      // add fee address to arguments
      configOpts.node.args.push("--fee-address");
      configOpts.node.args.push(configOpts.node.feeAddr);
    }

    if (configOpts.node && configOpts.node.feeViewKey) {
     // add fee View Key to arguments
     configOpts.node.args.push("--view-key");
     configOpts.node.args.push(configOpts.node.feeViewKey);
    }

    if (configOpts.node && configOpts.node.miningAddr && configOpts.node.miningThreads) {
     configOpts.node.args.push("--start-mining");
     configOpts.node.args.push(configOpts.node.miningAddr);
    }

    if (configOpts.node && configOpts.node.miningThreads) {
     configOpts.node.args.push("--mining-threads");
     configOpts.node.args.push(configOpts.node.miningThreads);
    }



    if (cmdOptions.setup) {
      setup.Initialize(configFileName);
    } else if (cmdOptions.service) {
      switch (cmdOptions.service) {
        case "install":
          service.install(configOpts, configFileName);
          break;
        case "remove":
          service.remove(configOpts, configFileName);
          break;
        case "start":
          service.start(configOpts, configFileName);
          break;
        case "stop":
          service.stop(configOpts, configFileName);
          break;
        case "status":
          service.status(configOpts, configFileName);
          break;
        default: console.log('\nWrong parameter for service command. Valid values: "install", "remove", "start", "stop"\n');
      }
    } else if (cmdOptions.node) {
      if (cmdOptions.node === "update") {
        service.stop(configOpts, configFileName);
        download.downloadLatestDaemon(utils.getNodeActualPath(cmdOptions, configOpts, rootPath), function (error) {
          if (error) {
            console.log(vsprintf("\nError updating daemon: %s\n", [error]));
          } else {
            console.log("\nThe daemon has been succesfully updated\n");
          }
        });
      } else {
        console.log('\nWrong parameter for node command. Valid values: "update"\n');
      }
    } else if (cmdOptions.update) {
      service.stop(configOpts, configFileName);
      download.downloadLatestGuardian(function (error) {
        if (error) {
          console.log(vsprintf("\nError updating the guardian: %s\n", [error]));
        } else {
          console.log("\nThe guardian has been succesfully updated\n");
        }
      });
    } else {
      const nodePath = utils.getNodeActualPath(cmdOptions, configOpts, rootPath);
      var guardInstance = null;

      // createGuardInstance function
      var createGuardInstance = function () {
        guardInstance = new mainEngine.NodeGuard(cmdOptions, configOpts, rootPath, pjson.version);
      };

      if (!fs.existsSync(nodePath)) {
        download.downloadLatestDaemon(nodePath, function (error) {
          if (error) {
            console.log(vsprintf("\nError updating daemon: %s\n", [error]));
          } else {
            console.log("\nThe daemon has been succesfully updated\n");
            createGuardInstance();
          }
        });
      } else {
        createGuardInstance();
      }

      process.on('uncaughtException', function (err) {
        guardInstance.logError(err);
      });
    }
  }
}
