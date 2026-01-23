const settingsButton = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const searchForm = document.getElementById('searchForm');
const selectSearchEngine = document.getElementById('selectSearchEngine');
const themeSelect = document.getElementById('themeSelect');
const themeSelectLabel = document.getElementById('themeSelectLabel');
const searchInput = document.getElementById('searchInput');
const webLinkPaste = document.getElementById('webLinkPaste');
const languageSelect = document.getElementById('languageSelect');
const newVersionNotify = document.getElementById('newVersionNotify');
const notificationBox = document.getElementById('notificationBox');
const notificationText = document.getElementById('notificationText');
const notificationClose = document.getElementById('notificationClose');
const donateButton = document.getElementById('donateButton');

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
      } else if (element.tagName === "LABEL" && key === "newVersionNotifyLabel") {
        element.textContent = data[key];
      } else {
        element.textContent = data[key];
      }
    }
  }
}

// // Sayfa açıldığında varsayılan dil Türkçe
// loadLanguage('tr');

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
selectSearchEngine.addEventListener('change', (e) => {
  const engine = e.target.value;
  searchForm.action = engine;
  setCookie('selectSearchEngine', engine);
});

// Checkbox durumunu çerezlere yaz
webLinkPaste.addEventListener('change', (e) => {
  setCookie('webLinkPaste', e.target.checked);
});

// Yeni sürüm bildirimi checkbox'ı çerezlere yaz
newVersionNotify.addEventListener('change', (e) => {
  setCookie('newVersionNotify', e.target.checked);
});
  
// Sayfa yüklendiğinde ayarları uygula
window.addEventListener('DOMContentLoaded', () => {

  // JavaScript uyarı mesajını kaldır (mobil/masaüstü farketmez)
  const jsWarning = document.getElementById('jsWarning');
  const preLoadBackground = document.getElementById('preLoadBackground');
  if (jsWarning) {
    jsWarning.style.display = 'none';
    preLoadBackground.style.display = 'none';
  }

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

  // Arama motoru çerezden çek ve uygula
  const savedEngine = getCookie('selectSearchEngine') || 'https://www.google.com/search?q=';
  searchForm.action = savedEngine;
  selectSearchEngine.value = savedEngine;

  // webLinkPaste çerezden çek ve uygula
  const webLinkPasteState = getCookie('webLinkPaste');
  if (typeof webLinkPasteState !== 'undefined') {
    webLinkPaste.checked = (webLinkPasteState === 'true');
  } else {
    webLinkPaste.checked = false;
  }

  // newVersionNotify çerezden çek ve uygula
  const newVersionNotifyState = getCookie('newVersionNotify');
  if (typeof newVersionNotifyState !== 'undefined') {
    newVersionNotify.checked = (newVersionNotifyState === 'true');
  } else {
    newVersionNotify.checked = false; // Varsayılan olarak kapalı
  }

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
  
  // Eğer kullanıcı ilk kez geliyorsa, bildirimleri kapalı tut ve
  // en güncel sürüm notunu 'newVersionClosed' çerezine yaz
  // böylece kullanıcı daha sonra bildirimleri açtığında eski notlar gösterilmez.
  (async () => {
    try {
      const infoResp = await fetch('information.json', { cache: 'no-store' });
      if (!infoResp.ok) return;
      const infoData = await infoResp.json();
      //güncel dilin metini ve sürüm numarasını alır
      const latest = (infoData.newVersionId || infoData.newVersion || '').trim();
      const currentClosed = getCookie('newVersionClosed');
      // Eğer çerez yoksa veya boşsa, en son notu kaydet
      if ((typeof currentClosed === 'undefined' || currentClosed === '') && latest) {
        setCookie('newVersionClosed', latest);
      }
    } catch (e) {
    }
  })();

  searchInput.focus();
  loadMessages();
  showAlertFooter();
  showSettingsAlert();
  showNotificationBox();
  showInformation();
  populateLanguageOptions();
  showNewVersionNotification();
});

