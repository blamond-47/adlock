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
        let cssString = rules.hideSelectors.map(selector => `${selector} { display: none !important; }`).join('\n');
        
        // Eğer API'den özel CSS (Örn: Premium Logosu) geldiyse onu da ekle
        if (rules.customCSS) {
            cssString += '\n' + rules.customCSS;
        }
        
        style.textContent = cssString;
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
    
    // 1. YouTube Reklam Engelleyici Uyarı Ekranını (Anti-Adblock) Algılama ve Videoyu Devam Ettirme
    if (config.antiAdblockPopup) {
        const warningPopup = document.querySelector(config.antiAdblockPopup);
        // Eğer uyarı ekranı DOM'da belirdiyse ve video durdurulduysa
        if (warningPopup && video && video.paused) {
            console.log("YouTube engelleyici uyarısı algılandı, video zorla başlatılıyor...");
            video.play();
            
            // Eğer uyarı ekranında kapatma butonu varsa ona da tıkla
            const closeButton = document.querySelector("tp-yt-paper-dialog:has(ytd-enforcement-message-view-model) #dismiss-button");
            if (closeButton) closeButton.click();
        }
    }
    
    // 2. Reklam oynatılıyorsa ileri sar ve geç
    if (adContainer && adContainer.children.length > 0 && video) {
        if (!isNaN(video.duration) && video.duration > 0 && video.currentTime < video.duration) {
            video.currentTime = video.duration;
            console.log("Reklam videosu ileri sarıldı!");
        }
        
        const skipButton = document.querySelector(config.skipButton);
        if (skipButton) {
            skipButton.click();
            console.log("Reklam atla butonuna basıldı!");
        }
    }
}
