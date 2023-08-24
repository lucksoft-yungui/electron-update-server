# electron-update-server

This project is intended for deploying an Electron application update server in a private cloud. It is modified and extended based on [Atlassian's Nucleus](https://github.com/atlassian/nucleus). Thanks to the Atlassian team for their outstanding contributions to the open-source community.

[Simplified Chinese](./README-zh_CN.md) | [English](./README.md)

# Modifications and Enhancements

- Supports the upload, download, and version management of linux (ubuntu) deb files.
- Supports the arm64 architecture, including darwin, win32, and linux platforms.
- Removed online package management like yum and apt for linux platform, focusing on private deployment scenarios.

## ToDo

- Support higher versions of node.
- Support the arm architecture.
- Support refreshing relevant static files when the staticUrl changes.

# Startup

```
docker run --name update-server -v /home/ubuntu/app/update-server/data:/opt/service/data -v /home/ubuntu/app/update-server/config.js:/opt/service/config.js -p 3030:3030 -p 9999:9999 -d lucksoft/update-server:1.2.4
```
# Port Description

- 3030: Management, release side, and API service port.
- 9999: Service static resource service port, used for new version detection of applications, application executable file downloads, etc.

# File Mapping

- `/opt/service/config.js` is the mapping path for the configuration file.
- The folder `/opt/service/data` inside the container stores the data of the management side and the static files of each version. It needs to be mapped to avoid data loss when docker restarts.

# Configuration File

The configuration page has the following key configuration items:

- port, service port, default 3030.
- baseURL, the address of backend management, for display only.
- local.staticUrl, static server address, which will affect the absolute address of the update file in the version file.
- localAuth, management background user list.
- adminIdentifiers, admin users, by default from `localAuth`.

> Note: Due to the project's version information file...

# Static Directory Structure

The generated static directory structure is as follows:

.file/  
|-- $appName/  
|   |-- $channelId  
|   |   |-- _index  // Installation programs and update packages are stored here based on version and platform architecture  

|   |   |   |-- $version  
|   |   |   |   |-- $platform  
|   |   |   |   |   |-- $arch  
|   |   |   |   |   |   |-- dmg, zip, exe, nupkg, deb // Update and installation files  

|   |   |-- latest  // The latest version of the application installation files are stored here based on platform architecture  
|   |   |   |-- platform   
|   |   |   |   |-- $arch  
|   |   |   |   |   |-- dmg, exe, deb installation files  

|   |   |-- $platform  
|   |   |   |-- $arch  
|   |   |   |   |-- rollout (0-100) // Directory for phased rollout  
|   |   |   |   |   |-- RELEASE(win)/RELEASE.json(darwin/linux) // Version information file  
|   |   |   |   |-- dmg, zip, exe, nupkg, deb // Update and installation files  
|   |   |   |   |-- RELEASE(win)/RELEASE.json(darwin/linux)  
|   |   |-- versions.json  // Contains version information for all platforms and architectures  

|-- icon.png  
|-- icon.ico


The overall structure is illustrated in the diagram below:

![picture 0](assets/40e2250b62e69e8f2f9a5e4b32d004bca66fea25c9b40a6ac2a06f6732020024.png)  


# Client Usage Example

Please refer to [luck-electron-auto-updater](https://github.com/lucksoft-yungui/luck-electron-auto-updater). This project expands upon the native `electron autoUpdater` and supports notifying users about updates on the Linux system (currently Ubuntu).

# Development

```
git clone https://github.com/lucksoft-yungui/electron-update-server.git
cd electron-update-server
yarn
yarn dev
```

> Note: The current version only supports node8 and x64 architecture.



# Management Interface

Default access address: [http://localhost:3030/](http://localhost:3030/)

## App Creation

After creating the application in the management interface, you can see attributes such as `Token`, `channelId`, and `appId` in the application details page.

Image below:

![picture 1](assets/2fe62a569925dca99231d0bd11499c803dc3b93309f65aa5226820912f670505.png) 

Then configure the `forge.config.js` file in the application root directory:

```
const forgeConfig = {
  // More config
  publishers: [
    {
      name: '@electron-forge/publisher-nucleus',
      config: {
        host: 'http://localhost:3030',
        appId: '1',
        channelId: 'f41b4338993c33ca6f6177ff5254454d',
        token: process.env.NUCLEUS_TOKEN // This should be set securely
      }
    }
  ]
  // More config
};
```

## App Publishing

```
npm run publish -- --target @electron-forge/publisher-nucleus --arch x64
```

If you only want to generate pre-release temporary files (packaged but not uploaded), use the following command:

```
npm run publish -- --target @electron-forge/publisher-nucleus --dry-run --arch arm64
```

To publish the pre-release files:

```
npm run publish -- --target @electron-forge/publisher-nucleus --from-dry-run --arch arm64
```

Additionally, you can use the batch release tool [electron-update-server-uploader](https://github.com/lucksoft-yungui/electron-update-server-uploader) for multi-platform and multi-architecture version deployment.


After publishing, version information is stored on the `Draft` tab, and you can click the `Released` button to generate the official version.

![picture 2](assets/c97e97f4318808c24d0290be262ac28d80e1194ef06abe3930baedcfe3b12e48.png)  

![picture 3](assets/fc4da13554143103a15149db8b111a060e2edcf87bf49797b7ae02f89c646b47.png)  

## Staged Release

On the `Released` tab, you can set up a staged release for an application. Set the percentage for staged release using the button shown below:

![picture 4](assets/1c1c6039576cc51d34738fdd29ba7f892e250cab519b67e2b9f28c55a90ed2c1.png)  

Usage example:

```
// Without using staged release
const suffix = ['darwin', 'linux'].includes(process.platform) ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : '';
const checkUpdateUrl = `${domain}/${appName}/${channel}/${process.platform}/${process.arch}/${suffix}`;
```

```
// Using staged release
const suffix = ['darwin', 'linux'].includes(process.platform) ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : '';
const rollout = Math.floor(Math.random() * 100) + 1;
const checkUpdateUrl = `${domain}/${appName}/${channel}/${process.platform}/${process.arch}/${rollout}/${suffix}`;
```

# File Upload Convention

Recommended file formats for upload:

- darwin: dmg (for initial installation), zip (for auto-updates)
- win32: exe (for initial installation), nupkg (for auto-updates)
- linux: deb (for both initial installation and auto-updates)

> Note: Files uploaded for darwin and win32 need to be signed to support auto-updates. Win32 can be signed using a self-signed certificate. For linux, since it's essentially a manual update installation, there's no mandatory requirement for signing.

Below is a packaging configuration example based on `forge`:
```
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const config = require('./config/conf');
const package = require('./package.json');

// 打包日志记录
const log = require("electron-log");
log.transports.file.resolvePathFn = () => path.join(__dirname, 'logs/make.log');
console.log = log.log;

const getArchSuffix = () => {
  const archIndex = process.argv.findIndex(arg => arg === '--arch');
  if (archIndex !== -1 && process.argv[archIndex + 1]) {
    return process.argv[archIndex + 1];
  }
  return '';
};

module.exports = {
  packagerConfig: {
    osxSign: {},
    executableName: package.name,
    asar: {
      unpackDir: "{config,locales}"
    },
    icon: path.join(__dirname, './assets/icons/icon'), // no file extension required
    ignore: [
      "/config/publish.js",
      "/out/",
      "/.gitignore",
      "/forge.config.js",
    ]
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'lucksoft-yungui',
          name: 'pc-client'
        },
        authToken: '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',
        prerelease: true
      }
    },
    {
      name: '@electron-forge/publisher-nucleus',
      config: {
        host: config.autoUpdate.updateServer,
        appId: config.autoUpdate.appId,
        channelId: config.autoUpdate.channel,
        token: process.env.NUCLEUS_TOKEN
        // token: config.autoUpdate.token // This should be set securely
      }
    }
  ],
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: `${package.name}-${getArchSuffix()}`,
        setupExe: `${package.name}-${package.version}-setup-${getArchSuffix()}.exe`,
        iconUrl: path.join(__dirname, './assets/icons/icon.ico'),
        setupIcon: path.join(__dirname, './assets/icons/icon.ico'),
        certificateFile: './cert/win.pfx',
        certificatePassword: process.env.WIN_CERTIFICATE_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: `${package.name}-${package.version}-${getArchSuffix()}`,
        icon: path.join(__dirname, './assets/icons/icon.icns'),
      },
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": ["darwin"]
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        name: `${package.name}`,
        icon: path.join(__dirname, './assets/icons/icon.png'),
      },
    }
  ]
}
```

# API

## /healthcheck
Method: GET Authorization: None

This endpoint doesn't perform any tasks and immediately returns a 200 OK. You should use this to determine if Nucleus is still running and online.

## /deepcheck
Method: GET Authorization: None

This endpoint performs two simple checks to ensure Nucleus is correctly configured.

1. Database connection test - simply tries to connect to the configured database.
2. File storage connection test - simply tries to put, get, and delete a file in storage.

You should only use this endpoint when initially starting Nucleus to verify if your configuration is correct and if Nucleus can run successfully. If the response you receive isn't a 200 OK, then something is wrong.

## /rest/app/:appId/channel/:channelId/upload
Method: POST Authorization: Required

```
POST: /rest/app/:appId/channel/:channelId/upload
Headers:
  Authorization: <AppAuthorizationToken>
BODY:
  platform: String - One of 'darwin', 'win32', and 'linux'
  arch: String - One of 'ia32' and 'x64'
  version: String
FILES:
  <AnyString>: File
```

# License
This project is licensed under the Apache License 2.0. You can find the full licensing agreement in the LICENSE file.

