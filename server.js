const express = require('express');
const fs = require('fs');
const path = require('path');
const uniqid = require('uniqid');

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`App is listening at http://localhost:${PORT}`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Get notes
app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/db/db.json'));
});

// Create new note
app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        
        const parsedData = JSON.parse(data);
        const newNote = req.body;
        newNote.id = uniqid();
        parsedData.push(newNote);

        fs.writeFile('./db/db.json', JSON.stringify(parsedData), 'utf8', (err) => {
            if (err) throw err;
            console.log('The file has been written');
            res.json({ message: 'Your note has been saved!', note: newNote });
        });
    });
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        
        const parsedNotes = JSON.parse(data);
        const newData = parsedNotes.filter((note) => note.id !== id);
        const finalDelete = JSON.stringify(newData);

        fs.writeFile('./db/db.json', finalDelete, 'utf8', (err) => {
            if (err) throw err;
            console.log('This note was deleted!');
            res.json({ message: 'This note was deleted.', deletedId: id });
        });
    });
});

// Update note
app.patch('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    const updateText = req.body;

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        
        const parsedNote = JSON.parse(data);

        for (let i = 0; i < parsedNote.length; i++) {
            if (parsedNote[i].id === id) {
                parsedNote[i] = updateText;
            }
        }

        const updateDB = JSON.stringify(parsedNote);
        fs.writeFile('./db/db.json', updateDB, 'utf8', () => console.log('Updated'));
        res.json({ message: 'Note updated successfully.', updatedNote: updateText });
    });
});

// Return the note.html file
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// Return the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
