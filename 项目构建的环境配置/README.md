# 解决electron-vue，执行打包时遇到的错误

### electron-v2.4.0-win32-x64.zip与SHASUMS256.txt-2.4.0两个文件是electron打包必须的文件，用于打exe文件，electron-builder打包也需要两个文件：

1. 打包成文件夹及绿色免安装：
electron-builder --dir（依赖winCodeSign）

2. 打包成exe的安装包
electron-builder （依赖winCodeSign和nsis）

### 接下来看具体操作

##### electron-v2.0.18-win32-x64 安装失败，具体版本看报错提示信息
1. electron的淘宝镜像地址：https://npm.taobao.org/mirrors/electron/ 直接点击打开
2. 找到2.0.18这个版本，点开
3. 找到electron-v2.0.18-win32-x64.zip，直接下载
4. 放到目录：C:\Users\windows用户\AppData\Local\electron\Cache

##### winCodeSign-2.4.0 下载失败，具体版本看报错提示
1. 直接打开链接：https://github.com/electron-userland/electron-builder-binaries/releases/tag/winCodeSign-2.4.0，选择 winCodeSign-2.4.0.7z 下载
2. 在文件夹C:\Users\windows用户\AppData\Local\electron-builder\cache\winCodeSign，新建文件winCodeSign-2.4.0，新建的文件夹名字需要和npm run build是要求下载的文件名一致，将下载好的包解压出来，丢到winCodeSign-2.4.0文件夹下

##### nsis-3.0.3.2下载失败
1. 直接打开 https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.3.2/nsis-3.0.3.2.7z 下载
2. 在文件夹C:\Users\windows用户\AppData\Local\electron-builder\cache\nsis，新建文件nsis-3.0.3.2，新建的文件夹名字需要和npm run build是要求下载的文件名一致，将下载好的包解压出来，丢到nsis-3.0.3.2文件夹下

##### nsis-resources-3.3.0下载失败
1. 直接打开 https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.3.0/nsis-resources-3.3.0.7z 下载
2. 在文件夹C:\Users\windows用户\AppData\Local\electron-builder\cache\nsis，新建文件nsis-resources-3.3.0，新建的文件夹名字需要和npm run build是要求下载的文件名一致，将下载好的包解压出来，丢到nsis-resources-3.3.0文件夹下



以上 electron-v2.0.18-win32-x64、winCodeSign-2.4.0、nsis-3.0.3.2 nsis-resources-3.3.0 的对应安装包都放在同级目录的“安装包”文件夹里，就不用再去下载

至此配置完成，打包不会报错。




