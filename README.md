# 🌌 星轨命鉴 (AstroTracks)

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English Introduction

**AstroTracks** is a premium, full-stack web application for comprehensive divination and astrology, built with **Nuxt.js** and powered by the **DeepSeek API**. It offers Horoscope Forecasts, Tarot Reading, and Bazi (生辰八字) fortune-telling in a highly interactive, responsive, and visually stunning interface.

### ✨ Key Features
- **Horoscope Forecasts**: Check today, weekly, and monthly fortune index, lucky elements, and deep star alignments for all 12 zodiac signs.
- **Tarot Readings**: Enter your question, draw 3 cards (representing Past, Present, and Future) with upright/reversed positions, and receive a professional narrative reading.
- **Bazi Astrology**: Input your birth date, time, gender, and name to calculate the Chinese Sexagenary Cycle, 5 Elements (五行) distribution, and destiny guidance.
- **API Key Control**: The application stores API keys completely inside the user's browser `localStorage`. No keys are saved on external servers, ensuring zero risk of key leakage.
- **Secure Server Proxy**: Front-end requests are proxied via Nuxt Serverless Routes (`/api/fortune`) with custom request headers, fully bypassing browser CORS restrictions.
- **Aesthetic UI**: A dark universe theme designed with a fluid glow background and elegant glassmorphism panels. Fully optimized for mobile screens.

### 🛠️ Tech Stack
- **Framework**: Nuxt.js (Nitro Server, Vite, Vue 3)
- **Icons**: Lucide Icons (`lucide-vue-next`)
- **Styling**: Vanilla CSS (CSS Variables, Backdrop blur filters, keyframe animations)
- **AI Model**: DeepSeek (`deepseek-chat`)

### ⚡ Quick Start (Local)

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000/](http://localhost:3000/) in your browser.
5. Click the gear icon on the top right to configure your DeepSeek API Key.

### ☁️ Vercel Deployment
Since the API Key is entered by the user in the UI, you don't need to configure any environment variables in Vercel!
1. Import this repository into Vercel.
2. Vercel will automatically detect Nuxt.js.
3. Click **Deploy**. Your app is live!

---

<a name="chinese"></a>
## 中文介绍

**星轨命鉴 (AstroTracks)** 是一款基于 **Nuxt.js** 全栈框架与 **DeepSeek API** 驱动的高档占卜测算综合 Web 应用。系统涵盖了星座运势、时间流塔罗牌占卜以及传统的生辰八字命理排盘批注。

### ✨ 核心特性
- **星座运势**：支持 12 星座的今日、本周、本月运势预测，包含爱情/财富/事业指数、幸运色、幸运数字及星象密语。
- **塔罗秘境**：输入所求问题，模拟洗牌并抽取代表过去、现在、未来的三张大阿卡纳牌（含正逆位），由 AI 提供深度心理疗愈及行动指南。
- **八字精密测算**：输入生辰八字信息（支持精确时辰），进行干支排盘与五行喜忌分析，批解性格、事业、感情和健康。
- **安全密钥机制**：API Key 完全由用户在前端设置并保存在浏览器本地的 `localStorage` 中，无服务器泄露密钥风险。
- **安全代理转发**：利用 Nuxt 的服务端路由 (`/api/fortune`) 代理转发 API 请求，完美解决浏览器跨域 (CORS) 限制。
- **极佳视觉美学**：采用液态深色宇宙底色与现代毛玻璃（Glassmorphism）卡片设计，且完全适配手机移动端。

### 🛠️ 技术栈
- **核心框架**：Nuxt.js (Nitro 引擎, Vite, Vue 3)
- **图标系统**：Lucide 图标库 (`lucide-vue-next`)
- **页面样式**：原生 CSS (CSS 变量, Backdrop 模糊滤镜, 物理缩放动效)
- **大模型支持**：DeepSeek 官方 API (`deepseek-chat`)

### ⚡ 本地快速启动

1. 克隆或下载本仓库代码。
2. 安装依赖包：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 用浏览器打开 [http://localhost:3000/](http://localhost:3000/)。
5. 点击右上角齿轮图标，填入您的 DeepSeek API Key 即可开始测算。

### ☁️ Vercel 极速部署
由于 API Key 采用了客户端自配的机制，您在部署到 Vercel 时**无需配置任何环境变量**，十分省心！
1. 在 Vercel 控制台导入此 GitHub 仓库。
2. Vercel 将自动识别并应用 Nuxt 预设。
3. 点击 **Deploy**。部署完成后即可直接公网访问！
