# 每日任务 - 安卓 APP 构建指南 📱

## ✅ 已完成的工作

1. ✅ Web 应用开发完成（HTML + CSS + JavaScript）
2. ✅ Capacitor 配置完成
3. ✅ 安卓项目框架生成

## 📦 获取 APK 的两种方式

### 方式 1：本地构建（推荐，需要 Android Studio）

**在你的电脑上操作：**

1. **安装 Android Studio**
   - 下载地址：https://developer.android.com/studio
   - 按照向导安装

2. **复制项目到电脑**
   ```bash
   # 从服务器下载项目
   scp -r admin@106.14.174.254:/home/admin/.openclaw/workspace/daily_task_web ~/Desktop/
   ```

3. **用 Android Studio 打开**
   - 打开 Android Studio
   - File → Open → 选择 `daily_task_web/android` 文件夹
   - 等待 Gradle 同步完成

4. **构建 APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 等待构建完成
   - APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

5. **安装到手机**
   - 将 APK 传到手机
   - 允许"未知来源"安装
   - 点击安装

---

### 方式 2：使用在线构建服务（无需安装）

**使用 Capacitor Play 或类似服务：**

1. 访问 https://capacitorjs.com/deploy
2. 上传你的 Web 项目
3. 选择 Android 平台
4. 下载生成的 APK

---

### 方式 3：使用构建脚本（需要服务器有 Android SDK）

如果服务器要构建，需要：

```bash
# 1. 安装 Java
yum install -y java-17-openjdk-headless

# 2. 下载 Android SDK
cd /opt
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-*.zip
mkdir -p android-sdk/cmdline-tools
mv cmdline-tools android-sdk/cmdline-tools/latest

# 3. 设置环境变量
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 4. 安装 SDK 组件
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# 5. 接受许可
yes | sdkmanager --licenses

# 6. 构建 APK
cd /home/admin/.openclaw/workspace/daily_task_web/android
./gradlew assembleDebug

# APK 输出位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 项目结构

```
daily_task_web/
├── www/                    # Web 资源
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── manifest.json
├── android/                # 安卓原生项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/  # Web 文件会复制到这里
│   │   │   └── java/           # 原生代码
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle.properties
├── capacitor.config.json   # Capacitor 配置
└── package.json           # Node.js 配置
```

---

## 🔧 修改应用信息

### 修改应用名称
编辑 `capacitor.config.json`:
```json
{
  "appName": "每日任务"
}
```

### 修改包名
编辑 `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.dailytask.app"
    }
}
```

### 修改应用图标
1. 准备 512x512 PNG 图标
2. 替换 `android/app/src/main/res/mipmap-*/ic_launcher.png`

---

## 📤 更新 Web 代码后

每次修改 Web 代码后，需要重新同步到安卓项目：

```bash
cd /home/admin/.openclaw/workspace/daily_task_web

# 1. 复制更新的 Web 文件到 www 目录
cp index.html styles.css app.js manifest.json www/

# 2. 同步到安卓项目
npx cap sync android

# 3. 重新构建 APK
cd android
./gradlew assembleDebug
```

---

## 🎯 快速开始（最简单方式）

**如果你有 Windows/Mac 电脑：**

1. 安装 Android Studio
2. 从服务器下载项目
3. 用 Android Studio 打开 `android` 文件夹
4. 点击 Run 按钮直接运行到手机
5. 或 Build → Build APK 生成安装包

**10 分钟内搞定！**

---

## 📞 需要帮助？

如果构建过程中遇到问题，告诉我你的：
- 操作系统（Windows/Mac/Linux）
- 是否安装了 Android Studio
- 具体错误信息

我会提供针对性的解决方案！
