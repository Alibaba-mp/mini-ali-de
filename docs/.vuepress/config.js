const { join } = require('path')

module.exports = {
  base: "/mini-ali-de/",
  /**
   * 网站的标题，ref：https://v1.vuepress.vuejs.org/zh/config/#title
   */
  title: 'De',
  /**
   * 网站的描述，ref：https://v1.vuepress.vuejs.org/zh/config/#description
   */
  description: 'De',

  /**
   * 额外的要插入 HTML <head> 中的 tags，ref：https://vuepress.vuejs.org/config/#head
   */
  head: [
    [
      'link',
      {
        rel: 'icon',
        href:
          'https://gw.alipayobjects.com/mdn/rms_8ffa09/afts/img/A*IEI_T5OPmqAAAAAAAAAAAABkARQnAQ',
      },
    ],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * 注册全局 Stylus 文件，ref: https://v1.vuepress.vuejs.org/zh/config/#stylus
   */
  stylus: {
    import: [join(__dirname, './styles/global.styl')]
  },

  /**
   * 主题配置，这里是 VuePress 默认主题的配置，ref：https://v1.vuepress.vuejs.org/zh/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: '',
    logo: 'https://gw.alipayobjects.com/mdn/rms_8ffa09/afts/img/A*Gx6fSIHZtsAAAAAAAAAAAABkARQnAQ',
    nav: [
      {
        text: '文档',
        link: '/tutorial/intro',
      },
      {
        text: 'API参考',
        link: '/api/intro',
      },
      {
        text: 'GITHUB',
        link: 'https://github.com/Alibaba-mp/mini-ali-de'
      },
      {
        text: 'CHANGELOG',
        link: '/changelog/intro'
      },
    ],
    sidebar: {
      '/tutorial/': [
        'intro',
        'best',
        'perf',
        'store',
        'hooks',
        'cli',
        'ts',
      ],
      '/api/': [
        'intro',
      ],
      '/changelog/': [
        'intro',
      ],
    }
  },
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom'
  ]
}
