<template>
  <div class="bazi-container">
    <!-- 八字测算结果 -->
    <div v-if="result" class="result-section glass-panel">
      <div class="result-header">
        <div class="header-left">
          <Sparkles class="icon-amber" :size="20" />
          <h3>八字命理排盘</h3>
        </div>
        <button class="btn-glass" @click="reset">
          <RefreshCw :size="16" />
          重新测算
        </button>
      </div>

      <div class="result-body">
        <div class="user-meta">
          <span>测算缘主：<strong>{{ userName }}</strong></span>
          <span class="divider">|</span>
          <span>性别：<strong>{{ userGender }}</strong></span>
        </div>

        <!-- 八字排盘展示 -->
        <div class="bazi-disk glass-panel">
          <div class="disk-title">乾坤命盘</div>
          <div class="bazi-text">{{ result.bazi }}</div>
        </div>

        <!-- 五行解析 -->
        <div class="wuxing-card glass-panel">
          <h4>五行喜忌分析</h4>
          <p class="wuxing-value">{{ result.wuxing }}</p>
        </div>

        <!-- 详细批示网格 -->
        <div class="bazi-details-grid">
          <div class="detail-block">
            <div class="block-title font-gold">
              <span>☯</span> 性格特质
            </div>
            <p>{{ result.personality }}</p>
          </div>

          <div class="detail-block">
            <div class="block-title font-gold">
              <span>💼</span> 事业学业
            </div>
            <p>{{ result.career }}</p>
          </div>

          <div class="detail-block">
            <div class="block-title font-gold">
              <span>❤️</span> 婚恋感情
            </div>
            <p>{{ result.love }}</p>
          </div>

          <div class="detail-block">
            <div class="block-title font-gold">
              <span>☘</span> 健康运势
            </div>
            <p>{{ result.health }}</p>
          </div>
        </div>

        <!-- 开运建议 -->
        <div class="advice-card">
          <span class="advice-tag">开运寄语</span>
          <p class="advice-content">{{ result.advice }}</p>
        </div>
      </div>
    </div>

    <!-- 加载中 (太极八卦旋转) -->
    <div v-else-if="loading" class="loading-section glass-panel">
      <div class="yin-yang-container">
        <div class="yin-yang-icon">☯</div>
      </div>
      <p class="loading-text">正在根据天干地支排盘，测算八字运势...</p>
      <span class="loading-sub">命理罗盘正在为您推演乾坤五行之变</span>
    </div>

    <!-- 输入表单 -->
    <div v-else class="setup-section">
      <div class="section-title">
        <h2>生辰八字精密测算</h2>
        <p>输入您的生辰信息，推算天干地支五行，解析一生财运、姻缘与事业</p>
      </div>

      <div class="form-card glass-panel">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">您的姓名</label>
            <input 
              type="text" 
              id="name"
              v-model="userName"
              placeholder="请输入您的姓名"
              class="input-glass"
            />
          </div>

          <div class="form-group">
            <label>性别</label>
            <div class="gender-radio-group">
              <button 
                type="button"
                class="gender-btn"
                :class="{ active: userGender === '男' }"
                @click="userGender = '男'"
              >
                乾造 (男)
              </button>
              <button 
                type="button"
                class="gender-btn"
                :class="{ active: userGender === '女' }"
                @click="userGender = '女'"
              >
                坤造 (女)
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="birth-date">出生日期 (公历)</label>
            <input 
              type="date" 
              id="birth-date"
              v-model="birthDate"
              class="input-glass"
            />
          </div>

          <div class="form-group">
            <label for="birth-hour">出生时辰</label>
            <select id="birth-hour" v-model="birthHour" class="input-glass select-dark">
              <option v-for="hour in hoursList" :key="hour.value" :value="hour.value">
                {{ hour.label }}
              </option>
            </select>
          </div>
        </div>

        <button 
          class="btn-gradient btn-submit"
          :disabled="!isFormValid"
          @click="getBaziForecast"
        >
          <Compass :size="20" />
          排出命盘，测算乾坤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Sparkles, RefreshCw, Compass } from 'lucide-vue-next'

