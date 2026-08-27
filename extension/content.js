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
        handleDownloadPopup();
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

// İndirme (Download) Premium uyarısını kendi indirme penceremize çevirme fonksiyonu
function handleDownloadPopup() {
    if (!rules || !rules.downloadConfig) return;
    const config = rules.downloadConfig;
    const popup = document.querySelector(config.popupSelector);
    
    // Eğer Premium İndirme uyarı penceresi çıktıysa ve henüz bizim butonumuzu eklemediysek
    if (popup && !popup.dataset.hijacked) {
        popup.dataset.hijacked = "true";
        console.log("Premium İndirme penceresi yakalandı! Arayüz değiştiriliyor...");
        
        // YouTube'un Polymer motorunun elementleri çizmesini beklemek için çok kısa bir süre tanıyoruz
        setTimeout(() => {
            // Başlığı gizle ve yenisini ekle
            const title = popup.querySelector("#title");
            if (title) {
                title.style.display = "none";
                const customTitle = document.createElement("div");
                customTitle.innerHTML = "<span style='color: #4CAF50; font-size: 20px; font-weight: bold;'>Videoyu İndir (AdLock)</span>";
                title.parentNode.insertBefore(customTitle, title);
            }
            
            // Alt başlığı Değiştir
            const subtitle = popup.querySelector("#subtitle");
            if (subtitle) subtitle.innerHTML = "Lütfen indirmek istediğiniz kaliteyi seçin. Video doğrudan cihazınıza kaydedilecektir.";
            
            // Orijinal çözünürlük ayarlarını tamamen gizleyip, kendi ayarlarımızı DOM'a yeni bir element olarak ekliyoruz
            const options = popup.querySelector("#premium-options");
            if (options) {
                options.style.display = "none";
                const customOptions = document.createElement("div");
                customOptions.innerHTML = `
                    <div style="padding: 15px; margin-top: 10px; border-radius: 8px; background-color: rgba(255, 255, 255, 0.1); color: var(--yt-spec-text-primary, white); font-size: 14px;">
                       <div style="margin-bottom: 8px; font-weight: bold; font-size: 16px;">Format ve Kalite:</div>
                       <label style="display: block; margin: 8px 0; cursor: pointer;"><input type="radio" name="adlock_res" value="1080" checked style="margin-right: 8px; transform: scale(1.2);"> 1080p (FHD Yüksek Kalite)</label>
                       <label style="display: block; margin: 8px 0; cursor: pointer;"><input type="radio" name="adlock_res" value="720" style="margin-right: 8px; transform: scale(1.2);"> 720p (HD Kalite)</label>
                       <label style="display: block; margin: 8px 0; cursor: pointer;"><input type="radio" name="adlock_res" value="360" style="margin-right: 8px; transform: scale(1.2);"> 360p (Düşük Boyut)</label>
                       <label style="display: block; margin: 8px 0; cursor: pointer;"><input type="radio" name="adlock_res" value="audio" style="margin-right: 8px; transform: scale(1.2);"> Sadece Ses (MP3 Müzik)</label>
                    </div>
                `;
                options.parentNode.insertBefore(customOptions, options);
            }
            
            // Kullanım şartları yazısını gizle
            const description = popup.querySelector("#description");
            if (description) description.style.display = "none";
            
            // "Start Trial" butonunu gizle ve bizim "İndir" butonumuzu ayrı bir element olarak ekle
            const actionBtn = popup.querySelector("#action-button");
            if (actionBtn) {
                actionBtn.style.display = "none";
                
                const newBtn = document.createElement("button");
                newBtn.textContent = "İndirmeyi Başlat";
                newBtn.style.backgroundColor = "#4CAF50";
                newBtn.style.color = "white";
                newBtn.style.borderRadius = "18px";
                newBtn.style.padding = "10px 16px";
                newBtn.style.fontWeight = "bold";
                newBtn.style.border = "none";
                newBtn.style.cursor = "pointer";
                newBtn.style.fontSize = "14px";
                
                newBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const selectedInput = document.querySelector('input[name="adlock_res"]:checked');
                    const selected = selectedInput ? selectedInput.value : "1080";
                    
                    newBtn.textContent = "Bağlantı Hazırlanıyor... Lütfen Bekleyin";
                    newBtn.style.opacity = "0.7";
                    newBtn.style.pointerEvents = "none";
                    
                    try {
                        const isAudio = selected === "audio";
                        const quality = isAudio ? "720" : selected;
                        
                        // Cobalt API için alternatif sunucular listesi (Biri kapanırsa diğeri çalışır)
                        const instances = [
                            "https://cobalt.kwiatekmateusz.pl/api/json",
                            "https://dl.oh.birb.it/api/json",
                            "https://cobalt-api.pepegavod.ru/api/json",
                            "https://co.wuk.sh/api/json"
                        ];
                        
                        let success = false;
                        
                        for (const apiUrl of instances) {
                            try {
                                console.log("Deniyor: " + apiUrl);
                                const res = await fetch(apiUrl, {
                                    method: "POST",
                                    headers: {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        url: window.location.href,
                                        vQuality: quality,
                                        isAudioOnly: isAudio
                                    })
                                });
                                
                                const data = await res.json();
                                // Eğer hata döndürmediyse ve url verdiyse
                                if (data.url && data.status !== "error") {
                                    newBtn.textContent = "İndirme Başladı! ✔️";
                                    newBtn.style.backgroundColor = "#2e7d32";
                                    
                                    // İndirmeyi doğrudan tetikle
                                    const a = document.createElement('a');
                                    a.href = data.url;
                                    a.download = '';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    
                                    // Başarılı olunca 2.5 saniye sonra pencereyi kapat
                                    setTimeout(() => {
                                       const closeBtn = popup.querySelector(config.closeButton);
                                       if (closeBtn) closeBtn.click();
                                    }, 2500);
                                    
                                    success = true;
                                    break; // Döngüden çık
                                }
                            } catch (e) {
                                console.log(apiUrl + " başarısız oldu, diğerine geçiliyor...");
                            }
                        }
                        
                        if (!success) {
                            throw new Error("Tüm API sunucuları meşgul veya hata verdi.");
                        }
                        
                    } catch(err) {
                        console.error("Direct download hatası:", err);
                        newBtn.textContent = "Hata! Alternatif Açılıyor...";
                        setTimeout(() => {
                            window.open("https://cobalt.tools/?u=" + encodeURIComponent(window.location.href), "_blank");
                            const closeBtn = popup.querySelector(config.closeButton);
                            if (closeBtn) closeBtn.click();
                        }, 1500);
                    }
                });
                
                actionBtn.parentNode.insertBefore(newBtn, actionBtn);
            }
        }, 150); // 150ms gecikme ile Polymer'in inatçı yapısını aşıyoruz
    }
}
