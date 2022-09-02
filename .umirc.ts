import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { path:'/test', component: "@/pages/test"}
  ],
  fastRefresh: {},

  proxy: {
    '/api': {
      target: 'http://172.26.40.127:2018',
      pathRewrite: { '^/api': '' },
      changeOrigin: true
    }
  }
});
