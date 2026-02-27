# 🚀 GitHub Actions 构建 APK - 详细步骤

## 第 1 步：下载项目包到你的电脑

### Windows 用户（PowerShell）：
```powershell
# 创建下载目录
mkdir C:\Users\你的用户名\Downloads\daily_task

# 下载项目包
scp admin@106.14.174.254:/home/admin/.openclaw/workspace/daily_task_android.tar.gz C:\Users\你的用户名\Downloads\daily_task\

# 解压（需要安装 7-Zip 或 WinRAR）
# 右键点击 daily_task_android.tar.gz → 解压到当前文件夹
```

### Mac 用户：
```bash
# 下载
scp admin@106.14.174.254:/home/admin/.openclaw/workspace/daily_task_android.tar.gz ~/Downloads/

# 解压
cd ~/Downloads
tar -xzf daily_task_android.tar.gz
```

### Linux 用户：
```bash
# 下载
scp admin@106.14.174.254:/home/admin/.openclaw/workspace/daily_task_android.tar.gz ~/Downloads/

# 解压
cd ~/Downloads
tar -xzf daily_task_android.tar.gz
```

---

## 第 2 步：在 GitHub 创建仓库

1. **访问 GitHub**
   - 打开 https://github.com
   - 登录你的账号（没有就注册一个）

2. **创建新仓库**
   - 点击右上角 **+** → **New repository**
   - 填写：
     - Repository name: `daily-task-app`
     - Description: `每日任务 - 安卓应用`
     - ✅ Public（公开）
     - ❌ 不要勾选 "Initialize this repository with a README"
   - 点击 **Create repository**

---

## 第 3 步：上传项目到 GitHub

### 方式 A：使用 Git 命令行（推荐）

```bash
# 进入解压后的项目目录
cd daily_task_web  # Mac/Linux
cd C:\Users\你的用户名\Downloads\daily_task\daily_task_web  # Windows

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - 每日任务应用"

# 重命名分支
git branch -M main

# 关联远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/daily-task-app.git

# 上传
git push -u origin main
```

### 方式 B：使用 GitHub Desktop（图形界面）

1. **下载 GitHub Desktop**
   - https://desktop.github.com
   - 安装并登录

2. **添加项目**
   - File → Add Local Repository
   - 选择 `daily_task_web` 文件夹
   - 点击 **Add repository**

3. **发布到 GitHub**
   - 点击 **Publish repository**
   - 确认名称为 `daily-task-app`
   - 点击 **Publish**

### 方式 C：直接上传文件（最简单）

1. 在 GitHub 仓库页面
2. 点击 **uploading an existing file**
3. 把 `daily_task_web` 文件夹里的所有文件拖进去
4. 填写 commit message：`Initial commit`
5. 点击 **Commit changes**

---

## 第 4 步：触发自动构建

1. **打开 Actions 标签**
   - 在你的 GitHub 仓库页面
   - 点击顶部的 **Actions** 标签

2. **启用工作流**
   - 如果是第一次，点击 **I understand my workflows, go ahead and enable them**

3. **运行构建**
   - 在左侧选择 **Build Android APK**
   - 点击 **Run workflow** 按钮
   - 选择 `main` 分支
   - 点击 **Run workflow**

---

## 第 5 步：等待构建完成

- 构建过程约需 **10-15 分钟**
- 可以在 Actions 页面看到实时进度
- 绿色 ✅ 表示成功
- 红色 ❌ 表示失败（查看日志找原因）

---

## 第 6 步：下载 APK

1. **找到完成的构建**
   - 在 Actions 页面
   - 点击最近的成功构建（绿色 ✅）

2. **下载附件**
   - 滚动到页面底部
   - 找到 **Artifacts** 部分
   - 点击 `daily-task-app` 下载
   - 下载后解压得到 `app-debug.apk`

---

## 第 7 步：安装到手机

1. **传输 APK 到手机**
   - 用微信/QQ 发送到手机
   - 或用数据线传输
   - 或用云盘（Google Drive/百度网盘）

2. **在手机上安装**
   - 打开文件管理器
   - 找到 `app-debug.apk`
   - 点击安装
   - 如果提示"未知来源"，允许安装
   - 完成！

---

## ⏱️ 时间估算

| 步骤 | 预计时间 |
|------|----------|
| 下载项目包 | 1-2 分钟 |
| 创建 GitHub 仓库 | 2 分钟 |
| 上传项目 | 3-5 分钟 |
| 触发构建 | 1 分钟 |
| 等待构建完成 | 10-15 分钟 |
| 下载安装 | 2 分钟 |
| **总计** | **约 20-25 分钟** |

---

## 🔧 常见问题

### Q1: Git push 失败？
**A:** 如果是私有仓库，需要配置 token：
```bash
git remote set-url origin https://你的用户名:你的TOKEN@github.com/你的用户名/daily-task-app.git
```

### Q2: Actions 没有运行？
**A:** 检查是否启用了 Actions：
- Settings → Actions → General
- 选择 "Allow all actions and reusable workflows"

### Q3: 构建失败？
**A:** 查看日志：
- 在 Actions 页面点击失败的构建
- 查看具体错误信息
- 通常是网络问题，重试即可

### Q4: APK 无法安装？
**A:** 允许未知来源：
- 设置 → 安全 → 未知来源（允许）
- 或设置 → 应用 → 特殊权限 → 安装未知应用

---

## 📞 需要帮助？

如果遇到问题，告诉我：
- 具体哪一步出错了
- 错误信息
- 截图（如果有）

我会帮你解决！🚀
