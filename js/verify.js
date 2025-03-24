// 短链接验证逻辑

document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素
  const verifyPasswordInput = document.getElementById('verifyPassword');
  const togglePassword = document.getElementById('togglePassword');
  const verifyBtn = document.getElementById('verifyBtn');
  const errorMessage = document.getElementById('errorMessage');

  // 调试：检查 DOM 元素是否正确获取
  if (!verifyPasswordInput || !togglePassword || !verifyBtn || !errorMessage) {
    console.error('DOM 元素未找到：', {
      verifyPasswordInput: !!verifyPasswordInput,
      togglePassword: !!togglePassword,
      verifyBtn: !!verifyBtn,
      errorMessage: !!errorMessage
    });
    return;
  }

  // 切换密码显示/隐藏
  togglePassword.addEventListener('click', () => {
    const type = verifyPasswordInput.type === 'password' ? 'text' : 'password';
    verifyPasswordInput.type = type;
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });

  // 获取短链接列表
  function getShortLinks() {
    return JSON.parse(localStorage.getItem('shortLinks')) || [];
  }

  // 验证短链接并跳转
  function handleShortLinkRedirect(shortUrlId, password) {
    const links = getShortLinks();
    const link = links.find(l => l.shortUrlId === shortUrlId);
    if (link) {
      if (link.expiryTime && new Date(link.expiryTime) < new Date()) {
        errorMessage.textContent = '短链接已过期！';
        errorMessage.classList.remove('hidden');
        return;
      }
      if (link.password) {
        if (password !== link.password) {
          errorMessage.textContent = '密码错误！';
          errorMessage.classList.remove('hidden');
          return;
        }
      }
      window.location.href = link.longUrl; // 直接跳转到目标地址
    } else {
      errorMessage.textContent = '短链接不存在！';
      errorMessage.classList.remove('hidden');
    }
  }

  // 验证按钮点击事件
  verifyBtn.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shortUrlId = urlParams.get('id');
    const password = verifyPasswordInput.value.trim();

    if (!shortUrlId) {
      errorMessage.textContent = '无效的短链接！';
      errorMessage.classList.remove('hidden');
      return;
    }

    if (!password && !confirm('未输入密码，是否继续？')) {
      return;
    }

    handleShortLinkRedirect(shortUrlId, password);
  });
});
