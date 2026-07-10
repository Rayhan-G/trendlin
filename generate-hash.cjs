const bcrypt = require('bcryptjs'); 
const hash = bcrypt.hashSync('admin123', 10); 
console.log('Password: admin123'); 
console.log('Hash:', hash); 
