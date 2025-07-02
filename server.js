// // node-api-server/server.js

// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// app.use(cors());

// // Configurer multer pour stocker les fichiers dans "uploads/"
// const upload = multer({
//   dest: 'uploads/',
// });

// app.post('/api/data', upload.single('avatar'), (req, res) => {
//     const { name, email } = req.body;
//     const avatar = req.file;

//     console.log('✅ Données reçues :', { name, email });
//     console.log('📁 Fichier reçu :', avatar.originalname);

//     // Optionnel : renommer le fichier pour conserver son extension
//     const oldPath = avatar.path;
//     const newPath = path.join('uploads', avatar.originalname);

//     fs.renameSync(oldPath, newPath);

//     res.json({
//         success: true,
//         message: `Merci ${name}, fichier ${avatar.originalname} reçu avec succès !`
//     });
// });

// app.listen(3001, () => {
//     console.log('🚀 API Node.js écoute sur http://localhost:3001');
// });

// server.js


const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS pour autoriser Laravel ou d'autres origines
app.use(cors());

// Middleware pour parser le JSON (si besoin)
app.use(express.json());

// 📂 Dossier de destination pour les fichiers uploadés
const uploadFolder = path.join(__dirname, 'uploads');

// Créer le dossier 'uploads' s’il n’existe pas
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configuration de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        // On garde le nom original
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 👇 Rendre les fichiers accessibles publiquement via /uploads/
app.use('/uploads', express.static(uploadFolder));

// 📩 Route POST qui reçoit les données du formulaire
app.post('/api/data', upload.single('avatar'), (req, res) => {
    const { name, email } = req.body;
    const avatar = req.file;

    if (!avatar) {
        return res.status(400).json({ success: false, message: 'Fichier manquant.' });
    }

    // 🔗 Générer une URL publique pour l’image
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${avatar.filename}`;

    console.log('✅ Données reçues :', { name, email });
    console.log('📁 Fichier reçu :', avatar.originalname, '->', fileUrl);

    res.json({
        success: true,
        message: `Merci ${name}, image bien reçue.`,
        imageUrl: fileUrl
    });
});

// ▶️ Lancer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
