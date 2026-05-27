<template>
  <div class="app-layout">
    <!-- 动态场景背景图层 -->
    <Transition name="bg-fade">
      <div
        :key="currentTab"
        class="scene-bg"
        :style="{ backgroundImage: `url(${currentBg})` }"
      />
    </Transition>
    <!-- 黑色渐变覆盖层 -->
    <div class="scene-overlay" />
    <!-- 顶部导航栏 -->
    <header class="app-header glass-panel">
      <div class="logo-area">
        <Compass class="logo-icon" :size="24" />
        <h1>星轨命鉴</h1>
        <span class="version-badge">MVP</span>
      </div>

      <div class="nav-actions">
        <!-- 服务状态指示 -->
        <span v-if="hasBuiltinKey" class="success-pill">
          <ShieldCheck :size="13" />
          服务就绪
        </span>
        <span v-else-if="!hasApiKey" class="warning-pill" @click="isSettingsOpen = true">
          <AlertTriangle :size="13" />
          需要配置密钥
        </span>
        <span v-else class="success-pill">
          <ShieldCheck :size="13" />
          自定义密钥
        </span>

        <button class="btn-settings" @click="isSettingsOpen = true">
          <Settings :size="18" />
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="app-main">
      <!-- 引导语 (简约留白) -->
      <div class="welcome-banner">
        <h2>探寻命运之轨 · 解析未来玄机</h2>
        <p>基于精密星轨与古典命理推演，为您提供严谨、理性的星宿、牌意与命理批示。</p>
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
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </div>

      <!-- 密钥未配置时的简约大卡片提示（没有内置密钥且用户也没设置时才显示） -->
      <div v-if="!hasBuiltinKey && !hasApiKey" class="key-banner glass-panel">
        <Key class="banner-icon" :size="28" />
        <h3>配置您的测算 API 密钥</h3>
        <p>
          请点击右上角设置按钮配置您的专属大模型 API Key，密钥仅保存在您本机浏览器中。
        </p>
        <button class="btn-gradient btn-configure-now" @click="isSettingsOpen = true">
          <Settings :size="14" />
          配置密钥
        </button>
      </div>

      <!-- 核心组件工作区：内置密钥或用户已配置时显示 -->
      <div v-else class="workspace-area">
        <Transition name="fade" mode="out-in">
          <KeepAlive>
            <component 
              :is="currentTabComponent" 
              :has-api-key="hasBuiltinKey || hasApiKey"
              @request-settings="isSettingsOpen = true"
            />
          </KeepAlive>
        </Transition>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>© 2026 星轨命鉴. 仅供心理探索参考.</p>
    </footer>

    <!-- 密钥设置弹窗 -->
    <ApiKeyModal 
      :is-open="isSettingsOpen"
      :has-builtin-key="hasBuiltinKey"
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
const hasBuiltinKey = ref(false)
const currentTab = ref('horoscope')

const bgMap = {
  horoscope: '/bg/horoscope.png',
  tarot: '/bg/tarot.png',
  bazi: '/bg/bazi.png'
}

const currentBg = computed(() => bgMap[currentTab.value])

const tabs = [
  { label: '星座运势', value: 'horoscope', icon: Star },
  { label: '塔罗占卜', value: 'tarot', icon: Sparkles },
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

onMounted(async () => {
  checkApiKey()

  // 向服务端确认是否有内置密钥（只返回布尔值，密钥本身永不暴露）
  try {
    const res = await $fetch('/api/check-key')
    hasBuiltinKey.value = res?.hasBuiltinKey ?? false
  } catch {
    hasBuiltinKey.value = false
  }

  // 如果既无内置密钥也无用户配置，延迟弹出设置
  if (!hasBuiltinKey.value && !hasApiKey.value) {
    setTimeout(() => {
      isSettingsOpen.value = true
    }, 600)
  }
})

const onConfigSaved = () => {
  checkApiKey()
}
</script>

<style scoped>
/* ── 场景背景图层 ── */
.scene-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: opacity;
}

.scene-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(4, 4, 10, 0.72) 0%,
    rgba(4, 4, 10, 0.55) 40%,
    rgba(4, 4, 10, 0.80) 100%
  );
  pointer-events: none;
}

/* 背景切换过渡 */
.bg-fade-enter-active {
  transition: opacity 0.9s ease;
}
.bg-fade-leave-active {
  transition: opacity 0.6s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* 顶部导航 */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: rgba(10, 10, 15, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  margin-bottom: 48px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  color: #c5a880;
}

.logo-area h1 {
  font-size: 1.15rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: 1px;
}

.version-badge {
  font-size: 0.6rem;
  background: rgba(197, 168, 128, 0.08);
  border: 1px solid rgba(197, 168, 128, 0.15);
  color: #c5a880;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 500;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-pill {
  font-size: 0.7rem;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  padding: 3px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.success-pill {
  font-size: 0.7rem;
  background: transparent;
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
  padding: 3px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-settings {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #64748b;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-settings:hover {
  border-color: #c5a880;
  color: #c5a880;
}

/* 主体容器 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-banner {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-banner h2 {
  font-size: 1.45rem;
  font-weight: 500;
  color: #f1f5f9;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.welcome-banner p {
  font-size: 0.85rem;
  color: #64748b;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Tab 切换栏 */
.tab-selector {
  width: 100%;
  max-width: 520px;
  margin: 0 auto 40px;
  display: flex;
  padding: 4px;
  background: rgba(8, 8, 12, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #64748b;
  padding: 10px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #cbd5e1;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.02);
  color: #c5a880;
  border: 1px solid rgba(197, 168, 128, 0.15);
}

/* 密钥提醒 Banner */
.key-banner {
  max-width: 440px;
  width: 100%;
  margin: 40px auto;
  padding: 28px;
  text-align: center;
}

.banner-icon {
  color: #c5a880;
  margin-bottom: 12px;
}

.key-banner h3 {
  font-size: 1.05rem;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.key-banner p {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 20px;
}

.btn-configure-now {
  padding: 8px 18px;
}

.workspace-area {
  flex: 1;
  width: 100%;
}

/* 页脚 */
.app-footer {
  text-align: center;
  padding: 40px 0 12px;
  font-size: 0.75rem;
  color: #334155;
}

@media (max-width: 640px) {
  .app-layout {
    padding: 20px 16px;
  }
  .app-header {
    padding: 10px 16px;
    margin-bottom: 32px;
  }
  .welcome-banner h2 {
    font-size: 1.2rem;
  }
}
</style>
