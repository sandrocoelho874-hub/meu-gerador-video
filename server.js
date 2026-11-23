const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.static(__dirname));
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/gerar-video', upload.single('image'), async (req, res) => {
    try {
        console.log("1. Recebi imagem, preparando para Pollinations.ai...");
        const prompt = encodeURIComponent(req.body.prompt || "a beautiful scene");
        const url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`;
        
        const resposta = await axios.get(url, { responseType: 'arraybuffer' });
        const imagemBase64 = Buffer.from(resposta.data).toString('base64');
        const imagemUrl = `data:image/jpeg;base64,${imagemBase64}`;

        console.log("3. Imagem pronta para exibir!");
        res.json({ videoUrl: imagemUrl });

    } catch (erro) {
        console.error("ERRO:", erro.message);
        res.status(500).json({ erro: "Falha ao gerar." });
    }
});

app.listen(process.env.PORT || 3000, () => { 
    console.log('✅ Servidor rodando!'); 
});