// Uyarı mesajını footer'da göster
async function showAlertFooter() {
  try {
    const response = await fetch(`Localization/${getCookie('language')}.json`);
    if (!response.ok) return;
    const data = await response.json();
    const alertDiv = document.getElementById('footerAlert');
    if (data.footerAlert && data.footerAlert.trim() !== "") {
      alertDiv.textContent = data.footerAlert;
      alertDiv.style.display = 'block';
    } else {
      alertDiv.style.display = 'none';
    }
  } catch (e) {
    // Hata olursa uyarı gösterme
    const alertDiv = document.getElementById('footerAlert');
    if (alertDiv) alertDiv.style.display = 'none';
  }
}

//güncel versiyon numaralarını çek
async function showInformation() {
 const response = await fetch('information.json', {cache: 'no-store'});
  if (!response.ok) return;
  const data = await response.json();
  // Her bir anahtar için, eğer id ile eşleşen bir element varsa içeriğini güncelle
  Object.keys(data).forEach(key => {
    const elem = document.getElementById(key);
    if (elem) {
      // HTML içeriği varsa HTML olarak, yoksa text olarak ekle
      if (key === 'creator') {
        elem.innerHTML = data[key];
      } else {
        elem.textContent = data[key];
      }
    }
  });
}

// Ayarlar paneli için önemli uyarı göster fonksiyonu güncel
async function showSettingsAlert() {
  try {
    const response = await fetch(`Localization/${getCookie('language')}.json`);
    if (!response.ok) return;
    const data = await response.json();
    const alertDiv = document.getElementById('settingsAlert');
    const settingsNotification = data.notificationAlert.trim();
    if (settingsNotification !== "") {
      alertDiv.innerHTML = settingsNotification; // HTML olarak ekle
      alertDiv.style.display = 'block';
    } else {
      alertDiv.style.display = 'none';
    }
  } catch (e) {
    const alertDiv = document.getElementById('settingsAlert');
    if (alertDiv) alertDiv.style.display = 'none';
  }
}

// Bildirim kutusunu göster ve çerez kontrolü
async function showNotificationBox() {
  try {
    const response = await fetch(`Localization/${getCookie('language')}.json`);
    if (!response.ok) return;
    const data = await response.json();
    const notification = data.notification.trim();
    const notificationBox = document.getElementById('notificationBox');
    const notificationText = document.getElementById('notificationText');
    const notificationClose = document.getElementById('notificationClose');
    if (!notification) {
      notificationBox.style.display = 'none';
      return;
    }
    // Çerezden son kapatılan bildirimi al
    const lastClosed = getCookie('notificationClosed') || '';
    if (notification !== lastClosed) {
      notificationText.innerHTML = notification;
      notificationBox.style.display = 'block';
      notificationClose.onclick = function() {
        notificationBox.style.display = 'none';
        setCookie('notificationClosed', notification, 365);
      };
    } else {
      notificationBox.style.display = 'none';
    }
  } catch (e) {
    const notificationBox = document.getElementById('notificationBox');
    if (notificationBox) notificationBox.style.display = 'none';
  }
}

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
let finalMessage = ""; // finalMessage'ı global olarak tanımla

// Mesajları dışarıdan JSON dosyasından yükle
async function loadMessages(lang = null) {
  lang = lang || (getCookie('language') || 'tr');
  const response = await fetch(`Localization/${lang}.json`);
  if (!response.ok) throw new Error('Mesajlar yüklenemedi');
  const data = await response.json();
  // Sadece title1-title17 anahtarlarını al
  messages = [];
  for (let i = 1; i <= 17; i++) {// max mesaj uzunluğu 17
    if (data[`title${i}`]) messages.push(data[`title${i}`]);
  }
  finalMessage = data[`finalMessage`]; // finalMessage'ı global değişkene ata
}

