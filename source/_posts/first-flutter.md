---
title: 新手入坑Flutter
date: 2018-11-01 21:03:23
tags:
  - flutter
  - dart
  - android
---
> 一直都想玩玩原生应用，因为各种原因并没有着手实践。这段时间趁着有点闲余实践，看着flutter不错，就准备从这块开始入手了。没想到起步就是踩坑。
# 环境和工具
&emsp;&emsp;MacBook Pro一台，系统为*`macOS Mojave v10.14`* ，flutter版本为*`v0.9.4 beta`* ，dart为*`v2.1.0`* 。IDE和编辑器为*`Xcode v10.1`* 、*`Android Stusio v3.2.1`* 、*`Visual Studio Code v1.28.2`* 和*`IDEA V2018.2.1`* 。启用的运行环境都为虚拟机，Android为*`emulator Nexus 5X`* ，iOS为*`simulator iPhone X`*。
## 一、安装各种工具和IDE
&emsp;&emsp;这个就不赘述了，主要就是SDK的安装，稍微注意下就可以了。
## 二、flutter和dart
### 1、镜像源设置
&emsp;&emsp;本文主要在macOS下进行的操作，所以需要依赖于`brewhome`安装flutter和dart。因为flutter包括了dart，所以不需要单独安装dart环境。因为一些外部因素，对于镜像的访问和下载可能有些限制，所以官方提供了国内镜像以供使用。执行`vim ~/.bash_profile`。
```bash
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```
退出保存，执行`source ~/.bash_profile`以生效环境变量设置。详情请参考[官方解决方案](https://github.com/flutter/flutter/wiki/Using-Flutter-in-China)。
&emsp;&emsp;接下来就是安装flutter了。
（1）从[下载页](https://flutter.io/sdk-archive/#macos)或者[github](https://github.com/flutter/flutter/releases)下载最新的安装包。
（2）解压安装包到需要安装的目录，比如我安装的目录是`~/flutter`，那么就执行命令
```bash
$ cd ~
$ unzip ~/Download/flutter_macos_v0.9.4-beta.zip
# 或者直接在下载目录解压文件然后执行复制或者剪切命令将文件拷贝至想要安装的路径下
$ cp ~/Download/flutter ~/ || mv ~/Download/flutter ~/
```
（3）将`flutter`添加到环境变量。执行`vim ~/.bash_profile`。
```bash
export FLUTTER_PATH=/Users/knorien/flutter
export PATH=$PATH:$FLUTTER_PATH/bin
```
执行`source ~/.bash_profile`生效环境变量。运行命令`flutter --version`查看flutter是否安装成功。当现实flutter和dart的版本，即为安装成功。那么接下来就是安装编译所需要的依赖了。
（4）依赖安装。
&emsp;&emsp;flutter和dart安装完成了，那么并不能现在直接开始编写flutter应用。还需要安装一些编译相关的依赖项。执行命令`flutter doctor`可以查看还有多少依赖项是需要安装的。
```bash
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel beta, v0.9.4, on Mac OS X 10.14 18A391, locale zh-Hans-CN)
[✓] Android toolchain - develop for Android devices (Android SDK 28.0.2)
[!] iOS toolchain - develop for iOS devices (Xcode 10.1)
    ✗ CocoaPods installed but not initialized.
        CocoaPods is used to retrieve the iOS platform side's plugin code that responds to your plugin usage on the Dart side.
        Without resolving iOS dependencies with CocoaPods, plugins will not work on iOS.
        For more info, see https://flutter.io/platform-plugins
      To initialize CocoaPods, run:
        pod setup
      once to finalize CocoaPods' installation.
[✓] Android Studio (version 3.2)
[✓] IntelliJ IDEA Ultimate Edition (version 2018.2.1)
[✓] VS Code (version 1.28.2)
[!] Connected devices
    ! No devices available

! Doctor found issues in 2 categories.
```
从上面的信息可以看出，标有`!`号的说明依赖项不全，标有*`✘`*的说明依赖项需要安装而未安装，而标有`✔`的说明该依赖项正常。只需要按照提示将需要的依赖项补齐就没什么问题了。
# flutter应用
## 一、生成项目
### 1、通过Android Studio生成flutter项目
（1）选择`File -> New Flutter Project`；
（2）选择`Flutter application`作为project类型，然后点击`next`；
（3）输入项目名称，然后点击`next`；
（4）点击`Finish`；
（5）等待Android Studio安装SDK并创建项目；
（6）创建项目成功，项目代码位于`lib/main.dart`；
### 2、运行应用程序
（1）定位到Android Studio工具栏
（2）`Flutter Device Selection`选择一个设备或者虚拟设备，可以提供应用的运行环境。
（3）点击`run`图标或者执行命令`flutter run`执行编译并启动应用。
## 二、遇到的坑
### 1、安装源
&emsp;&emsp;由于一些不可抗因素，需要访问国外网站和资源，所以需要代理。或者可以手动添加国内的一些镜像，具体不赘述。
### 2、build.gradle编译错误
&emsp;&emsp;首先我是在`iPhone X`的环境下编译成功了，接着切换到`NEXUS 5X`上，结果报错了...报错了。这是个大坑啊，具体原因未知。毕竟在国外别人都能正常使用和编译，所以我猜测也可能跟第一条有相关吧。具体表现为报错`Could not find lint-gradle-api.jar`。
```bash
Launching lib/main.dart on Android SDK built for x86 in debug mode...
Initializing gradle...
Resolving dependencies...
Finished with error: Please review your Gradle project setup in the android/ folder.
* Error running Gradle:
Exit code 1 from: /Users/knorien/AndroidStudioProjects/first_flutter_app/android/gradlew app:properties:
Project evaluation failed including an error in afterEvaluate {}. Run with --stacktrace for details of the afterEvaluate {} error.

FAILURE: Build failed with an exception.

* Where:
Build file '/Users/knorien/AndroidStudioProjects/first_flutter_app/android/app/build.gradle' line: 26

* What went wrong:
A problem occurred evaluating project ':app'.
> Could not resolve all files for configuration 'classpath'.
   > Could not find lint-gradle-api.jar (com.android.tools.lint:lint-gradle-api:26.1.2).
     Searched in the following locations:
         https://jcenter.bintray.com/com/android/tools/lint/lint-gradle-api/26.1.2/lint-gradle-api-26.1.2.jar

* Try:
Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output. Run with --scan to get full insights.

* Get more help at https://help.gradle.org

BUILD FAILED in 0s
```
&emsp;&emsp;这个报错真的是让人怀疑人生啊，按着错误直接往下看就是第一行`classpath`的问题，理所当然的会认为是`classpath`的版本信息不匹配，然而并不是这样。直接看错误具体定位`Could not find lint-gradle-api.jar`，没有找到这个文件，那么就是安装源的问题咯。按照自己的理解和从网上查到的很多回答都是将安装源替换成`aliyun`的`maven`地址，可是当我替换完之后，发现并没有效果。而且我还是挂了代理之后能够正常访问国外源的情况下，这更不合理了。那么问题出在哪里呢，原因就是在flutter的`flutter.gradle`文件的配置上。
&emsp;&emsp;按照正常的思维，根本不可能想到是flutter的配置上有问题的，所以当我头发快薅没了和网上的一些提示，确实是发现了一些端倪。`vim ~/flutter/flutter/packages/flutter_tools/gradle/flutter.gradle`查看`fultter.gradle`文件，我们可以看到
```gradle
buildscript {
    repositories {
        jcenter()
        maven {
            url 'https://dl.google.com/dl/android/maven2'
        }
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.2'
    }
}
```
这个配置，是的，你没有看错。这配置咋一看貌似没有什么问题呢，我们打开`android/build.gradle`文件查看一下配置。
```gradle
buildscript {
    ext.kotlin_version = '1.2.30'
    repositories {
        google()
        jcenter()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        jcenter()
    }
}
```
差别立马出现了。就是这个`google()`，缺少了这个配置导致找不到相应的`jar`包而导致的编译报错，只要加上这行到`jcenter()`上面再次返回IDE执行编译，你就会惊喜的发现能够编译成功。  
&emsp;&emsp;而后从[简书的帖子](https://www.jianshu.com/p/2178ed233361)上证实了确实也有人存在这个问题。当然如果没有挂代理的情况下，还是需要将安装源替换成国内的镜像以免出现一些更诡异的情况。
> 至此，起步应用创建完成，也能够正常编译成功了，接下来就是跟着各路文档和教程学习接下来的东西了。
# 参考文档
Flutter官方英文原文档：https://flutter.io/docs/
Flutter中文社区文档：https://flutterchina.club/docs/
Flutter解决中国区安装源：https://github.com/flutter/flutter/wiki/Using-Flutter-in-China
新手第一大坑的解决方案：https://github.com/flutter/flutter/issues/21600