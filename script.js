const settingsButton = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const searchForm = document.getElementById('searchForm');
const searchEngine = document.getElementById('searchEngine');
const themeSelect = document.getElementById('themeSelect');
const searchInput = document.getElementById('searchInput');
const webLinkPaste = document.getElementById('webLinkPaste');

// Çerez işlemleri
const setCookie = (name, value, days = 365) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}`;
};

const getCookie = (name) => {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, val] = cookie.split('=');
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
  return cookies[name];
};

// Ayar panelini aç/kapat
settingsButton.addEventListener('click', () => {
  settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
});

// Panel dışına tıklayınca kapat
document.addEventListener('click', (e) => {
  if (!settingsPanel.contains(e.target) && !settingsButton.contains(e.target)) {
    settingsPanel.style.display = 'none';
  }
});

// Tema değiştir
themeSelect.addEventListener('change', (e) => {
  const theme = e.target.value;
  document.body.className = theme;
  setCookie('theme', theme);
});

// Arama motorunu değiştir
searchEngine.addEventListener('change', (e) => {
  const engine = e.target.value;
  searchForm.action = engine;
  setCookie('searchEngine', engine);
});

// Sayfa yüklendiğinde ayarları uygula
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = getCookie('theme') || 'dark';
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;

  const savedEngine = getCookie('searchEngine') || 'https://www.google.com/search?q=';
  searchForm.action = savedEngine;
  searchEngine.value = savedEngine;

  searchInput.focus();
});

// Arama gönderimi kontrolü
searchForm.addEventListener('submit', (e) => {
  const query = searchInput.value.trim();
  if (!query) {
    e.preventDefault();
    searchInput.placeholder = 'Arama yapmak için bir şey yazın';
    searchForm.classList.add('shake');
    setTimeout(() => searchForm.classList.remove('shake'), 400);
  } else if (isValidHttpsURL(query) && webLinkPaste.checked) {
    e.preventDefault();
    window.location.href = query;
  }
});

// URL doğrulama
const isValidHttpsURL = (url) => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

// Sekmeye dönüldüğünde arama kutusuna odaklan
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') searchInput.focus();
});