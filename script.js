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

let messageIndex = 0; // Mesaj dizisi için global bir indeks
let finalMessageShown = false; 
// Arama gönderimi kontrolü
searchForm.addEventListener('submit', (e) => {
  const query = searchInput.value.trim();
  const messages = [
    // 0–9: Nazik ve açıklayıcı
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Israrla neden boş arama yapıyorsun?`,
    `Boş arama yapılmaz, ${searchEngine.options[searchEngine.selectedIndex].text} için sinir olurdu.`,
    `Ne aradığını ben de bilmiyorum, lütfen yaz`,
    `Gerçekten hiçbir şey mi aramıyorsun?`,
    `Arama kutusu da bir şey bekliyor...`,

  // 10–19: Hafif sinirli
  `Yavaş yavaş sabrım tükeniyor...`,
  `Tamam, eğlenceli ama yeter :)`,
  `Bu artık kişisel bir meseleye dönüştü.`,
  `Cidden, ne bekliyorsun?`,
  `Beni zorluyorsun, biliyorsun değil mi?`,
  `Boş arama: yeni hobin galiba.`,
  `Bu kadar boşlukta ben bile kayboldum.`,
  `Arama kutusu da depresyona girdi...`,
  `Yeter artık, gerçekten yaz bir şey.`,
  `Hadi ama, bu kaçıncı oldu?`,

  // 20–24: Sinirli/pes etmiş
  `Harbiden kızıyorum artık!`,
  `Tamam... çok komik, güldük :)`,
  `Bak vallahi gidiyorum.`,
  `Yok, bu kullanıcı yazmayacak...`,
  `TAMAM! BEN YOKUM!`
  ];

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

