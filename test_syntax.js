const fs = require('fs'); const code = fs.readFileSync('game.js', 'utf8'); try { new Function(code); console.log('Syntax OK'); } catch (e) { console.error('Syntax Error:', e); }
