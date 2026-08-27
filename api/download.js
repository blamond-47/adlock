const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
    // CORS Ayarları (Eklentinin hata vermemesi için)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tarayıcının ön-uçuş (Preflight) isteğine yanıt ver
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Gelen istekten URL ve kalite bilgisini al
    const { url, quality } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Lütfen bir YouTube URL\'si girin.' });
    }

    try {
        console.log(`Video bilgileri aliniyor: ${url}`);
        // Videonun detaylarını YouTube'dan çek
        const info = await ytdl.getInfo(url);
        
        let format;
        
        if (quality === 'audio') {
            // Sadece ses formatı (MP3 için en iyisi)
            format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        } else {
            // Video ve Sesin birleşik olduğu formatlar (Genelde 720p veya 360p). 
            // 1080p genelde ses ve videoyu ayırdığı için (DASH), direkt indirmede 720p en sorunsuzudur.
            let itag;
            if (quality === '1080' || quality === '720') {
                itag = 22; // 720p (Video + Ses birleşik)
            } else {
                itag = 18; // 360p (Video + Ses birleşik)
            }
            
            format = info.formats.find(f => f.itag === itag);
            
            // Eğer itag bulamazsa en iyi birleşik kaliteyi seç (fallback)
            if (!format) {
                format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo' });
            }
        }

        if (format && format.url) {
            // Doğrudan Google Video sunucularındaki indirme URL'sini döndür
            return res.status(200).json({ url: format.url, title: info.videoDetails.title });
        } else {
            return res.status(404).json({ error: 'İstediğiniz kalitede format bulunamadı.' });
        }

    } catch (error) {
        console.error('YTDL Hatasi:', error);
        return res.status(500).json({ error: 'Videoyu işlerken bir hata oluştu: ' + error.message });
    }
};