// Arama gönderimi kontrolü
searchForm.addEventListener('submit', (e) => {
  const query = searchInput.value.trim();

  // arama butonununa basıldıktan sonra
  //süre boyunca işlem yapılamamasını sağlıyor
  const submitButton = document.getElementById('searchButton');
  submitButton.disabled = true;
  setTimeout(() => {
    submitButton.disabled = false;
  }, 500);

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

    if (messageIndex >= 16) {
      searchForm.classList.add('shake-strong');
      setTimeout(() => searchForm.classList.remove('shake-strong'), 400); // Daha uzun süreli titreşim
    } else {
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
languageSelect.addEventListener('change', async (e) => {
  const lang = e.target.value;
  setCookie('language', lang);
  await loadLanguage(lang);
  loadMessages(lang);
});


// Sayfa yüklendiğinde dil seçeneklerini otomatik olarak doldur
async function populateLanguageOptions() {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;

  try {
    // PHP ile otomatik dosya listesi al
    // const response = await fetch('languages.php');
    //php çalışmadığı için bu kısım yok

    // PHP ile otomatik dosya listesi alma kodu kaldırıldı, yerine statik JSON dosyası kullanılıyor
    const response = await fetch('languages.json');

    
    if (!response.ok) return;
    const languageFiles = await response.json();
    languageSelect.innerHTML = '';
    let savedLang = getCookie('language') || 'tr';
    let found = false;
    for (const file of languageFiles) {
      const code = file.replace('.json', '');
      try {
        const res = await fetch(`Localization/${file}`);
        if (!res.ok) continue;
        const langData = await res.json();
        const option = document.createElement('option');
        option.value = langData.lagCode || code;
        option.textContent = langData.lagName || code.toUpperCase();
        if ((langData.lagCode || code) === savedLang) {
          option.selected = true;
          found = true;
        }
        languageSelect.appendChild(option);
      } catch {}
    }
    // Eğer çerezdeki dil bulunamadıysa ilk dili seçili yap
    if (!found && languageSelect.options.length > 0) {
      languageSelect.options[0].selected = true;
    }
  } catch (e) {
    // Hata olursa varsayılanı kullan
  }
}

// Yeni sürüm bildirimi kutusu fonksiyonu
async function showNewVersionNotification() {
  try {
    const response = await fetch('information.json', {cache: 'no-store'});
    if (!response.ok) return;
    const data = await response.json();
    // Bilgileri oku
    const newVersionId = (data.newVersionId || data.newVersion || '').trim();
    const newVersionUrl = data.newVersionUrl || '';
    if (!newVersionId) return;

    // Çerezden son kapatılan veya devre dışı bırakılan bildirimi al
    const notifyAllowed = getCookie('newVersionNotify');
    if (notifyAllowed !== 'true') return;
    const lastClosed = getCookie('newVersionClosed') || '';
    if (newVersionId === lastClosed) return;

    // Lokalize edilmiş bildirim metnini al
    const lang = getCookie('language');
    let template = '';
    try {
      const locResp = await fetch(`Localization/${lang}.json`);
      if (locResp.ok) {
        const loc = await locResp.json();
        template = loc.newVersionNotification || '';
      }
    } catch (e) {
      template = '';
    }

    if (!template) {
      template = "<strong>{version} update released!</strong> <a href='{link}'>Details</a>";
    }

    const message = template.replace(/{version}/g, newVersionId).replace(/{link}/g, newVersionUrl);
    // Bildirim kutusunu göster (kapatıldığında newVersionId kaydedilecek)
    showNotificationLikeBox(message, 'newVersionClosed', newVersionId);
  } catch (e) {}
}

// Bildirim kutusu gibi yeni sürüm kutusu göster
function showNotificationLikeBox(html, closeCookieName, closeCookieValue) {
  notificationText.innerHTML = html;
  notificationBox.style.display = 'block';
  notificationClose.onclick = function() {
    notificationBox.style.display = 'none';
    // Eğer closeCookieValue verilmişse onu kaydet, yoksa html'i kaydet (geriye dönük uyumluluk)
    setCookie(closeCookieName, closeCookieValue || html, 365);
  };
}

donateButton.addEventListener('click', async () => {
  try{
    const lang = getCookie('language') || 'tr';
    let message = "Thanks for your interest in supporting the project! You will be redirected to the donation page";
    const resp = await fetch(`Localization/${lang}.json`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.donateAlert && data.donateAlert.trim())  message = data.donateAlert;
    }
    alert(message);
  } catch(e){
    alert("Thanks for your interest in supporting the project! You will be redirected to the donation page h1");
  }
  finally{
  action = "https://www.buymeacoffee.com/yusufarda7k";
  window.open(action, '_blank');
  }
});