const props = defineProps({
  hasApiKey: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['requestSettings'])

const userName = ref('')
const userGender = ref('男')
const birthDate = ref('')
const birthHour = ref('子时 (23:00-01:00)')
const loading = ref(false)
const result = ref(null)

const hoursList = [
  { label: '子时 (23:00-01:00)', value: '子时 (23:00-01:00)' },
  { label: '丑时 (01:00-03:00)', value: '丑时 (01:00-03:00)' },
  { label: '寅时 (03:00-05:00)', value: '寅时 (03:00-05:00)' },
  { label: '卯时 (05:00-07:00)', value: '卯时 (05:00-07:00)' },
  { label: '辰时 (07:00-09:00)', value: '辰时 (07:00-09:00)' },
  { label: '巳时 (09:00-11:00)', value: '巳时 (09:00-11:00)' },
  { label: '午时 (11:00-13:00)', value: '午时 (11:00-13:00)' },
  { label: '未时 (13:00-15:00)', value: '未时 (13:00-15:00)' },
  { label: '申时 (15:00-17:00)', value: '申时 (15:00-17:00)' },
  { label: '酉时 (17:00-19:00)', value: '酉时 (17:00-19:00)' },
  { label: '戌时 (19:00-21:00)', value: '戌时 (19:00-21:00)' },
  { label: '亥时 (21:00-23:00)', value: '亥时 (21:00-23:00)' }
]

const isFormValid = computed(() => {
  return userName.value.trim() && birthDate.value
})

const getBaziForecast = async () => {
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
        type: 'bazi',
        params: {
          name: userName.value.trim(),
          gender: userGender.value,
          birthDate: birthDate.value,
          birthHour: birthHour.value
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
.bazi-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 1.35rem;
  color: #f1f5f9;
  letter-spacing: 1px;
  font-weight: 500;
  margin-bottom: 6px;
}

.section-title p {
  color: #64748b;
  font-size: 0.9rem;
}

.form-card {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 8px;
}

/* 性别按钮组 */
.gender-radio-group {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #cbd5e1;
  padding: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.gender-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.gender-btn.active {
  background: rgba(197, 168, 128, 0.05);
  border-color: rgba(197, 168, 128, 0.35);
  color: #c5a880;
}

.select-dark {
  background-color: #0d0d21;
}

.select-dark option {
  background-color: #0d0d21;
  color: white;
}

.btn-submit {
  width: 100%;
}

/* 太极旋转加载 */
.loading-section {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.yin-yang-container {
  font-size: 4.5rem;
  line-height: 1;
  margin-bottom: 24px;
  animation: yinYangSpin 3s linear infinite, yinYangGlow 2s ease-in-out infinite;
  color: #c5a880;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(15, 15, 35, 0.7);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.icon-amber {
  color: #f59e0b;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #94a3b8;
  margin-bottom: 16px;
}

.user-meta strong {
  color: white;
}

.divider {
  color: rgba(255, 255, 255, 0.1);
}

/* 命盘 */
.bazi-disk {
  padding: 20px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.disk-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #cbd5e1;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.bazi-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

/* 五行 */
.wuxing-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  margin-bottom: 24px;
}

.wuxing-card h4 {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.wuxing-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #cbd5e1;
}

/* 详细批示 */
.bazi-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-block {
  padding: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.block-title span {
  font-size: 1.1rem;
}

.detail-block p {
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.font-gold { color: #c5a880; }

/* 开运建议 */
.advice-card {
  padding: 16px 20px;
  background: rgba(197, 168, 128, 0.05);
  border: 1px solid rgba(197, 168, 128, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.advice-tag {
  background: #c5a880;
  color: #050508;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.advice-content {
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 500;
  line-height: 1.4;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .bazi-details-grid {
    grid-template-columns: 1fr;
  }
  .advice-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@keyframes yinYangSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes yinYangGlow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(197, 168, 128, 0.3)); }
  50% { filter: drop-shadow(0 0 14px rgba(197, 168, 128, 0.7)); }
}
</style>
