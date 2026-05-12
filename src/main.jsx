import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// 注册 service worker（自动更新模式）
registerSW({
  onNeedRefresh() {
    // 当有新版本可用时，可以在这里显示一个提示条
    if (confirm('有新的更新可用，要立即刷新吗？')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('应用已可离线使用！');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);