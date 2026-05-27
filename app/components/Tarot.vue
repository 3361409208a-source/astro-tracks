<template>
  <div class="tarot-container">
    <!-- 占卜结果展示 -->
    <div v-if="result" class="result-section glass-panel">
      <div class="result-header">
        <div class="header-left">
          <Sparkles class="icon-purple" :size="20" />
          <h3>占卜结果</h3>
        </div>
        <button class="btn-glass" @click="reset">
          <RefreshCw :size="16" />
          重新占卜
        </button>
      </div>

      <div class="result-body">
        <div class="question-quote">
          <span class="quote-label">问</span>
          <p>“ {{ userQuestion }} ”</p>
        </div>

        <p class="summary-text">“ {{ result.summary }} ”</p>

        <!-- 抽取的卡牌展示 -->
        <div class="cards-layout">
          <div v-for="(card, index) in drawnCards" :key="index" class="card-display glass-panel">
            <span class="card-timeline">{{ timelineLabels[index] }}</span>
            <div class="card-visual">
              <span class="card-symbol">🃏</span>
              <span class="card-name">{{ card.name }}</span>
              <span class="card-orientation" :class="card.isUpright ? 'upright' : 'reversed'">
                {{ card.isUpright ? '正位' : '逆位' }}
              </span>
            </div>
            <p class="card-interpretation">
              {{ 
                index === 0 ? result.pastInterpretation :
                index === 1 ? result.presentInterpretation :
                result.futureInterpretation
              }}
            </p>
          </div>
        </div>

        <!-- 启示与建议 -->
        <div class="guidance-card">
          <h4>
            <Compass :size="18" />
            启示指引
          </h4>
          <p>{{ result.guidance }}</p>
        </div>
      </div>
    </div>

    <!-- 占卜加载中 -->
    <div v-else-if="loading" class="loading-section glass-panel">
      <div class="shuffling-cards">
        <div class="shuffling-card c1"></div>
        <div class="shuffling-card c2"></div>
        <div class="shuffling-card c3"></div>
      </div>
      <p class="loading-text">正在开启灵性场域，为您解读塔罗牌意...</p>
      <span class="loading-sub">DeepSeek 正在细细揣摩时间之河的涟漪</span>
    </div>

    <!-- 洗牌动效 -->
    <div v-else-if="shuffling" class="shuffling-section glass-panel">
      <div class="card-deck-animation">
        <div class="shuffling-indicator">🔮 正在虔诚洗牌...</div>
        <div class="deck-cards">
          <div v-for="i in 5" :key="i" class="deck-card" :style="{ animationDelay: `${i * 0.15}s` }"></div>
        </div>
      </div>
    </div>

    <!-- 问题输入与牌面抽取 -->
    <div v-else class="setup-section">
      <div class="section-title">
        <h2>塔罗秘境</h2>
        <p>诚心默想您的问题，抽取经典的时间流牌阵（过去、现在、未来）</p>
      </div>

      <div class="input-card glass-panel">
        <div class="form-group">
          <label for="question">您想要寻求指引的问题是什么？</label>
          <textarea 
            id="question"
            v-model="userQuestion"
            placeholder="例如：我下半年的事业运势如何？我跟伴侣的感情未来发展怎样？"
            class="input-glass textarea-large"
            rows="3"
          ></textarea>
        </div>

        <button 
          class="btn-gradient btn-draw"
          :disabled="!userQuestion.trim()"
          @click="drawCardsAction"
        >
          <Sparkles :size="20" />
          虔心洗牌并抽取牌阵
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sparkles, RefreshCw, Compass } from 'lucide-vue-next'

const props = defineProps({
  hasApiKey: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['requestSettings'])

const userQuestion = ref('')
const shuffling = ref(false)
const loading = ref(false)
const result = ref(null)
const drawnCards = ref([])

const timelineLabels = ['过去 (Past)', '现在 (Present)', '未来 (Future)']

// 22张大阿卡纳牌
const tarotDeck = [
  { name: '愚人 (The Fool)' },
  { name: '魔术师 (The Magician)' },
  { name: '女祭司 (The High Priestess)' },
  { name: '女皇 (The Empress)' },
  { name: '皇帝 (The Emperor)' },
  { name: '教皇 (The Hierophant)' },
  { name: '恋人 (The Lovers)' },
  { name: '战车 (The Chariot)' },
  { name: '力量 (Strength)' },
  { name: '隐士 (The Hermit)' },
  { name: '命运之轮 (Wheel of Fortune)' },
  { name: '正义 (Justice)' },
  { name: '倒吊人 (The Hanged Man)' },
  { name: '死神 (Death)' },
  { name: '节制 (Temperance)' },
  { name: '恶魔 (The Devil)' },
  { name: '高塔 (The Tower)' },
  { name: '星星 (The Star)' },
  { name: '月亮 (The Moon)' },
  { name: '太阳 (The Sun)' },
  { name: '审判 (Judgement)' },
  { name: '世界 (The World)' }
]

const drawCardsAction = () => {
  if (!props.hasApiKey) {
    emit('requestSettings')
    return
  }

  // 1. 进入洗牌状态
  shuffling.value = true
  
  setTimeout(() => {
    // 2. 模拟洗牌 1.8 秒后，随机抽 3 张不重复的牌
    shuffling.value = false
    const selected = []
    const tempDeck = [...tarotDeck]

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * tempDeck.length)
      const card = tempDeck.splice(randomIndex, 1)[0]
      const isUpright = Math.random() > 0.5 // 50% 概率正位，50% 逆位
      selected.push({ ...card, isUpright })
    }

    drawnCards.value = selected
    // 3. 进入大模型加载状态
    requestInterpretation()
  }, 1800)
}

