/**
 * ui-dialogs.js
 * In-Page Dialog & Notification System for Kindo.
 * "Turn chores into savings and goals into reality."
 * Replaces native browser alert(), confirm(), and prompt() with responsive,
 * theme-aware in-page modals and non-intrusive floating toasts.
 */

(function () {
  // Inject Dialog & Toast Styles
  const style = document.createElement('style');
  style.id = 'ui-dialogs-styles';
  style.textContent = `
    .app-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .app-modal-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .app-modal-box {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      max-width: 440px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.5);
      transform: scale(0.94);
      transition: transform 0.2s ease;
      color: #f8fafc;
      text-align: left;
      font-family: inherit;
      box-sizing: border-box;
    }
    .app-modal-backdrop.active .app-modal-box {
      transform: scale(1);
    }
    .app-modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .app-modal-icon {
      font-size: 1.6rem;
      line-height: 1;
      flex-shrink: 0;
    }
    .app-modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      color: inherit;
    }
    .app-modal-message {
      font-size: 0.92rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0 0 18px 0;
      word-break: break-word;
    }
    .app-modal-input-container {
      margin-bottom: 18px;
    }
    .app-modal-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(15, 23, 42, 0.8);
      color: #f8fafc;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .app-modal-input:focus {
      border-color: #6366f1;
    }
    .app-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .app-modal-btn {
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      font-family: inherit;
      user-select: none;
    }
    .app-modal-btn:hover {
      transform: translateY(-1px);
    }
    .app-modal-btn:active {
      transform: translateY(0);
    }
    .app-modal-btn-cancel {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
    }
    .app-modal-btn-cancel:hover {
      background: rgba(255, 255, 255, 0.14);
    }
    .app-modal-btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
    .app-modal-btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }

    /* Light Mode Overrides */
    [data-theme="light"] .app-modal-backdrop {
      background: rgba(15, 23, 42, 0.45);
    }
    [data-theme="light"] .app-modal-box {
      background: #ffffff;
      color-scheme: light !important;
      border-color: #e2e8f0;
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.15);
      color: #0f172a;
    }
    [data-theme="light"] .app-modal-message {
      color: #475569;
    }
    [data-theme="light"] .app-modal-input {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    [data-theme="light"] .app-modal-input:focus {
      border-color: #6366f1;
      background: #ffffff;
    }
    [data-theme="light"] .app-modal-btn-cancel {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    [data-theme="light"] .app-modal-btn-cancel:hover {
      background: #f8fafc;
    }

    /* Floating Toast System */
    .app-toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 10001;
      pointer-events: none;
      max-width: 380px;
      width: calc(100% - 48px);
    }
    .app-toast {
      pointer-events: auto;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f8fafc;
      padding: 12px 18px;
      border-radius: 14px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .app-toast.active {
      transform: translateY(0);
      opacity: 1;
    }
    .app-toast.toast-success { border-left: 4px solid #10b981; }
    .app-toast.toast-error { border-left: 4px solid #ef4444; }
    .app-toast.toast-warning { border-left: 4px solid #f59e0b; }
    .app-toast.toast-info { border-left: 4px solid #06b6d4; }
    [data-theme="light"] .app-toast {
      background: #ffffff;
      color: #0f172a;
      border-color: #cbd5e1;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 520px) {
      .app-modal-backdrop {
        padding: 12px;
      }
      .app-modal-box {
        padding: 20px 16px;
        border-radius: 16px;
        max-width: calc(100vw - 24px);
        max-height: 92vh;
        overflow-y: auto;
      }
      .app-modal-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }
      .app-modal-btn {
        width: 100%;
        padding: 11px 16px;
        font-size: 0.92rem;
      }
      .app-toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
        width: auto;
        max-width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  // Containers
  let modalBackdrop = null;
  let toastContainer = null;

  function ensureContainers() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'app-toast-container';
      document.body.appendChild(toastContainer);
    }
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.className = 'app-modal-backdrop';
      modalBackdrop.id = 'appGlobalModalBackdrop';
      modalBackdrop.innerHTML = `
        <div class="app-modal-box" id="appGlobalModalBox">
          <div class="app-modal-header">
            <span class="app-modal-icon" id="appGlobalModalIcon">ℹ️</span>
            <h3 class="app-modal-title" id="appGlobalModalTitle">Notice</h3>
          </div>
          <p class="app-modal-message" id="appGlobalModalMsg"></p>
          <div class="app-modal-input-container" id="appGlobalModalInputContainer" style="display:none;">
            <input type="text" class="app-modal-input" id="appGlobalModalInput" />
          </div>
          <div class="app-modal-actions" id="appGlobalModalActions"></div>
        </div>
      `;
      document.body.appendChild(modalBackdrop);
    }
  }

  // Toast Function
  window.showToast = function (message, type = 'info', duration = 3200) {
    ensureContainers();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };
    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('active');
    });

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  // In-Page Alert Modal
  window.showModalAlert = function (messageOrConfig, title = 'Notice', type = 'info') {
    ensureContainers();
    let message = '';
    let btnText = 'OK';
    let icon = null;

    if (typeof messageOrConfig === 'object' && messageOrConfig !== null) {
      message = messageOrConfig.message || '';
      title = messageOrConfig.title || 'Notice';
      type = messageOrConfig.type || 'info';
      btnText = messageOrConfig.btnText || messageOrConfig.confirmText || 'OK';
      icon = messageOrConfig.icon || null;
    } else {
      message = String(messageOrConfig || '');
    }

    const iconMap = {
      info: 'ℹ️',
      success: '🎉',
      error: '⚠️',
      warning: '⚠️'
    };

    return new Promise(resolve => {
      document.getElementById('appGlobalModalIcon').innerText = icon || iconMap[type] || 'ℹ️';
      document.getElementById('appGlobalModalTitle').innerText = title;
      document.getElementById('appGlobalModalMsg').innerText = message;
      document.getElementById('appGlobalModalInputContainer').style.display = 'none';

      const actions = document.getElementById('appGlobalModalActions');
      actions.innerHTML = `
        <button type="button" class="app-modal-btn app-modal-btn-primary" id="appModalAlertOk">${btnText}</button>
      `;

      function closeAlert() {
        modalBackdrop.classList.remove('active');
        document.removeEventListener('keydown', keyHandler);
        resolve();
      }

      function keyHandler(e) {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          closeAlert();
        }
      }

      document.getElementById('appModalAlertOk').onclick = closeAlert;
      document.addEventListener('keydown', keyHandler);
      modalBackdrop.classList.add('active');
      document.getElementById('appModalAlertOk').focus();
    });
  };

  // In-Page Confirm Modal
  window.showModalConfirm = function (messageOrConfig, title = 'Confirm Action', options = {}) {
    ensureContainers();
    let message = '';
    let isDanger = false;
    let confirmText = '';
    let cancelText = 'Cancel';
    let icon = '';
    let confirmColor = null;

    if (typeof messageOrConfig === 'object' && messageOrConfig !== null) {
      message = messageOrConfig.message || '';
      title = messageOrConfig.title || 'Confirm Action';
      isDanger = Boolean(messageOrConfig.isDanger || messageOrConfig.confirmColor === '#ef4444');
      confirmText = messageOrConfig.confirmText || (isDanger ? 'Delete' : 'Confirm');
      cancelText = messageOrConfig.cancelText || 'Cancel';
      confirmColor = messageOrConfig.confirmColor || null;
      icon = messageOrConfig.icon || (isDanger ? '⚠️' : '❓');
    } else {
      message = String(messageOrConfig || '');
      isDanger = Boolean(options.isDanger || options.confirmColor === '#ef4444');
      confirmText = options.confirmText || (isDanger ? 'Delete' : 'Confirm');
      cancelText = options.cancelText || 'Cancel';
      confirmColor = options.confirmColor || null;
      icon = options.icon || (isDanger ? '⚠️' : '❓');
    }

    return new Promise(resolve => {
      document.getElementById('appGlobalModalIcon').innerText = icon;
      document.getElementById('appGlobalModalTitle').innerText = title;
      document.getElementById('appGlobalModalMsg').innerText = message;
      document.getElementById('appGlobalModalInputContainer').style.display = 'none';

      const actions = document.getElementById('appGlobalModalActions');
      const btnClass = isDanger ? 'app-modal-btn-danger' : 'app-modal-btn-primary';
      const customStyle = confirmColor ? `style="background: ${confirmColor};"` : '';

      actions.innerHTML = `
        <button type="button" class="app-modal-btn app-modal-btn-cancel" id="appModalConfirmCancel">${cancelText}</button>
        <button type="button" class="app-modal-btn ${btnClass}" ${customStyle} id="appModalConfirmOk">${confirmText}</button>
      `;

      function cleanup(result) {
        modalBackdrop.classList.remove('active');
        document.removeEventListener('keydown', keyHandler);
        resolve(result);
      }

      function keyHandler(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(true);
        }
      }

      document.getElementById('appModalConfirmCancel').onclick = () => cleanup(false);
      document.getElementById('appModalConfirmOk').onclick = () => cleanup(true);
      document.addEventListener('keydown', keyHandler);

      modalBackdrop.classList.add('active');
      document.getElementById('appModalConfirmOk').focus();
    });
  };

  // In-Page Prompt Modal
  window.showModalPrompt = function (messageOrConfig, defaultValue = '', title = 'Input Required', options = {}) {
    ensureContainers();
    let message = '';
    let placeholder = '';
    let inputType = 'text';
    let confirmText = 'Submit';
    let cancelText = 'Cancel';
    let icon = '✏️';

    if (typeof messageOrConfig === 'object' && messageOrConfig !== null) {
      message = messageOrConfig.message || '';
      defaultValue = messageOrConfig.defaultValue || messageOrConfig.value || '';
      title = messageOrConfig.title || 'Input Required';
      placeholder = messageOrConfig.placeholder || '';
      inputType = messageOrConfig.inputType || 'text';
      confirmText = messageOrConfig.confirmText || 'Submit';
      cancelText = messageOrConfig.cancelText || 'Cancel';
      icon = messageOrConfig.icon || '✏️';
    } else {
      message = String(messageOrConfig || '');
      placeholder = options.placeholder || '';
      inputType = options.inputType || 'text';
      confirmText = options.confirmText || 'Submit';
      cancelText = options.cancelText || 'Cancel';
      icon = options.icon || '✏️';
    }

    return new Promise(resolve => {
      document.getElementById('appGlobalModalIcon').innerText = icon;
      document.getElementById('appGlobalModalTitle').innerText = title;
      document.getElementById('appGlobalModalMsg').innerText = message;

      const inputContainer = document.getElementById('appGlobalModalInputContainer');
      inputContainer.style.display = 'block';

      const input = document.getElementById('appGlobalModalInput');
      input.type = inputType;
      input.placeholder = placeholder;
      input.value = defaultValue;

      const actions = document.getElementById('appGlobalModalActions');
      actions.innerHTML = `
        <button type="button" class="app-modal-btn app-modal-btn-cancel" id="appModalPromptCancel">${cancelText}</button>
        <button type="button" class="app-modal-btn app-modal-btn-primary" id="appModalPromptOk">${confirmText}</button>
      `;

      function cleanup(result) {
        modalBackdrop.classList.remove('active');
        document.removeEventListener('keydown', keyHandler);
        resolve(result);
      }

      function keyHandler(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(null);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(input.value);
        }
      }

      document.getElementById('appModalPromptCancel').onclick = () => cleanup(null);
      document.getElementById('appModalPromptOk').onclick = () => cleanup(input.value);
      document.addEventListener('keydown', keyHandler);

      modalBackdrop.classList.add('active');
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    });
  };

  // Monkey patch window.alert to prevent native browser alerts
  window.alert = function (msg) {
    if (typeof msg !== 'string') msg = String(msg || '');
    if (msg.length < 90 && !msg.includes('\n')) {
      showToast(msg, 'info');
    } else {
      showModalAlert(msg, 'Notice');
    }
  };

  // Auto-init on load if body is ready
  if (document.body) {
    ensureContainers();
  } else {
    document.addEventListener('DOMContentLoaded', ensureContainers);
  }
})();

