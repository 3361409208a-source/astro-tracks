<template>
  <div class="app-layout">
    <!-- 动态繁星背景 (增强星空神秘美感) -->
    <div class="stars-bg">
      <div 
        v-for="star in starDots" 
        :key="star.id" 
        class="star-dot" 
        :style="star.style"
      ></div>
    </div>

    <!-- 背景极光微光装饰 -->
    <div class="decor-glow glow-1"></div>
    <div class="decor-glow glow-2"></div>

    <!-- 顶部导航栏 -->
    <header class="app-header glass-panel">
      <div class="logo-area">
        <Compass class="logo-icon" :size="28" />
        <h1>星轨命鉴</h1>
        <span class="version-badge">MVP</span>
      </div>

      <div class="nav-actions">
        <!-- 未配置密钥时的醒目警告 -->
        <span v-if="!hasApiKey" class="warning-pill" @click="isSettingsOpen = true">
          <AlertTriangle :size="14" />
          未配置 API 密钥
        </span>
        <span v-else class="success-pill">
          <ShieldCheck :size="14" />
          API 已就绪
        </span>

        <button class="btn-settings" @click="isSettingsOpen = true">
          <Settings :size="20" />
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="app-main">
      <!-- 引导语 -->
      <div class="welcome-banner">
        <h2>探寻命运之轨，解析未来玄机</h2>
        <p>基于先进的 DeepSeek AI 大模型，为您提供严谨、灵性、深度的星宿、牌意与命理批示。</p>
      </div>

      <!-- Tab 切换按钮组 -->
      <div class="tab-selector glass-panel">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          class="tab-btn"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <component :is="tab.icon" :size="18" />
          {{ tab.label }}
        </button>
      </div>

      <!-- 密钥未配置时的中间大卡片提示 -->
      <div v-if="!hasApiKey" class="key-banner glass-panel">
        <Key class="banner-icon" :size="36" />
        <h3>配置您的 DeepSeek API 密钥</h3>
        <p>
          本系统使用您个人的大模型密钥来请求测算服务。我们不留存任何密钥，所有数据仅存储在您的浏览器本地。
        </p>
        <button class="btn-gradient btn-configure-now" @click="isSettingsOpen = true">
          <Settings :size="16" />
          立即配置 API Key
        </button>
      </div>

      <!-- 核心组件工作区 -->
      <div v-else class="workspace-area">
        <Transition name="fade" mode="out-in">
          <KeepAlive>
            <component 
              :is="currentTabComponent" 
              :has-api-key="hasApiKey"
              @request-settings="isSettingsOpen = true"
            />
          </KeepAlive>
        </Transition>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>© 2026 星轨命鉴. 仅供娱乐与心理学探索参考.</p>
    </footer>

    <!-- 密钥设置弹窗 -->
    <ApiKeyModal 
      :is-open="isSettingsOpen" 
      @close="isSettingsOpen = false"
      @saved="onConfigSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue'
import { 
  Compass, Settings, Star, Sparkles, AlertTriangle, ShieldCheck, Key 
} from 'lucide-vue-next'

import Horoscope from './components/Horoscope.vue'
import Tarot from './components/Tarot.vue'
import Bazi from './components/Bazi.vue'
import ApiKeyModal from './components/ApiKeyModal.vue'

const isSettingsOpen = ref(false)
const hasApiKey = ref(false)
const currentTab = ref('horoscope')
const starDots = ref([])

const tabs = [
  { label: '星座运势', value: 'horoscope', icon: Star },
  { label: '塔罗密境', value: 'tarot', icon: Sparkles },
  { label: '生辰八字', value: 'bazi', icon: Compass }
]

// 动态组件映射
const componentsMap = {
  horoscope: Horoscope,
  tarot: Tarot,
  bazi: Bazi
}

const currentTabComponent = computed(() => {
  return componentsMap[currentTab.value]
})

// 检查 localStorage 密钥
const checkApiKey = () => {
  if (process.client) {
    const key = localStorage.getItem('api_key')
    hasApiKey.value = !!(key && key.trim())
  }
}

onMounted(() => {
  checkApiKey()
  
  // 生成 35 颗带有随机位置和时间周期的闪烁繁星
  starDots.value = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2.5 + Math.random() * 3}s`
    }
  }))

  if (!hasApiKey.value) {
    setTimeout(() => {
      isSettingsOpen.value = true
    }, 800)
  }
})

const onConfigSaved = () => {
  checkApiKey()
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* 繁星定位背景 */
.stars-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

:deep(.star-dot) {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle infinite ease-in-out;
}

/* 背景极光微光 */
.decor-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  z-index: -2;
  pointer-events: none;
  opacity: 0.15;
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #0891b2 0%, transparent 70%);
  top: -100px;
  right: -50px;
}

.glow-2 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, #0284c7 0%, transparent 70%);
  bottom: -150px;
  left: -100px;
}

/* 顶部导航 */
.app-header {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(10, 25, 47, 0.25);
  border: 1px solid rgba(56, 189, 248, 0.08);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #38bdf8;
  animation: logoSpin 25s linear infinite;
}

.logo-area h1 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 1px;
}

.version-badge {
  font-size: 0.65rem;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  padding: 1px 6px;
  border-radius: 4px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-pill {
  font-size: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.warning-pill:hover {
  background: rgba(239, 68, 68, 0.2);
}

.success-pill {
  font-size: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-settings {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(56, 189, 248, 0.12);
  color: #94a3b8;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-settings:hover {
  background: rgba(56, 189, 248, 0.1);
  color: #f8fafc;
  transform: rotate(45deg);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

/* 主体容器 */
.app-main {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-banner {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-banner h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-banner p {
  font-size: 0.95rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Tab 切换栏 */
.tab-selector {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 36px;
  display: flex;
  padding: 6px;
  background: rgba(10, 25, 47, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.06);
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-btn:hover {
  color: #38bdf8;
}

.tab-btn.active {
  background: rgba(56, 189, 248, 0.08);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.15);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.05);
}

/* 密钥提醒 Banner */
.key-banner {
  max-width: 500px;
  width: 100%;
  margin: 40px auto;
  padding: 32px;
  text-align: center;
}

.banner-icon {
  color: #38bdf8;
  margin-bottom: 16px;
  animation: logoPulse 2s ease-in-out infinite;
}

.key-banner h3 {
  font-size: 1.2rem;
  color: white;
  margin-bottom: 10px;
}

.key-banner p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;
}

.btn-configure-now {
  padding: 10px 20px;
}

.workspace-area {
  flex: 1;
  width: 100%;
}

/* 页脚 */
.app-footer {
  text-align: center;
  padding: 40px 0 12px;
  font-size: 0.8rem;
  color: #334155;
}

/* 旋转与呼吸动效 */
@keyframes logoSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3)); }
}

@media (max-width: 640px) {
  .app-layout {
    padding: 16px;
  }
  .app-header {
    padding: 12px 16px;
  }
  .welcome-banner h2 {
    font-size: 1.4rem;
  }
}
</style>
