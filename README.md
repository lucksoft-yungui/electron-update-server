# electron-update-server

本项目目标场景为私有云部署Electron应用更新服务器。

这个项目是基于Atlassian's Nucleus进行修改和扩展的。感谢Atlassian团队为开源社区提供的出色工作。

# 修改和增强

- 支持linux（ubuntu）deb文件的上传、下载与版本管理
- 支持arm64架构，包括darwin、win32、linux平台
- 移除linux平台下yum、apt在线包管理，专注于私有化场景

# 启动

```
docker run --name  update-server -v /home/ubuntu/app/update-server/data:/opt/service/data -v /home/ubuntu/app/update-server/config.js:/opt/service/config.js -p 3030:3030 -p 9999:9999 -d lucksoft/update-server:1.2.4
```
# 端口说明

- 3030：管理、发布端及api服务端口
- 9999：服务静态资源服务端口，用于应用的新版本检测、应用可执行文件下载等

# 文件映射

- `/opt/service/config.js`为配置文件的映射路径
- 容器内部`/opt/service/data`的文件夹，存放着管理端的数据和各版本的静态文件，需要被映射出来，避免`docker`重启时数据丢失

# 配置文件

配置页面有以下关键配置项:

- port，服务端口，默认3030
- baseURL，后端管理的地址，只做显示用
- local.staticUrl，静态服务器地址，会影响版本文件中的更新文件绝对地址
- localAuth，管理后台用户列表
- adminIdentifiers，管理员用户，默认来自`localAuth`中

> 注：由于项目的版本信息文件都是后台动态生成的静态文件，所以项目默认利用`serve`组件起了一个静态服务器，默认端口9999（目前版本不可配置），用于版本的文件的访问和下载。可自行搭建自己的静态资源服务器，所有生成的资源文件都在`/opt/service/data/.file`文件夹中。

配置参考项目更目录下`config.template.js`文件。

# 静态目录结构

生成的静态目录结构如下：

.file/  
|-- $appName/  
|   |-- $channelId  

|   |   |-- _index  // 这里按版本和平台架构存放安装程序和更新包  
|   |   |   |-- $version  
|   |   |   |   |-- $platform  
|   |   |   |   |   |-- $arch  
|   |   |   |   |   |   |-- dmg、zip、exe、nupkg、deb //更新文件

|   |   |-- $platform  
|   |   |   |-- $arch  
|   |   |   |   |-- rollout（0-100） //灰度发布目录  
|   |   |   |   |   |-- RELEASE(win)/RELEASE.json(darwin/linux) // 版本信息文件
|   |   |   |   |-- dmg、zip、exe、nupkg、deb //更新文件  
|   |   |   |   |-- RELEASE(win)/RELEASE.json(darwin/linux)

|   |   |-- versions.json  // 以版本为维度，包含所有平台和架构的版本信息  

|-- icon.png  
|-- icon.ico

总体结构如下图：

![picture 0](assets/40e2250b62e69e8f2f9a5e4b32d004bca66fea25c9b40a6ac2a06f6732020024.png)  

# 使用示例

ToDo

# 开发

```
git clone https://github.com/lucksoft-yungui/electron-update-server.git
cd electron-update-server
yarn
yarn dev
```

> 注：目前版本只支持node8和x64架构


# 管理界面

默认访问地址[http://localhost:3030/](http://localhost:3030/)

## 应用创建

在管理界面中创建好应用后，可以在应用详情界面看到`Token`、`channelId`、`appId`等属性。

如图：

![picture 1](assets/2fe62a569925dca99231d0bd11499c803dc3b93309f65aa5226820912f670505.png) 

然后配置应用根目录下的`forge.config.js`文件：

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

## 应用发布

```
npm run publish -- --target @electron-forge/publisher-nucleus --arch x64
```

如果只想生成预发布临时文件（只打包不上传），可使用如下命令：

```
npm run publish -- --target @electron-forge/publisher-nucleus --dry-run --arch arm64
```

将预发布文件发布：

```
npm run publish -- --target @electron-forge/publisher-nucleus --from-dry-run --arch arm64
```

发布后的版本信息存储在`Draft`标签页，可以点击`Released`按钮生成正式版。

![picture 2](assets/c97e97f4318808c24d0290be262ac28d80e1194ef06abe3930baedcfe3b12e48.png)  

![picture 3](assets/fc4da13554143103a15149db8b111a060e2edcf87bf49797b7ae02f89c646b47.png)  

## 灰度发布

可以在`Released`标签页中灰度发布某个应用，通过如下的按钮设置灰度发布的百分比：

![picture 4](assets/1c1c6039576cc51d34738fdd29ba7f892e250cab519b67e2b9f28c55a90ed2c1.png)  

# 上传文件约定

ToDo
# Api

ToDo

# 许可
本项目遵循Apache License 2.0。你可以在LICENSE文件中找到完整的许可协议。