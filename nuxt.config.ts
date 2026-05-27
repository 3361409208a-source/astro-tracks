// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: {
    host: '0.0.0.0',
    port: 3002
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '星轨命鉴 - 综合占卜测算 MVP',
      meta: [
        { name: 'description', content: '基于 DeepSeek 驱动的星座运势、塔罗占卜、生辰八字综合测算服务。' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap' }
      ]
    }
  }
})
