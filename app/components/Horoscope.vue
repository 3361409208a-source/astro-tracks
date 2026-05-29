<template>
  <div class="horoscope-container">
    <!-- 运势结果展示 -->
    <div v-if="result" class="result-section glass-panel">
      <div class="result-header">
        <div class="sign-badge">
          <span class="sign-symbol">{{ getSignSymbol(selectedSign) }}</span>
          <div>
            <h3>{{ selectedSign }}</h3>
            <span class="period-tag">{{ periodText }}运势</span>
          </div>
        </div>
        <button class="btn-glass" @click="reset">
          <RefreshCw :size="16" />
          重新选择
        </button>
      </div>

      <div class="result-body">
        <p class="summary-text">“ {{ result.summary }} ”</p>

        <!-- 指数评分条 -->
        <div class="indexes-grid">
          <div class="index-item">
            <span class="index-label">爱情指数</span>
            <div class="stars">
              <Star 
                v-for="i in 5" 
                :key="i" 
                :size="16" 
                :class="i <= result.loveIndex ? 'star-filled' : 'star-empty'"
              />
            </div>
          </div>
          <div class="index-item">
            <span class="index-label">学业事业</span>
            <div class="stars">
              <Star 
                v-for="i in 5" 
                :key="i" 
                :size="16" 
                :class="i <= result.workIndex ? 'star-filled' : 'star-empty'"
              />
            </div>
          </div>
          <div class="index-item">
            <span class="index-label">财富指数</span>
            <div class="stars">
              <Star 
                v-for="i in 5" 
                :key="i" 
                :size="16" 
                :class="i <= result.moneyIndex ? 'star-filled' : 'star-empty'"
              />
            </div>
          </div>
        </div>

        <!-- 幸运要素 -->
        <div class="lucky-grid">
          <div class="lucky-card">
            <Sparkles class="lucky-icon gold" :size="18" />
            <div>
              <span class="lucky-title">幸运颜色</span>
              <span class="lucky-value">{{ result.luckyColor }}</span>
            </div>
          </div>
          <div class="lucky-card">
            <Hash class="lucky-icon gold" :size="18" />
            <div>
              <span class="lucky-title">幸运数字</span>
              <span class="lucky-value">{{ result.luckyNumber }}</span>
            </div>
          </div>
        </div>

        <!-- 详细分析 -->
        <div class="details-card">
          <h4>星象密语</h4>
          <p>{{ result.details }}</p>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-section glass-panel">
      <div class="orbit-container">
        <div class="orbit-circle"></div>
        <Sparkles class="loading-icon-animate" :size="32" />
      </div>
      <p class="loading-text">正在勾勒星轨，解析 {{ selectedSign }} 的{{ periodText }}运势...</p>
      <span class="loading-sub">星轨罗盘正在为您连通星际能量</span>
    </div>

    <!-- 选择星座和维度 -->
    <div v-else class="selection-section">
      <div class="section-title">
        <h2>选择您的星座</h2>
        <p>勾连星轨，获取您专属的今日、本周或本月星象指引</p>
      </div>

      <!-- 星座网格 -->
      <div class="signs-grid">
        <div 
          v-for="sign in signs" 
          :key="sign.name"
          class="sign-card glass-panel"
          :class="{ active: selectedSign === sign.name }"
          @click="selectedSign = sign.name"
        >
          <img :src="sign.image" :alt="sign.name" class="sign-icon" />
          <span class="sign-name">{{ sign.name }}</span>
          <span class="sign-date">{{ sign.date }}</span>
        </div>
      </div>

      <!-- 选项控制栏 -->
      <div class="control-panel glass-panel">
        <div class="period-selector">
          <button 
            v-for="p in periods" 
            :key="p.value"
            class="period-btn"
            :class="{ active: selectedPeriod === p.value }"
            @click="selectedPeriod = p.value"
          >
            {{ p.label }}
          </button>
        </div>

        <button 
          class="btn-gradient btn-predict"
          :disabled="!selectedSign"
          @click="getHoroscope"
        >
          <Compass :size="20" />
          窥测天机
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Sparkles, Hash, Star, RefreshCw, Compass } from 'lucide-vue-next'

