const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('dataFile'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('File read error');
            return;
        }
        const parsedData = parseData(data);
        const stats = calculateStats(parsedData);
        res.json(stats);
    });
});

function parseData(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split('\t');
    const cores = headers.slice(1);

    const result = {};
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const task = values[0];
        if (!result[task]) {
            result[task] = [];
        }
        result[task].push(values.slice(1).map(Number));
    }

    return { cores, result };
}

function calculateStats(data) {
    const { cores, result } = data;
    const stats = {
        cores: {},
        tasks: {}
    };

    cores.forEach((core, coreIndex) => {
        stats.cores[core] = { min: [], max: [], avg: [] };
        Object.keys(result).forEach(task => {
            const coreData = result[task].map(row => row[coreIndex]);
            const min = Math.min(...coreData);
            const max = Math.max(...coreData);
            const avg = coreData.reduce((sum, value) => sum + value, 0) / coreData.length;
            stats.cores[core].min.push(min);
            stats.cores[core].max.push(max);
            stats.cores[core].avg.push(avg);
        });
    });

    Object.keys(result).forEach(task => {
        stats.tasks[task] = { min: [], max: [], avg: [] };
        result[task].forEach((coreData, coreIndex) => {
            const min = Math.min(...coreData);
            const max = Math.max(...coreData);
            const avg = coreData.reduce((sum, value) => sum + value, 0) / coreData.length;
            stats.tasks[task].min.push(min);
            stats.tasks[task].max.push(max);
            stats.tasks[task].avg.push(avg);
        });
    });

    return { cores, stats };
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
