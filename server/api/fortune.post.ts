import { defineEventHandler, readBody, getHeader, createError } from 'h3'

// 顽健的 JSON 字符串提取与解析工具
function parseCleanJson(text: string) {
  // 正则寻找 JSON 包裹的边界
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e: any) {
      throw new Error(`匹配到了 JSON 结构，但解析失败: ${e.message}`);
    }
  }
  
  // 如果没找到大括号包裹的，尝试直接解析全文
  try {
    return JSON.parse(text.trim());
  } catch (e: any) {
    throw new Error(`无法解析为合法的 JSON 对象。原始内容为: ${text}`);
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, params } = body

  // 从 Request Headers 中提取密钥和自定义配置
  const apiKey = getHeader(event, 'x-api-key')
  const apiBaseUrl = getHeader(event, 'x-api-base-url') || 'https://api.deepseek.com'
  const apiModel = getHeader(event, 'x-api-model') || 'deepseek-chat'

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '未检测到 API 密钥。请点击右上角设置图标配置您的 API 密钥。'
    })
  }

  let systemPrompt = ''
  let userPrompt = ''

  if (type === 'horoscope') {
    const { name, period } = params
    const periodMap: Record<string, string> = { today: '今日', week: '本周', month: '本月' }
    const periodText = periodMap[period] || '今日'
    
    systemPrompt = '你是一位精通西方占星学的神秘学大师。用户提供星座和时间跨度，请生成详细的运势分析。要求严格按照JSON格式返回，不要包含任何markdown标记如\`\`\`json或\`\`\`。'
    userPrompt = `星座：${name}
时间跨度：${periodText}
请在此时间范围内对其进行深入的运势观测，并按照以下JSON格式返回：
{
  "summary": "一句简短的${periodText}运势总评",
  "luckyNumber": "幸运数字，例如 9",
  "luckyColor": "幸运颜色，例如 湖水蓝",
  "loveIndex": 1-5的整数，代表爱情运势指数（5颗星最高）",
  "workIndex": 1-5的整数，代表事业/学业运势指数",
  "moneyIndex": 1-5的整数，代表财富运势指数",
  "details": "详细的运势深度解析，包含运势要点、人际交往、潜在机会以及面临的风险建议。字数在120-200字之间。"
}`
  } else if (type === 'tarot') {
    const { question, cards } = params
    const [c1, c2, c3] = cards // 过去、现在、未来

    systemPrompt = '你是一位极具灵性与洞察力的塔罗牌占卜大师。用户会提供占卜的问题，并且已经抽取了三张牌（分别代表过去、现在、未来）。请结合问题和这三张牌（包含正逆位），为用户进行专业客观的牌面解读与引导建议。要求严格按照JSON格式返回，不要包含任何markdown标记如\`\`\`json或\`\`\`。'
    userPrompt = `占卜问题：“${question}”
抽取牌阵（三张牌时间流，含正位/逆位）：
1. 过去：${c1.name} (${c1.isUpright ? '正位' : '逆位'})
2. 现在：${c2.name} (${c2.isUpright ? '正位' : '逆位'})
3. 未来：${c3.name} (${c3.isUpright ? '正位' : '逆位'})

请根据上述牌面解答用户的问题。解析需要融合神秘学智慧与心理疗愈，并按照以下JSON格式返回：
{
  "summary": "整个牌阵对该问题的核心启示（一句话）",
  "pastInterpretation": "针对【过去】牌面（${c1.name} ${c1.isUpright ? '正位' : '逆位'}）的详细解读，解释其如何导致了当前的现状（约80字）",
  "presentInterpretation": "针对【现在】牌面（${c2.name} ${c2.isUpright ? '正位' : '逆位'}）的详细解读，分析当前面临的核心矛盾、挑战或现状（约80字）",
  "futureInterpretation": "针对【未来】牌面（${c3.name} ${c3.isUpright ? '正位' : '逆位'}）的预测解读，展望事情发展的趋势与可能的结果（约80字）",
  "guidance": "给用户的切身建议与行动指南。指导用户应该如何应对，字数约100字。"
}`
  } else if (type === 'bazi') {
    const { name, gender, birthDate, birthHour } = params
    
    systemPrompt = '你是一位深谙中国传统八字命理学的国学命理大师。用户提供姓名、性别以及具体的公历出生年月日时。请为其进行八字排盘与五行分析，并提供针对性格、事业、感情和健康的运势解读。要求严格按照JSON格式返回，不要包含任何markdown标记如\`\`\`json或\`\`\`。'
    userPrompt = `姓名：${name}
性别：${gender}
出生公历时间：${birthDate} ${birthHour}时
请为该用户进行八字推算。你需要在后台完成天干地支排盘（如年柱、月柱、日柱、时柱）以及五行个数与旺衰分析。请按照以下JSON格式返回解析结果：
{
  "bazi": "八字排盘结果（例如：乾造 庚午年 戊子月 癸卯日 丙辰时，注意写明乾造/坤造）",
  "wuxing": "五行分析（例如：金1、木2、水2、火1、土2。喜用神：木，忌神：金）",
  "personality": "性格特质解析，指出核心性格优缺点及心理特质（约80字）",
  "career": "事业学业运势，解析适合的行业方向及近期的职业建议（约80字）",
  "love": "婚恋感情解析，指出感情模式、桃花运势及相处建议（约80字）",
  "health": "健康运势分析，从五行平衡角度给出需要防范的身体部位或日常保养建议（约80字）",
  "advice": "一句话核心开运建议"
}`
  } else {
    throw createError({
      statusCode: 400,
      message: '不支持的测算类型'
    })
  }

  // 格式化 Base URL，确保后缀正确
  let targetUrl = apiBaseUrl.trim()
  if (!targetUrl.endsWith('/v1') && !targetUrl.includes('/v1/')) {
    // 兼容有些直接指向根域名的baseUrl，但也支持已拼接/v1的baseUrl
    // 对官方接口通常是 api.deepseek.com/chat/completions 或 api.deepseek.com/v1/chat/completions均可，
    // 我们在这里拼接其标准的补齐方式
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl + 'chat/completions'
    } else {
      targetUrl = targetUrl + '/chat/completions'
    }
  } else {
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl + 'chat/completions'
    } else {
      targetUrl = targetUrl + '/chat/completions'
    }
  }

  try {
    // 使用 node-fetch 机制（Nuxt 中的 global $fetch）
    const response: any = await $fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      }),
      timeout: 35000 // 35秒超时
    })

    const replyContent = response?.choices?.[0]?.message?.content || ''
    if (!replyContent) {
      throw new Error('模型返回的响应内容为空')
    }

    // 清洗提取 JSON
    const parsedData = parseCleanJson(replyContent)
    return {
      success: true,
      data: parsedData
    }

  } catch (error: any) {
    console.error('DeepSeek API Request Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '大模型服务响应异常，请检查您的 Key 是否正确以及 Base URL 是否能够连通。'
    })
  }
})
