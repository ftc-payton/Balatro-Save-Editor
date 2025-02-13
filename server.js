const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pako = require('pako');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 80;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/inflate', upload.single('file'), (req, res) => {
    const inputFilePath = req.file.path;
    const inflatedFilePath = path.join(__dirname, 'uploads', 'inflated.txt');
    
    try {
        const compressedData = fs.readFileSync(inputFilePath);
        const inflatedData = pako.inflateRaw(compressedData, { to: 'string' });
        fs.writeFileSync(inflatedFilePath, inflatedData);
        
        res.json({ success: true, content: inflatedData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error inflating file', error });
    }
});

app.post('/deflate', (req, res) => {
    const { content } = req.body;
    const deflatedFilePath = path.join(__dirname, 'uploads', 'deflated.jkr');
    
    try {
        const deflatedData = pako.deflateRaw(content);
        fs.writeFileSync(deflatedFilePath, deflatedData);
        res.download(deflatedFilePath, 'deflated.jkr');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deflating file', error });
    }
});

const clearUploadsFolder = () => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(uploadDir, file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log(`Deleted ${filePath}`);
                }
            });
        });
    });
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    clearUploadsFolder()
});
