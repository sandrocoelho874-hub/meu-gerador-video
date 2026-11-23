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
        
        const promptOriginal = req.body.prompt || "a beautiful scene";
        const estilo = req.body.estilo || "Realistic";

        // MÁGICA 1: Monta o prompt básico
        let promptCompleto = `A ${estilo} style image of ${promptOriginal}, high quality, masterpiece`;
        
        // MÁGICA 2: Se o usuário pedir algo impossível (voar/flutuar) e o estilo for Realista, 
        // o código troca automaticamente para Surrealista para a IA não ignorar o pedido.
        if (promptOriginal.toLowerCase().includes('voando') || promptOriginal.toLowerCase().includes('flutuando')) {
            if (estilo === 'Realistic') {
                promptCompleto = `A surrealist fantasy style image of ${promptOriginal}, highly detailed, magical realism, masterpiece`;
            }
        }

        const promptEncoded = encodeURIComponent(promptCompleto);
        
        // MÁGICA 3: Prompt negativo (diz para a IA o que NÃO desenhar)
        const negativePrompt = encodeURIComponent("realistic ground, street, pavement, boring, low quality");
        
        // MÁGICA 4: Parâmetros enhance=true (melhora o prompt) e model=flux (IA mais inteligente)
        const url = `https://image.pollinations.ai/prompt/${promptEncoded}?width=1024&height=1024&nologo=true&enhance=true&model=flux&negative_prompt=${negativePrompt}`;
        
        console.log("URL gerada:", url);

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
