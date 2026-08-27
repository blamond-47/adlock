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
    }
  });
}
