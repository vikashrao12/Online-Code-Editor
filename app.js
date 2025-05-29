const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { output: null });
});

app.post('/run', (req, res) => {
  const code = req.body.code;
  const input = req.body.input;

  const tempDir = path.join(__dirname, 'temp');
  fs.writeFileSync(path.join(tempDir, 'code.py'), code);
  fs.writeFileSync(path.join(tempDir, 'input.txt'), input);

  // Docker run with volume mount
  const dockerCommand = `docker run --rm -v "${tempDir}:/app" online-code-editor`;

  exec(dockerCommand, (err, stdout, stderr) => {
    if (err) {
      return res.render('index', { output: stderr });
    }
    res.render('index', { output: stdout });
    
  });
});

app.listen(3001, () => {
  console.log('Server started at http://localhost:3001');
});