const requestInterpretation = async () => {
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
        type: 'tarot',
        params: {
          question: userQuestion.value,
          cards: drawnCards.value
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
    reset()
  } finally {
    loading.value = false
  }
}

const reset = () => {
  result.value = null
  drawnCards.value = []
}
</script>

<style scoped>
.tarot-container {
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 6px;
}

.section-title p {
  color: #64748b;
  font-size: 0.9rem;
}

.input-card {
  padding: 24px;
}

.textarea-large {
  resize: none;
  font-size: 0.95rem;
  line-height: 1.6;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.btn-draw {
  margin-top: 16px;
  width: 100%;
}

/* 洗牌中 */
.shuffling-section {
  padding: 60px 20px;
  text-align: center;
}

.shuffling-indicator {
  font-size: 1.1rem;
  color: #c084fc;
  margin-bottom: 24px;
}

.deck-cards {
  position: relative;
  width: 100px;
  height: 150px;
  margin: 0 auto;
}

.deck-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #2e1065 0%, #0f052d 100%);
  border: 1.5px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: shuffle 1.5s ease-in-out infinite;
}

/* 占卜加载中 */
.loading-section {
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.shuffling-cards {
  position: relative;
  width: 160px;
  height: 120px;
  margin-bottom: 24px;
}

.shuffling-card {
  position: absolute;
  width: 60px;
  height: 90px;
  border-radius: 6px;
  background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
  border: 1px solid rgba(236, 72, 153, 0.3);
  opacity: 0.8;
}

.shuffling-card.c1 {
  left: 10px;
  transform: rotate(-15deg);
  animation: floatCard1 2s ease-in-out infinite;
}

.shuffling-card.c2 {
  left: 50px;
  transform: rotate(0deg);
  animation: floatCard2 2s ease-in-out infinite;
  z-index: 2;
}

.shuffling-card.c3 {
  left: 90px;
  transform: rotate(15deg);
  animation: floatCard3 2s ease-in-out infinite;
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

.question-quote {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.quote-label {
  font-size: 0.8rem;
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.question-quote p {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.4;
}

.summary-text {
  font-size: 1.15rem;
  font-weight: 500;
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 24px;
  font-style: italic;
}

/* 牌阵展示 */
.cards-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card-display {
  padding: 16px;
  background: rgba(255, 255, 255, 0.015);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-timeline {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a855f7;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.card-visual {
  width: 90px;
  height: 135px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e1b4b 0%, #030712 100%);
  border: 1.5px solid rgba(168, 85, 247, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  margin-bottom: 16px;
}

.card-symbol {
  font-size: 1.8rem;
  margin-bottom: 6px;
}

.card-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
}

.card-orientation {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
}

.card-orientation.upright {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.card-interpretation {
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
}

/* 启示建议 */
.guidance-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.guidance-card h4 {
  font-size: 0.95rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border-left: 3px solid #ec4899;
  padding-left: 8px;
}

.guidance-card p {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.7;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cards-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .card-display {
    flex-direction: row;
    gap: 16px;
    align-items: flex-start;
    padding: 20px;
  }
  .card-timeline {
    width: 60px;
    margin-bottom: 0;
  }
  .card-visual {
    margin-bottom: 0;
    flex-shrink: 0;
  }
  .card-interpretation {
    flex-grow: 1;
  }
}

/* 洗牌动画 */
@keyframes shuffle {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-30px, -10px) rotate(-8deg); z-index: 5; }
  50% { transform: translate(30px, 10px) rotate(8deg); }
  75% { transform: translate(-10px, 20px) rotate(-3deg); }
}

/* 加载浮动卡片 */
@keyframes floatCard1 {
  0%, 100% { transform: rotate(-15deg) translateY(0); }
  50% { transform: rotate(-12deg) translateY(-10px); }
}
@keyframes floatCard2 {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(2deg) translateY(-14px); }
}
@keyframes floatCard3 {
  0%, 100% { transform: rotate(15deg) translateY(0); }
  50% { transform: rotate(12deg) translateY(-8px); }
}
</style>
