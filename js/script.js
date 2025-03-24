// 短链接生成器逻辑

// DOM 元素
const longUrlInput = document.getElementById('longUrl');
const expirySelect = document.getElementById('expirySelect');
const passwordField = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const shortUrlDisplay = document.getElementById('shortUrl');
const createdAtDisplay = document.getElementById('createdAt');
const expiryTimeDisplay = document.getElementById('expiryTime');
const passwordStatusDisplay = document.getElementById('passwordStatus');
const copyBtn = document.getElementById('copyBtn');

// 短链接前缀（改为页面路径 + 查询参数）
const BASE_URL = window.location.pathname; // 动态获取当前页面路径，例如 "/shortlink-generator/index.html"

// 过期时间映射
const expiryOptions = {
  '1': '1 天',
  '3': '3 天',
  '5': '5 天',
  '7': '7 天',
  'permanent': '永久'
};

// 切换密码显示/隐藏
togglePassword.addEventListener('click', () => {
  const type = passwordField.type === 'password' ? 'text' : 'password';
  passwordField.type = type;
  togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// 验证长链接格式
function validateUrl(url) {
  const regex = /^https?:\/\/.+/;
  return regex.test(url);
}

// 生成随机短链接后缀
function generateRandomSuffix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return suffix;
}

// 保存短链接到 localStorage
function saveShortLink(longUrl, shortUrlId, expiryDays, password) {
  const links = JSON.parse(localStorage.getItem('shortLinks')) || [];
  const createdAt = new Date();
  let expiryTime = null;
  if (expiryDays !== 'permanent') {
    expiryTime = new Date(createdAt);
    expiryTime.setDate(expiryTime.getDate() + parseInt(expiryDays));
  }
  links.push({ longUrl, shortUrlId, expiryTime: expiryTime ? expiryTime.toISOString() : null, password, createdAt: createdAt.toISOString() });
  localStorage.setItem('shortLinks', JSON.stringify(links));
}

// 获取短链接列表
function getShortLinks() {
  return JSON.parse(localStorage.getItem('shortLinks')) || [];
}

// 生成短链接
generateBtn.addEventListener('click', () => {
  const longUrl = longUrlInput.value.trim();
  const expiryDays = expirySelect.value;
  const password = passwordField.value.trim();

  // 验证长链接
  if (!validateUrl(longUrl)) {
    alert('请输入以 http:// 或 https:// 开头的有效链接！');
    return;
  }

  // 生成短链接 ID
  const shortUrlId = generateRandomSuffix();
  const shortUrl = `${BASE_URL}?id=${shortUrlId}`;
  saveShortLink(longUrl, shortUrlId, expiryDays, password);

  // 显示结果
  shortUrlDisplay.textContent = shortUrl;
  shortUrlDisplay.href = shortUrl;
  createdAtDisplay.textContent = new Date().toLocaleString();
  expiryTimeDisplay.textContent = expiryDays === 'permanent' ? '永不过期' : new Date(new Date().setDate(new Date().getDate() + parseInt(expiryDays))).toLocaleString();
  passwordStatusDisplay.textContent = password ? '****' : '无';
  resultSection.classList.remove('hidden');

  // 清空输入
  longUrlInput.value = '';
  passwordField.value = '';
});

// 复制短链接
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shortUrlDisplay.textContent).then(() => {
    alert('已复制！');
  });
});

// 短链接跳转（处理点击和直接访问）
function handleShortLinkRedirect(shortUrlId) {
  const links = getShortLinks();
  const link = links.find(l => l.shortUrlId === shortUrlId);
  if (link) {
    if (link.expiryTime && new Date(link.expiryTime) < new Date()) {
      alert('短链接已过期！');
      return;
    }
    if (link.password) {
      const password = prompt('请输入访问密码：');
      if (password !== link.password) {
        alert('密码错误！');
        return;
      }
    }
    window.location.href = link.longUrl; // 直接跳转到目标地址
  } else {
    alert('短链接不存在！');
  }
}

// 处理页面加载时的短链接访问
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortUrlId = urlParams.get('id');
  if (shortUrlId) {
    handleShortLinkRedirect(shortUrlId);
  }
});

// 处理页面内短链接点击
document.addEventListener('click', (e) => {
  const target = e.target;
  if (target.tagName === 'A' && target.href.includes('?id=')) {
    e.preventDefault();
    const shortUrlId = new URLSearchParams(new URL(target.href).search).get('id');
    handleShortLinkRedirect(shortUrlId);
  }
});