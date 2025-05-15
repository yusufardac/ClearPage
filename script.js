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

  searchInput.focus();
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

let messageIndex = 0; // Mesaj dizisi için global bir indeks
let finalMessageShown = false; 
searchForm.addEventListener('submit', (e) => {
  const query = searchInput.value.trim();
  const messages = [
    // 0–9: Nazik ve açıklayıcı
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Israrla neden boş arama yapıyorsun?`,
    `Gerçekten hiçbir şey mi aramıyorsun?`,

  // 10–19: Hafif sinirli
  `Yavaş yavaş sabrım tükeniyor...`,
  `Bu artık kişisel bir meseleye dönüştü.`,
  `Boş arama: yeni hobin galiba.`,
  `Hadi ama, bu kaçıncı oldu?`,

  // 20–24: Sinirli
  `Harbiden kızıyorum artık!`,
  `Yok, yazmayacak...`,
  `TAMAM! BEN YOKUM!`
  ];

  const finalMessage = "...";
  // liste bittiğinde devam l gösterilcek mesaj

  if (!query) {
    e.preventDefault(); // Formun gönderilmesini engelle

    // 1 saniye boyunca tekrar boş arama yapılamasın
    if (searchForm.dataset.disabled === "true") return;
    searchForm.dataset.disabled = "true";
    setTimeout(() => {
      searchForm.dataset.disabled = "false";
    }, 1000);

    if (finalMessageShown) {
      searchInput.placeholder = finalMessage;
      searchForm.classList.add('shake-strong');
      setTimeout(() => searchForm.classList.remove('shake-strong'), 400); // Daha uzun süreli titreşim
      return;
    }

    if (messageIndex >= 20) {
      searchForm.classList.add('shake-strong');
      setTimeout(() => searchForm.classList.remove('shake-strong'), 400); // Daha uzun süreli titreşim
    } else {
      searchForm.classList.add('shake');
      setTimeout(() => searchForm.classList.remove('shake'), 400);
    }

    // Sıradaki mesajı göster
    searchInput.placeholder = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length; // Mesajları döngüsel olarak değiştir

    // Eğer son mesaja ulaşıldıysa, finalMessageShown'u true yap
    if (messageIndex === 0) {
      finalMessageShown = true;
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

