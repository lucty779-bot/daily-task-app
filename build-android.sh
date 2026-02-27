#!/bin/bash
# 每日任务 - 安卓 APK 一键打包脚本

echo "🚀 开始打包每日任务安卓应用..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要安装 Node.js"
    exit 1
fi

# 检查 Java
if ! command -v java &> /dev/null; then
    echo "❌ 错误：需要安装 Java (JDK 17+)"
    exit 1
fi

# 检查 Android SDK
if [ -z "$ANDROID_HOME" ] && [ ! -d "/opt/android-sdk" ] && [ ! -d "$HOME/Android/Sdk" ]; then
    echo "❌ 错误：需要设置 ANDROID_HOME 环境变量"
    echo "请安装 Android Studio 或 Android SDK 命令行工具"
    exit 1
fi

cd "$(dirname "$0")"

# 更新 Web 文件到 www 目录
echo "📦 复制 Web 文件..."
cp index.html styles.css app.js manifest.json www/ 2>/dev/null || true

# 同步到安卓项目
echo "🔄 同步到安卓项目..."
npx cap sync android

# 检查是否需要构建
if [ ! -f "android/gradlew" ]; then
    echo "❌ 错误：安卓项目不存在"
    echo "请先运行：npx cap add android"
    exit 1
fi

# 构建 APK
echo "🔨 构建 APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

# 检查输出
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "✅ 打包成功！"
    echo "📱 APK 位置：android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "安装到手机："
    echo "1. 将 APK 文件传输到手机"
    echo "2. 在手机上打开 APK 文件"
    echo "3. 允许"未知来源"安装"
    echo "4. 点击安装"
else
    echo ""
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
