const settingsButton = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const searchForm = document.getElementById('searchForm');
const searchEngine = document.getElementById('searchEngine');
const themeSelect = document.getElementById('themeSelect');
const themeSelectLabel = document.getElementById('themeSelectLabel');
const searchInput = document.getElementById('searchInput');
const webLinkPaste = document.getElementById('webLinkPaste');
const languageSelect = document.getElementById('languageSelect');

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

// dil ayarları

async function loadLanguage(lang) {
  const response = await fetch(`Localization/${lang}.json`);
  const data = await response.json();

  for (const key in data) {
    const element = document.getElementById(key);
    if (element) {
      if (element.tagName === "INPUT" && key === "searchInput") {
        element.placeholder = data[key];
      } else {
        element.textContent = data[key];
      }
    }
  }
}

// Sayfa açıldığında varsayılan dil Türkçe
loadLanguage('tr');

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

// Checkbox durumunu çerezlere yaz
webLinkPaste.addEventListener('change', (e) => {
  setCookie('webLinkPaste', e.target.checked);
});

// Sayfa yüklendiğinde ayarları uygula
window.addEventListener('DOMContentLoaded', () => {
  let savedTheme = getCookie('theme');

  // İlk kez geliyorsa ya da 'auto' seçilmişse cihaz temasını kullan
  if (!savedTheme || savedTheme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.className = prefersDark ? 'dark' : 'light';
    themeSelect.value = 'auto';

    // Eğer hiç çerez yoksa, yani ilk ziyaretse 'auto' olarak ayarla
    if (!savedTheme) setCookie('theme', 'auto');
  } else {
    // Kullanıcı manuel olarak dark veya light seçmişse onu uygula
    document.body.className = savedTheme;
    themeSelect.value = savedTheme;
  }

  const savedEngine = getCookie('searchEngine') || 'https://www.google.com/search?q=';
  searchForm.action = savedEngine;
  searchEngine.value = savedEngine;

  const webLinkPasteState = getCookie('webLinkPaste') === 'true';
  webLinkPaste.checked = webLinkPasteState;

  // Dil ile ilgili yerler
  let savedLang = getCookie('language');
  if (!savedLang) {
    // Cihaz dilini kontrol et
    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0,2).toLowerCase();
    if (browserLang === 'tr' || browserLang === 'en') {
      savedLang = browserLang;
    } else {
      savedLang = 'tr';
    }
    setCookie('language', savedLang);
  }
  languageSelect.value = savedLang;
  loadLanguage(savedLang);
  loadMessages(savedLang);

  searchInput.focus();
  loadMessages();
});


themeSelect.addEventListener('change', (e) => {
  const theme = e.target.value;

  if (theme === 'auto') {
    setCookie('theme', 'auto'); // Sadece 'auto' bilgisini çereze yaz
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.className = prefersDark ? 'dark' : 'light';
  } else {
    document.body.className = theme;
    setCookie('theme', theme); // dark veya light olarak kaydet
  }
});

let messages = [];
let messageIndex = 0; // Mesaj dizisi için global bir indeks
let finalMessageShown = false; 

// Mesajları dışarıdan JSON dosyasından yükle
async function loadMessages(lang = null) {
  lang = lang || (getCookie('language') || 'tr');
  const response = await fetch(`Localization/${lang}.json`);
  if (!response.ok) throw new Error('Mesajlar yüklenemedi');
  const data = await response.json();
  // Sadece title1-title17 anahtarlarını al
  messages = [];
  for (let i = 1; i <= 17; i++) {
    if (data[`title${i}`]) messages.push(data[`title${i}`]);
  }
}

// Arama gönderimi kontrolü
searchForm.addEventListener('submit', (e) => {
  const query = searchInput.value.trim();
  const finalMessage = "...";

  if (!query) {
    e.preventDefault(); // Formun gönderilmesini engelle
    
    if (finalMessageShown) {
      searchInput.placeholder = finalMessage;
      searchForm.classList.add('shake-strong');
      setTimeout(() => searchForm.classList.remove('shake-strong'), 400); // Daha uzun süreli titreşim
      return;
    }

    if (messageIndex >= 20) {
      searchForm.classList.add('shake-strong');
      setTimeout(() => searchForm.classList.remove('shake-strong'), 400); // Daha uzun süreli titreşim
    }else{
    searchForm.classList.add('shake');
    setTimeout(() => searchForm.classList.remove('shake'), 400);
    }

    // Sıradaki mesajı göster
    if (messages.length > 0) {
      searchInput.placeholder = messages[messageIndex];
      messageIndex = (messageIndex + 1) % messages.length; // Mesajları döngüsel olarak değiştir

      // Eğer son mesaja ulaşıldıysa, finalMessageShown'u true yap
      if (messageIndex === 0) {
        finalMessageShown = true;
      }
    }

  } else if (isValidHttpsURL(query) && webLinkPaste.checked) {
    e.preventDefault();
    window.location.href = query; // Geçerli bir URL ise yönlendir
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

// Tarayıcı sekmesine geri dönüldüğünde arama kutusuna odaklan
window.addEventListener('focus', () => {
  searchInput.focus();
});

// Dil değiştirildiğinde uygula ve kaydet
languageSelect.addEventListener('change', (e) => {
  const lang = e.target.value;
  setCookie('language', lang);
  loadLanguage(lang);
  loadMessages(lang);
});
