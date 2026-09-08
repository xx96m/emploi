const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Chemin du fichier data.json
const DATA_FILE = path.join(__dirname, 'data.json');

console.log('🚀 Serveur démarré sur http://localhost:3000');

// ============================================================
//  FONCTIONS DE LECTURE/ÉCRITURE
// ============================================================

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const defaultData = {
                formateurs: [
                    { id: 'f1', nom: 'Dupont', prenom: 'Jean', email: 'jean@email.com', tel: '0612345678', statut: 'permanent' },
                    { id: 'f2', nom: 'Martin', prenom: 'Sophie', email: 'sophie@email.com', tel: '0623456789', statut: 'vacataire' },
                    { id: 'f3', nom: 'Durand', prenom: 'Pierre', email: 'pierre@email.com', tel: '0634567890', statut: 'stagiaire' }
                ],
                groupes: [
                    { id: 'g1', code: 'DEV-101', nom: 'Développement Web' },
                    { id: 'g2', code: 'DATA-202', nom: 'Analyse de Données' },
                    { id: 'g3', code: 'SEC-303', nom: 'Sécurité Informatique' }
                ],
                salles: [
                    { id: 's1', code: 'SALLE-101', nom: 'Salle 101', type: 'salle' },
                    { id: 's2', code: 'ATELIER-202', nom: 'Atelier 202', type: 'atelier' },
                    { id: 's3', code: 'SALLE-303', nom: 'Salle 303', type: 'salle' }
                ],
                sessions: [
                    { id: 'ses1', jour: 0, heure: 9, duree: 2, formateurId: 'f1', groupeId: 'g1', salleId: 's1', matiere: 'Développement Web', semaine: 0 },
                    { id: 'ses2', jour: 1, heure: 14, duree: 1.5, formateurId: 'f2', groupeId: 'g2', salleId: 's2', matiere: 'Analyse de Données', semaine: 0 },
                    { id: 'ses3', jour: 2, heure: 10, duree: 1, formateurId: 'f3', groupeId: 'g3', salleId: 's3', matiere: 'Sécurité', semaine: 0 }
                ],
                affectations: [
                    { formateurId: 'f1', groupeId: 'g1' },
                    { formateurId: 'f1', groupeId: 'g2' },
                    { formateurId: 'f2', groupeId: 'g2' },
                    { formateurId: 'f3', groupeId: 'g3' }
                ]
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        console.error('❌ Erreur lecture:', error);
        return { formateurs: [], groupes: [], salles: [], sessions: [], affectations: [] };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Données sauvegardées');
        return true;
    } catch (error) {
        console.error('❌ Erreur écriture:', error);
        return false;
    }
}

// ============================================================
//  ROUTES API
// ============================================================

// Route racine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test API
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API fonctionnelle !', timestamp: new Date().toISOString() });
});

// Vérification des données
app.get('/api/check', (req, res) => {
    const data = readData();
    res.json({
        formateurs: data.formateurs.length,
        groupes: data.groupes.length,
        salles: data.salles.length,
        sessions: data.sessions.length,
        affectations: data.affectations.length
    });
});

// --- Formateurs ---
app.get('/api/formateurs', (req, res) => {
    const data = readData();
    res.json(data.formateurs);
});

app.post('/api/formateurs', (req, res) => {
    const data = readData();
    data.formateurs.push(req.body);
    writeData(data);
    res.status(201).json(req.body);
});

app.put('/api/formateurs/:id', (req, res) => {
    const data = readData();
    const index = data.formateurs.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.formateurs[index] = { ...data.formateurs[index], ...req.body };
    writeData(data);
    res.json(data.formateurs[index]);
});

app.delete('/api/formateurs/:id', (req, res) => {
    const data = readData();
    data.formateurs = data.formateurs.filter(f => f.id !== req.params.id);
    data.sessions = data.sessions.filter(s => s.formateurId !== req.params.id);
    data.affectations = data.affectations.filter(a => a.formateurId !== req.params.id);
    writeData(data);
    res.status(204).send();
});

// --- Groupes ---
app.get('/api/groupes', (req, res) => {
    const data = readData();
    res.json(data.groupes);
});

app.post('/api/groupes', (req, res) => {
    const data = readData();
    data.groupes.push(req.body);
    writeData(data);
    res.status(201).json(req.body);
});

app.put('/api/groupes/:id', (req, res) => {
    const data = readData();
    const index = data.groupes.findIndex(g => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.groupes[index] = { ...data.groupes[index], ...req.body };
    writeData(data);
    res.json(data.groupes[index]);
});

app.delete('/api/groupes/:id', (req, res) => {
    const data = readData();
    data.groupes = data.groupes.filter(g => g.id !== req.params.id);
    data.sessions = data.sessions.filter(s => s.groupeId !== req.params.id);
    data.affectations = data.affectations.filter(a => a.groupeId !== req.params.id);
    writeData(data);
    res.status(204).send();
});

// --- Salles ---
app.get('/api/salles', (req, res) => {
    const data = readData();
    res.json(data.salles);
});

app.post('/api/salles', (req, res) => {
    const data = readData();
    data.salles.push(req.body);
    writeData(data);
    res.status(201).json(req.body);
});

app.put('/api/salles/:id', (req, res) => {
    const data = readData();
    const index = data.salles.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.salles[index] = { ...data.salles[index], ...req.body };
    writeData(data);
    res.json(data.salles[index]);
});

app.delete('/api/salles/:id', (req, res) => {
    const data = readData();
    data.salles = data.salles.filter(s => s.id !== req.params.id);
    writeData(data);
    res.status(204).send();
});

// --- Sessions ---
app.get('/api/sessions', (req, res) => {
    const data = readData();
    res.json(data.sessions);
});

app.get('/api/sessions/:id', (req, res) => {
    const data = readData();
    const session = data.sessions.find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: 'Non trouvé' });
    res.json(session);
});

app.post('/api/sessions', (req, res) => {
    const data = readData();
    data.sessions.push(req.body);
    writeData(data);
    res.status(201).json(req.body);
});

app.put('/api/sessions/:id', (req, res) => {
    const data = readData();
    const index = data.sessions.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Non trouvé' });
    data.sessions[index] = { ...data.sessions[index], ...req.body };
    writeData(data);
    res.json(data.sessions[index]);
});

app.delete('/api/sessions/:id', (req, res) => {
    const data = readData();
    data.sessions = data.sessions.filter(s => s.id !== req.params.id);
    writeData(data);
    res.status(204).send();
});

// --- Affectations ---
app.get('/api/affectations', (req, res) => {
    const data = readData();
    res.json(data.affectations);
});

app.post('/api/affectations', (req, res) => {
    const data = readData();
    const exists = data.affectations.some(a => 
        a.formateurId === req.body.formateurId && a.groupeId === req.body.groupeId
    );
    if (!exists) {
        data.affectations.push(req.body);
        writeData(data);
    }
    res.status(201).json(req.body);
});

app.delete('/api/affectations/:formateurId/:groupeId', (req, res) => {
    const data = readData();
    data.affectations = data.affectations.filter(a => 
        !(a.formateurId === req.params.formateurId && a.groupeId === req.params.groupeId)
    );
    writeData(data);
    res.status(204).send();
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`\n✅ Serveur démarré sur http://localhost:${port}`);
    console.log(`📁 Données: ${DATA_FILE}`);
    console.log(`\n🔗 Tester l'API: http://localhost:${port}/api/test`);
    console.log(`🔗 Vérifier les données: http://localhost:${port}/api/check`);
    console.log(`🔗 Ouvrir l'application: http://localhost:${port}\n`);
});