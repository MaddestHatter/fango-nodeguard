// Copyright (c) 2019, Taegus Cromis, The Conceal Developers
// Copyright (c) 2021, Madhatter, Fandom Gold Society
//
// Please see the included LICENSE file for more information.

import * as xmlbuilder from "xmlbuilder";
import * as username from "username";
import * as format from "string-template";
import * as shell from "shelljs";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// export functions
export const service = {
  install: function (configOpts, configFileName) {
    try {
      if (process.platform == "win32") {
        var xmlFile = xmlbuilder.create('configuration');
        xmlFile.ele('id', 'ConcealGuardian');
        xmlFile.ele('name', 'Conceal Guardian');
        xmlFile.ele('description', 'Conceal Guardian for monitoring the Conceal Daemon');
        xmlFile.ele('executable', path.join(process.cwd(), 'guardian-win64.exe'));
        xmlFile.ele('arguments', '--config ' + configFileName);

        fs.writeFile("cgservice.xml", xmlFile.end({ pretty: true }), function (err) {
          if (err) {
            console.log('\nError trying to save the XML: ' + err);
          } else {
            shell.exec('cgservice.exe install');
          }
        });
      } else if (process.platform == "linux") {
        var template = fs.readFileSync("ccx-guardian.service.template", "utf8");
        var parsedData = format(template, {
          user: username.sync(),
          workDir: process.cwd(),
          execPath: path.join(process.cwd(), 'guardian-linux64'),
          configPath: configFileName
        });

        fs.writeFile("/etc/systemd/system/ccx-guardian.service", parsedData, function (err) {
          if (err) {
            console.log('\nError trying to save the service file: ' + err);
          } else {
            console.log('\nService is succesfully installed.\n');
            shell.exec('systemctl daemon-reload');
          }
        });
      } else {
        console.log("\nPlatform is not supported!\n");
      }
    } catch (err) {
      console.log(err.message);
    }
  },
  remove: function (configOpts, configFileName) {
    try {
      if (process.platform == "win32") {
        shell.exec('cgservice.exe uninstall');
      } else if (process.platform == "linux") {
        fs.unlink("/etc/systemd/system/ccx-guardian.service", function (err) {
          if (err) {
            console.log('\nError trying to remove the service: ' + err);
          } else {
            console.log('\nService is succesfully removed.\n');
          }
        });
      } else {
        console.log("\nPlatform is not supported!\n");
      }
    } catch (err) {
      console.log(err.message);
    }
  },
  start: function (configOpts, configFileName) {
    try {
      if (process.platform == "win32") {
        shell.exec('cgservice.exe start');
      } else if (process.platform == "linux") {
        shell.exec('systemctl start ccx-guardian');
        shell.exec('systemctl status ccx-guardian');
      } else {
        console.log("\nPlatform is not supported!\n");
      }
    } catch (err) {
      console.log(err.message);
    }
  },
  stop: function (configOpts, configFileName) {
    try {
      if (process.platform == "win32") {
        shell.exec('cgservice.exe stop');
      } else if (process.platform == "linux") {
        shell.exec('systemctl stop ccx-guardian');
      } else {
        console.log("\nPlatform is not supported!\n");
      }
    } catch (err) {
      console.log(err.message);
    }
  },
  status: function (configOpts, configFileName) {
    try {
      if (process.platform == "win32") {
        shell.exec('cgservice.exe status');
      } else if (process.platform == "linux") {
        shell.exec('systemctl status ccx-guardian');
      } else {
        console.log("\nPlatform is not supported!\n");
      }
    } catch (err) {
      console.log(err.message);
    }
  }
};
