import { defineEventHandler } from 'h3'

/**
 * GET /api/check-key
 * 告知前端：服务器是否已配置内置 API 密钥
 * 注意：只返回布尔值，绝不返回密钥本身
 */
export default defineEventHandler(() => {
  const hasBuiltinKey = !!(
    process.env.DEEPSEEK_API_KEY &&
    process.env.DEEPSEEK_API_KEY.trim().length > 0
  )
  return { hasBuiltinKey }
})