const props = defineProps({
  hasApiKey: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['requestSettings'])

const loading = ref(false)
const result = ref(null)
const selectedSign = ref('')
const selectedPeriod = ref('today')

const periods = [
  { label: '今日运势', value: 'today' },
  { label: '本周运势', value: 'week' },
  { label: '本月运势', value: 'month' }
]

const periodText = computed(() => {
  const item = periods.find(p => p.value === selectedPeriod.value)
  return item ? item.label.slice(0, 2) : '今日'
})

const signs = [
  { name: '白羊座', symbol: '♈', date: '3.21-4.19', image: '/bg/images/images/未标题-1_01.png' },
  { name: '金牛座', symbol: '♉', date: '4.20-5.20', image: '/bg/images/images/未标题-1_02.png' },
  { name: '双子座', symbol: '♊', date: '5.21-6.21', image: '/bg/images/images/未标题-1_03.png' },
  { name: '巨蟹座', symbol: '♋', date: '6.22-7.22', image: '/bg/images/images/未标题-1_04.png' },
  { name: '狮子座', symbol: '♌', date: '7.23-8.22', image: '/bg/images/images/未标题-1_05.png' },
  { name: '处女座', symbol: '♍', date: '8.23-9.22', image: '/bg/images/images/未标题-1_06.png' },
  { name: '天秤座', symbol: '♎', date: '9.23-10.23', image: '/bg/images/images/未标题-1_07.png' },
  { name: '天蝎座', symbol: '♏', date: '10.24-11.22', image: '/bg/images/images/未标题-1_08.png' },
  { name: '射手座', symbol: '♐', date: '11.23-12.21', image: '/bg/images/images/未标题-1_09.png' },
  { name: '摩羯座', symbol: '♑', date: '12.22-1.19', image: '/bg/images/images/未标题-1_10.png' },
  { name: '水瓶座', symbol: '♒', date: '1.20-2.18', image: '/bg/images/images/未标题-1_11.png' },
  { name: '双鱼座', symbol: '♓', date: '2.19-3.20', image: '/bg/images/images/未标题-1_12.png' }
]

const getSignSymbol = (name) => {
  const item = signs.find(s => s.name === name)
  return item ? item.symbol : '✨'
}

const getHoroscope = async () => {
  if (!props.hasApiKey) {
    emit('requestSettings')
    return
  }

  loading.value = true
  result.value = null

  try {
    const key = localStorage.getItem('api_key') || ''
    const baseUrl = localStorage.getItem('api_base_url') || 'https://api.deepseek.com'
    const model = localStorage.getItem('api_model') || 'deepseek-chat'

    const response = await $fetch('/api/fortune', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'x-api-base-url': baseUrl,
        'x-api-model': model
      },
      body: {
        type: 'horoscope',
        params: {
          name: selectedSign.value,
          period: selectedPeriod.value
        }
      }
    })

    if (response && response.success) {
      result.value = response.data
    } else {
      throw new Error('解析数据失败')
    }
  } catch (error) {
    console.error(error)
    alert(error.message || '测算失败，请检查 API 配置。')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  result.value = null
}
</script>

<style scoped>
.horoscope-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 12px;
}

.section-title h2 {
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: 1px;
  font-weight: 500;
  margin-bottom: 4px;
}

.section-title p {
  color: #ffffff;
  font-size: 0.8rem;
}

/* 星座网格 */
.signs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.sign-card {
  padding: 12px 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: center;
  min-height: 120px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sign-card.active {
  background: rgba(197, 168, 128, 0.05);
  border-color: rgba(197, 168, 128, 0.3);
  box-shadow: 0 0 15px rgba(197, 168, 128, 0.1);
}

.sign-icon {
  display: block;
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin: 0 auto;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.sign-card.active .sign-icon {
  filter: drop-shadow(0 0 8px rgba(197, 168, 128, 0.5));
}

.sign-card:hover .sign-icon {
  transform: translateY(-3px) scale(1.08);
}

.sign-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.85rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  width: 100%;
  text-align: center;
  margin-top: 6px;
}

.sign-date {
  font-size: 0.65rem;
  color: #94a3b8;
  width: 100%;
  text-align: center;
  margin-bottom: 6px;
}

/* 控制栏 */
.control-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
}

