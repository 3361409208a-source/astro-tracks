<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <div class="header-title">
            <Key class="icon-purple" :size="22" />
            <h2>API 密钥配置</h2>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">
            请配置您的 <strong>DeepSeek API</strong> 信息。数据将完全保存在您的本地浏览器中（LocalStorage），不会上传至任何第三方服务器。
          </p>

          <div class="form-group">
            <label>DEEPSEEK_API_KEY <span class="required">*</span></label>
            <div class="input-wrapper">
              <input 
                :type="showKey ? 'text' : 'password'" 
                v-model="config.apiKey" 
                placeholder="sk-..." 
                class="input-glass"
              />
              <button class="btn-toggle-eye" @click="showKey = !showKey">
                <Eye v-if="!showKey" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <span class="help-text">请在 <a href="https://platform.deepseek.com/" target="_blank" class="link-highlight">DeepSeek 开放平台</a> 获取您的 API Key。</span>
          </div>

          <div class="form-group">
            <label>API Base URL</label>
            <input 
              type="text" 
              v-model="config.apiBaseUrl" 
              placeholder="https://api.deepseek.com" 
              class="input-glass"
            />
          </div>

          <div class="form-group">
            <label>Model Name</label>
            <input 
              type="text" 
              v-model="config.apiModel" 
              placeholder="deepseek-chat" 
              class="input-glass"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-glass" @click="clearConfig">清除配置</button>
          <button class="btn-gradient" @click="saveConfig">
            <Check :size="18" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Key, X, Eye, EyeOff, Check } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const showKey = ref(false)
const config = ref({
  apiKey: '',
  apiBaseUrl: 'https://api.deepseek.com',
  apiModel: 'deepseek-chat'
})

// 从 LocalStorage 加载配置
const loadConfig = () => {
  if (process.client) {
    config.value.apiKey = localStorage.getItem('api_key') || ''
    config.value.apiBaseUrl = localStorage.getItem('api_base_url') || 'https://api.deepseek.com'
    config.value.apiModel = localStorage.getItem('api_model') || 'deepseek-chat'
  }
}

// 监听弹窗打开，重新加载最新配置
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadConfig()
  }
})

onMounted(() => {
  loadConfig()
})

const saveConfig = () => {
  if (!config.value.apiKey.trim()) {
    alert('请输入 API Key！')
    return
  }

  localStorage.setItem('api_key', config.value.apiKey.trim())
  localStorage.setItem('api_base_url', config.value.apiBaseUrl.trim() || 'https://api.deepseek.com')
  localStorage.setItem('api_model', config.value.apiModel.trim() || 'deepseek-chat')
  
  emit('saved', { ...config.value })
  emit('close')
}

const clearConfig = () => {
  if (confirm('确认要清除本地保存的 API 配置吗？')) {
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
  max-width: 480px;
  background: rgba(18, 18, 38, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-purple {
  color: #a855f7;
}

.modal-header h2 {
  font-size: 1.25rem;
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
  padding: 20px;
}

.modal-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
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

.btn-toggle-eye:hover {
  color: #cbd5e1;
}

.help-text {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
}

.link-highlight {
  color: #a855f7;
  text-decoration: none;
  border-bottom: 1px dashed rgba(168, 85, 247, 0.4);
}

.link-highlight:hover {
  color: #c084fc;
  border-bottom-style: solid;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(4, 4, 12, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* 动效 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
