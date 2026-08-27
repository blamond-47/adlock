// Kendi Vercel linkinizi buraya yazabilirsiniz. Örneğin: "https://benim-projem.vercel.app/api/rules"
// Şimdilik API çalışana kadar hata almamak için var olmayan bir link bırakıyoruz.
const VERCEL_API_URL = "https://kendi-vercel-adresiniz.vercel.app/api/rules";

// Yedek kurallar (Vercel API çalışmazsa veya henüz deploy edilmediyse bu kurallar kullanılır)
const fallbackRules = {
    version: "1.0",
    hideSelectors: [
      ".ytd-ad-slot-renderer",
      ".ytd-companion-slot-renderer",
      "#player-ads",
      ".ytp-ad-overlay-container"
    ],
    skipConfig: {
      videoPlayer: ".html5-main-video",
      skipButton: ".ytp-ad-skip-button-modern, .ytp-ad-skip-button, .ytp-ad-skip-button-slot",
      adContainer: ".video-ads.ytp-ad-module"
    }
};

// Eklenti yüklendiğinde kuralları Vercel'den çekmeye çalış
chrome.runtime.onInstalled.addListener(() => {
    fetchRules();
});

async function fetchRules() {
    try {
        console.log("Kurallar Vercel'den çekiliyor...");
        const response = await fetch(VERCEL_API_URL);
        if (response.ok) {
            const data = await response.json();
            // Kuralları tarayıcının yerel hafızasına kaydet
            chrome.storage.local.set({ adblockRules: data }, () => {
                console.log("Kurallar güncellendi:", data);
            });
        } else {
            throw new Error("API hatası");
        }
    } catch (err) {
        console.warn("Vercel API'ye bağlanılamadı. Yedek kurallar kullanılıyor.", err);
        // Hata durumunda yedek kuralları kaydet
        chrome.storage.local.set({ adblockRules: fallbackRules });
    }
}
