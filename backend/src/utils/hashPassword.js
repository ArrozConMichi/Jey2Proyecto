const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Contraseña: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('---');
};

// Hashear la contraseña para los usuarios
const generateHashes = async () => {
  console.log('Generando hashes para password123...\n');
  await hashPassword('password123');
};

generateHashes();