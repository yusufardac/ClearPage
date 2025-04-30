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
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Arama yapmak için bir şey yazın`,
    `Israrla neden boş arama yapıyorsun?`,
    `Boş arama yapılmaz, ${searchEngine.options[searchEngine.selectedIndex].text} için sinir olurdu.`,
    `Ne aradığını ben de bilmiyorum, lütfen yaz`,
    `Gerçekten hiçbir şey mi aramıyorsun?`,
    `Arama kutusu da bir şey bekliyor...`,
    `Bu 10. boş arama, bir rekor olabilir!`,
    `Boş aramayla bir yere varamayız 😅`,
    `İlginç Bilgi: İnsanlar konuşak, arama kutuları yazışak anlaşır :)`,
    `Bir kelime yazarsan mucizeler olabilir!`,
    `Aranacak bir şey yoksa neden buradayız?`,
    `Bu boşluk bizi bir yere götürmez.`,
    `En azından 'merhaba' yaz, o da olur!`,
    `Boş arama... belki de en gizemli arama türü.`,
    `Bir şeyler yazmazsan nasıl yardımcı olayım?`,
    `Yapay zekaya sabır testi mi bu?`,
    `Arama kutusu seni anlamadı, yazıyla anlat :)`,
    `Lütfen artık bir şey yaz... ne olursa.`,
    `Pekala ben gidiyorum`,
    `Gidiyorum ben one göre`,
    `Peki sen bilirsin`,
    `Tamam, ben de boş kalırım o zaman`,
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

    // Sıradaki mesajı göster
    searchInput.placeholder = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length; // Mesajları döngüsel olarak değiştir

    // Eğer son mesaja ulaşıldıysa, finalMessageShown'u true yap
    if (messageIndex === 0) {
      finalMessageShown = true;
    }

    // Titreşim efekti ekle
    searchForm.classList.add('shake');
    setTimeout(() => searchForm.classList.remove('shake'), 400); // Titreşim efektini kaldır
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

