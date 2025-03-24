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

// 调试：检查 DOM 元素是否正确获取
if (!longUrlInput || !generateBtn || !resultSection) {
  console.error('DOM 元素未找到：', {
    longUrlInput: !!longUrlInput,
    generateBtn: !!generateBtn,
    resultSection: !!resultSection
  });
}

// 短链接前缀（适配 GitHub Pages 路径）
const BASE_PATH = '/URL/'; // GitHub Pages 路径
const DOMAIN = 'https://zhixin8.github.io'; // 完整域名
const BASE_URL = `${DOMAIN}${BASE_PATH}`; // 完整短链接前缀，例如 https://zhixin8.github.io/URL/
const LINKS_JSON_URL = `${DOMAIN}${BASE_PATH}links.json`; // links.json 文件的完整 URL

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

// 获取短链接列表（从 links.json 读取）
async function getShortLinks() {
  try {
    const response = await fetch(LINKS_JSON_URL);
    if (!response.ok) {
      throw new Error('无法加载 links.json');
    }
    return await response.json();
  } catch (error) {
    console.error('获取短链接列表失败：', error);
    return [];
  }
}

// 注意：由于 GitHub Pages 是静态托管，无法直接通过前端写入 links.json
// 这里仅模拟保存逻辑，实际需要手动更新 links.json 或使用 GitHub API
async function saveShortLink(longUrl, shortUrlId, expiryDays, password) {
  const links = await getShortLinks();
  const createdAt = new Date();
  let expiryTime = null;
  if (expiryDays !== 'permanent') {
    expiryTime = new Date(createdAt);
    expiryTime.setDate(expiryTime.getDate() + parseInt(expiryDays));
  }
  links.push({ longUrl, shortUrlId, expiryTime: expiryTime ? expiryTime.toISOString() : null, password, createdAt: createdAt.toISOString() });

  // 模拟保存（实际需要手动更新 links.json 或使用 GitHub API）
  console.log('请手动将以下数据添加到 links.json：', JSON.stringify(links, null, 2));
  alert('短链接已生成，但由于 GitHub Pages 限制，数据未保存。请查看控制台，将数据手动添加到 links.json 文件。');
}

// 生成短链接
generateBtn.addEventListener('click', async () => {
  console.log('生成短链接按钮被点击');
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
  const shortUrl = `${BASE_URL}?id=${shortUrlId}`; // 完整 URL
  await saveShortLink(longUrl, shortUrlId, expiryDays, password);

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
  const shortUrl = shortUrlDisplay.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    alert('已复制短链接：' + shortUrl);
  });
});

// 短链接跳转（处理点击和直接访问）
async function handleShortLinkRedirect(shortUrlId) {
  const links = await getShortLinks();
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
window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortUrlId = urlParams.get('id');
  if (shortUrlId) {
    await handleShortLinkRedirect(shortUrlId);
  }
});

// 处理页面内短链接点击
document.addEventListener('click', async (e) => {
  const target = e.target;
  if (target.tagName === 'A' && target.href.includes('?id=')) {
    e.preventDefault();
    const shortUrlId = new URLSearchParams(new URL(target.href).search).get('id');
    await handleShortLinkRedirect(shortUrlId);
  }
});
