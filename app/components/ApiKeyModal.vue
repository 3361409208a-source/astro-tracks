<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <div class="header-title">
            <Key class="icon-gold" :size="22" />
            <h2>密钥配置</h2>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <!-- 内置密钥状态提示 -->
          <div v-if="hasBuiltinKey" class="builtin-notice">
            <div class="notice-icon">
              <ShieldCheck :size="18" />
            </div>
            <div class="notice-text">
              <strong>服务已内置密钥</strong>
              <span>您可直接使用，无需配置。下方为可选覆盖项。</span>
            </div>
          </div>
          <div v-else class="builtin-notice notice-warn">
            <div class="notice-icon">
              <AlertTriangle :size="18" />
            </div>
            <div class="notice-text">
              <strong>需要您的专属密钥</strong>
              <span>请填写您的 API Key 以启用测算服务。</span>
            </div>
          </div>

          <div class="form-group">
            <label>
              API Key
              <span v-if="!hasBuiltinKey" class="required">*</span>
              <span v-else class="optional">可选 · 填写后将覆盖内置密钥</span>
            </label>
            <div class="input-wrapper">
              <input
                :type="showKey ? 'text' : 'password'"
                v-model="config.apiKey"
                :placeholder="hasBuiltinKey ? '留空则使用服务内置密钥' : 'sk-...'"
                class="input-glass"
              />
              <button class="btn-toggle-eye" @click="showKey = !showKey">
                <Eye v-if="!showKey" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
          </div>

          <template v-if="config.apiKey">
            <div class="form-group">
              <label>API Base URL</label>
              <input
                type="text"
                v-model="config.apiBaseUrl"
                placeholder="https://api.domain.com"
                class="input-glass"
              />
            </div>

            <div class="form-group">
              <label>Model Name</label>
              <input
                type="text"
                v-model="config.apiModel"
                placeholder="model-name"
                class="input-glass"
              />
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn-glass" @click="clearConfig">清除配置</button>
          <button class="btn-gradient" @click="saveConfig">
            <Check :size="18" />
            保存
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Key, X, Eye, EyeOff, Check, ShieldCheck, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  hasBuiltinKey: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const showKey = ref(false)
const config = ref({
  apiKey: '',
  apiBaseUrl: 'https://api.deepseek.com',
  apiModel: 'deepseek-chat'
})

const loadConfig = () => {
  if (process.client) {
    config.value.apiKey = localStorage.getItem('api_key') || ''
    config.value.apiBaseUrl = localStorage.getItem('api_base_url') || 'https://api.deepseek.com'
    config.value.apiModel = localStorage.getItem('api_model') || 'deepseek-chat'
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) loadConfig()
})

onMounted(() => {
  loadConfig()
})

const saveConfig = () => {
  // 没有内置密钥时，用户 key 必填
  if (!props.hasBuiltinKey && !config.value.apiKey.trim()) {
    alert('请输入您的 API Key！')
    return
  }

  if (config.value.apiKey.trim()) {
    localStorage.setItem('api_key', config.value.apiKey.trim())
    localStorage.setItem('api_base_url', config.value.apiBaseUrl.trim() || 'https://api.deepseek.com')
    localStorage.setItem('api_model', config.value.apiModel.trim() || 'deepseek-chat')
  }

  emit('saved', { ...config.value })
  emit('close')
}

const clearConfig = () => {
  if (confirm('确认清除本地保存的自定义 API 配置？')) {
    localStorage.removeItem('api_key')
    localStorage.removeItem('api_base_url')
    localStorage.removeItem('api_model')

    config.value = {
      apiKey: '',
      apiBaseUrl: 'https://api.deepseek.com',
      apiModel: 'deepseek-chat'
    }

    emit('saved', { ...config.value })
    emit('close')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(4, 4, 12, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 460px;
  background: rgba(12, 12, 22, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-gold { color: #c5a880; }

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.btn-close {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.modal-body {
  padding: 18px 20px;
}

/* 内置密钥状态提示 */
.builtin-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.15);
}

.builtin-notice .notice-icon {
  color: #4ade80;
  flex-shrink: 0;
  padding-top: 1px;
}

.notice-warn {
  background: rgba(251, 191, 36, 0.06);
  border-color: rgba(251, 191, 36, 0.18);
}

.notice-warn .notice-icon {
  color: #fbbf24;
}

.notice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notice-text strong {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f1f5f9;
}

.notice-text span {
  font-size: 0.78rem;
  color: #64748b;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.required { color: #ef4444; }

.optional {
  font-weight: 400;
  color: #475569;
  font-size: 0.75rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-toggle-eye {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}
.btn-toggle-eye:hover { color: #cbd5e1; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(4, 4, 12, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
