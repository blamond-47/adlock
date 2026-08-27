let rules = null;

// 1. Kuralları tarayıcının depolama alanından (background.js'in kaydettiği yerden) çek
chrome.storage.local.get(['adblockRules'], (result) => {
    if (result.adblockRules) {
        rules = result.adblockRules;
        initAdblock();
    }
});

function initAdblock() {
    console.log("Eğitim Amaçlı Reklam Engelleyici başlatıldı. Kurallar yüklendi:", rules);
    
    // 2. Banner ve statik görsel reklamları gizlemek için CSS enjekte et
    if (rules.hideSelectors && rules.hideSelectors.length > 0) {
        const style = document.createElement('style');
        // Örneğin: .ytd-ad-slot-renderer { display: none !important; }
        style.textContent = rules.hideSelectors.map(selector => `${selector} { display: none !important; }`).join('\n');
        document.head.appendChild(style);
    }

    // 3. Video reklamları (Auto-skip) geçmek için sayfayı izlemeye başla
    // DOM'da (sayfada) herhangi bir değişiklik olduğunda handleVideoAds fonksiyonunu tetikle
    const observer = new MutationObserver(() => {
        handleVideoAds();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function handleVideoAds() {
    if (!rules || !rules.skipConfig) return;
    
    const config = rules.skipConfig;
    const adContainer = document.querySelector(config.adContainer);
    const video = document.querySelector(config.videoPlayer);
    
    // Eğer reklam oynatıcısı aktifse (içinde çocuk element varsa) ve ana video bulunduysa
    if (adContainer && adContainer.children.length > 0 && video) {
        
        // Reklam videosunun oynadığını fark edersek, videonun süresini hemen son saniyesine alıyoruz
        // Bu, reklamın bitmiş gibi algılanmasını sağlar.
        if (!isNaN(video.duration) && video.duration > 0 && video.currentTime < video.duration) {
            video.currentTime = video.duration;
            console.log("Reklam videosu ileri sarıldı!");
        }
        
        // "Reklamı Geç" (Skip Ad) butonu çıktıysa, bizim yerimize otomatik tıkla
        const skipButton = document.querySelector(config.skipButton);
        if (skipButton) {
            skipButton.click();
            console.log("Reklam atla butonuna basıldı!");
        }
    }
}
