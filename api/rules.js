export default function handler(req, res) {
  // CORS ayarları: Eklentimizin bu API'ye tarayıcı üzerinden erişebilmesi için gerekli.
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Eğitim amaçlı YouTube reklam atlama/gizleme kuralları
  res.status(200).json({
    version: "1.0",
    hideSelectors: [
      "ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
      ".ytd-ad-slot-renderer",
      ".ytd-companion-slot-renderer",
      "#player-ads",
      ".ytp-ad-overlay-container",
      ".ytd-promoted-sparkles-web-renderer",
      "ytd-promoted-video-renderer",
      /* YouTube Anti-Adblock (Reklam Engelleyici Uyarısı) Gizleme Seçicileri */
      "ytd-enforcement-message-view-model",
      "tp-yt-paper-dialog:has(ytd-enforcement-message-view-model)",
      "tp-yt-iron-overlay-backdrop"
    ],
    skipConfig: {
      videoPlayer: ".html5-main-video",
      skipButton: ".ytp-ad-skip-button-modern, .ytp-ad-skip-button, .ytp-ad-skip-button-slot",
      adContainer: ".video-ads.ytp-ad-module",
      antiAdblockPopup: "ytd-enforcement-message-view-model"
    },
    customCSS: `
      /* YouTube Orijinal Logosunu Gizle */
      ytd-topbar-logo-renderer #logo-icon svg { display: none !important; }
      
      /* Ülke Kodunu (DE, TR vb.) Gizle */
      #country-code { display: none !important; }
      
      /* Yerine Kendi Premium Logomuzu Ekle (Gece Modu) */
      ytd-topbar-logo-renderer #logo-icon {
        content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 24' width='120' height='24'><path fill='%23FF0000' d='M23.4 3.7c-.3-1.1-1.1-1.9-2.2-2.2C19.3 1 12 1 12 1s-7.3 0-9.2.5c-1.1.3-1.9 1.1-2.2 2.2C.1 5.6.1 12 .1 12s0 6.4.5 8.3c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.2.5 9.2.5s7.3 0 9.2-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-8.3.5-8.3s0-6.4-.5-8.3z'/><path fill='%23FFF' d='M9.7 15.2V8.8l5.8 3.2-5.8 3.2z'/><text x='28' y='18' font-family='Roboto, Arial, sans-serif' font-size='18' font-weight='bold' letter-spacing='-0.5' fill='%23FFF'>Premium</text></svg>");
      }
      
      /* Gündüz Modu İçin Siyah Yazılı Premium Logosu */
      html[dark="false"] ytd-topbar-logo-renderer #logo-icon,
      html:not([dark]) ytd-topbar-logo-renderer #logo-icon {
        content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 24' width='120' height='24'><path fill='%23FF0000' d='M23.4 3.7c-.3-1.1-1.1-1.9-2.2-2.2C19.3 1 12 1 12 1s-7.3 0-9.2.5c-1.1.3-1.9 1.1-2.2 2.2C.1 5.6.1 12 .1 12s0 6.4.5 8.3c.3 1.1 1.1 1.9 2.2 2.2 1.9.5 9.2.5 9.2.5s7.3 0 9.2-.5c1.1-.3 1.9-1.1 2.2-2.2.5-1.9.5-8.3.5-8.3s0-6.4-.5-8.3z'/><path fill='%23FFF' d='M9.7 15.2V8.8l5.8 3.2-5.8 3.2z'/><text x='28' y='18' font-family='Roboto, Arial, sans-serif' font-size='18' font-weight='bold' letter-spacing='-0.5' fill='%23282828'>Premium</text></svg>");
      }
    `
  });
}
