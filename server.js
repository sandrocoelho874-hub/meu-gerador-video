const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ROTA DE PING PARA O UPTIMEROBOT
app.get('/ping', (req, res) => res.send('OK'));

app.post('/api/gerar-video', async (req, res) => {
    try {
        const promptOriginal = req.body.prompt || "uma bela cena";
        console.log("1. Recebi o pedido em PT:", promptOriginal);
        
        const urlTraducao = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(promptOriginal)}`;
        const respTraducao = await axios.get(urlTraducao);
        const promptTraduzido = respTraducao.data[0][0][0];
        
        console.log("2. Traduzido para EN:", promptTraduzido);

        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptTraduzido)}?width=512&height=512&nologo=true&model=flux`;
        
        console.log("3. Pedindo para a IA...");

        const resposta = await axios.get(url, { responseType: 'arraybuffer', timeout: 45000 });
        const imagemBase64 = Buffer.from(resposta.data).toString('base64');
        const imagemUrl = `data:image/jpeg;base64,${imagemBase64}`;

        console.log("4. Imagem pronta!");
        res.json({ videoUrl: imagemUrl });

    } catch (erro) {
        console.error("ERRO NO SERVIDOR:", erro.message);
        res.status(500).json({ erro: "Falha ao gerar." });
    }
});

app.listen(process.env.PORT || 3000, () => { 
    console.log('✅ Servidor Simples rodando!'); 
});