.period-selector {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 10px;
}

.period-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn.active {
  background: rgba(255, 255, 255, 0.02);
  color: #c5a880;
  border: 1px solid rgba(197, 168, 128, 0.15);
}

.btn-predict {
  padding: 10px 24px;
  border-radius: 10px;
}

/* 加载动画 */
.loading-section {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.orbit-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.orbit-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1.5px dashed rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  animation: spin 15s linear infinite;
}

.loading-icon-animate {
  color: #c5a880;
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 6px;
}

.loading-sub {
  font-size: 0.8rem;
  color: #64748b;
}

/* 结果渲染 */
.result-section {
  padding: 24px;
  background: rgba(10, 25, 47, 0.25);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.sign-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sign-symbol {
  font-size: 2.2rem;
  line-height: 1;
  color: #c5a880;
}

.sign-badge h3 {
  font-size: 1.2rem;
  color: white;
}

.period-tag {
  font-size: 0.75rem;
  background: rgba(197, 168, 128, 0.08);
  color: #c5a880;
  border: 1px solid rgba(197, 168, 128, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 2px;
  display: inline-block;
}

.summary-text {
  font-size: 1.15rem;
  font-weight: 500;
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 24px;
  font-style: italic;
}

.indexes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.index-item {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.index-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  gap: 4px;
}

.star-filled {
  color: #c5a880;
  fill: #c5a880;
  filter: drop-shadow(0 0 3px rgba(197, 168, 128, 0.3));
}

.star-empty {
  color: rgba(255, 255, 255, 0.15);
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.lucky-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.lucky-icon {
  padding: 6px;
  border-radius: 8px;
}

.lucky-icon.gold {
  color: #c5a880;
  background: rgba(197, 168, 128, 0.08);
}

.lucky-title {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}

.lucky-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
}

.details-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.details-card h4 {
  font-size: 0.95rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
  border-left: 2px solid #c5a880;
  padding-left: 8px;
}

.details-card p {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.7;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .signs-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .sign-card {
    min-height: 100px;
    padding: 10px 6px 0;
  }
  .sign-icon {
    width: 48px;
    height: 48px;
  }
  .control-panel {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 10px 12px;
  }
  .period-selector {
    justify-content: center;
  }
  .indexes-grid {
    grid-template-columns: 1fr;
  }
  .result-section {
    padding: 16px;
  }
}

/* iPhone 13 mini / 375px 小屏适配 */
@media (max-width: 480px) {
  .section-title h2 {
    font-size: 1rem;
  }
  .section-title p {
    font-size: 0.75rem;
  }
  .signs-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
  .sign-card {
    min-height: 88px;
    padding: 8px 4px 0;
    border-radius: 8px;
  }
  .sign-icon {
    width: 40px;
    height: 40px;
  }
  .sign-name {
    font-size: 0.8rem;
    margin-top: 4px;
  }
  .sign-date {
    font-size: 0.6rem;
    margin-bottom: 4px;
  }
  .control-panel {
    gap: 12px;
    padding: 10px;
  }
  .period-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    border-radius: 6px;
  }
  .btn-predict {
    width: 100%;
    padding: 10px 16px;
  }
  .result-header {
    flex-wrap: wrap;
    gap: 10px;
  }
  .sign-symbol {
    font-size: 1.8rem;
  }
  .sign-badge h3 {
    font-size: 1.05rem;
  }
  .summary-text {
    font-size: 1rem;
    margin-bottom: 16px;
  }
  .indexes-grid {
    gap: 10px;
    margin-bottom: 16px;
  }
  .index-item {
    padding: 10px;
    border-radius: 10px;
  }
  .lucky-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  .lucky-card {
    padding: 12px;
  }
  .details-card {
    padding: 14px;
  }
  .details-card h4 {
    font-size: 0.9rem;
  }
  .details-card p {
    font-size: 0.85rem;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
</style>
