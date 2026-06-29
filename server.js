const express = require('express');
const crypto  = require('crypto');
const http    = require('http');
const Blockchain = require('./blockchain');

const app    = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static('public'));

let users = [];
let nextId = 1;
const userBlockchain = new Blockchain();

function hashObject(obj) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(obj))
        .digest('hex');
}

app.get('/api/users', (req, res) => {
    const isBlockchainValid = userBlockchain.isChainValid();

    let isTampered = false;
    const actionBlocks = userBlockchain.chain.slice(1);

    for (let i = 0; i < actionBlocks.length; i++) {
        const block = actionBlocks[i];
        if (block.action === 'DELETE') continue;

        const recordedHash = block.data;
    }

    res.json({
        blockchainValid: isBlockchainValid,
        isTampered: !isBlockchainValid,
        users,
        blockchain: userBlockchain.chain
    });
});

app.post('/api/users', (req, res) => {
    const { username, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).json({ success: false, message: 'Sva polja su obavezna.' });
    }

    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) {
        return res.status(409).json({ success: false, message: 'Korisnik sa tim korisničkim imenom ili email-om već postoji.' });
    }

    const newUser = {
        id: nextId++,
        username,
        email,
        role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const userHash = hashObject(newUser);
    const block = userBlockchain.addAction('REGISTER', userHash);

    res.status(201).json({
        success: true,
        message: `Korisnik "${username}" je uspešno registrovan.`,
        user: newUser,
        block
    });
});

app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email, role } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    const oldUser = { ...users[userIndex] };

    users[userIndex] = {
        ...users[userIndex],
        username: username || users[userIndex].username,
        email:    email    || users[userIndex].email,
        role:     role     || users[userIndex].role,
        updatedAt: new Date().toISOString()
    };

    const changeHash = hashObject({ before: oldUser, after: users[userIndex] });
    const block = userBlockchain.addAction('UPDATE', changeHash);

    res.json({
        success: true,
        message: `Korisnik "${users[userIndex].username}" je uspešno izmenjen.`,
        user: users[userIndex],
        block
    });
});

app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);

    const deleteHash = hashObject({ deleted: deletedUser, deletedAt: new Date().toISOString() });
    const block = userBlockchain.addAction('DELETE', deleteHash);

    res.json({
        success: true,
        message: `Korisnik "${deletedUser.username}" je uspešno obrisan.`,
        block
    });
});

app.post('/api/tamper', (req, res) => {
    if (users.length === 0) {
        return res.status(400).json({ success: false, message: 'Nema korisnika za manipulaciju.' });
    }
    if (userBlockchain.chain.length > 1) {
        userBlockchain.chain[1].data = 'TAMPERED_HASH_000000000000000000000000000000';
    }
    res.json({ success: true, message: 'Lanac je uspešno kompromitovan (simulacija napada).' });
});

server.listen(3000, () => {
    console.log('Server radi na http://localhost:3000');
});
