'use strict';

const db = require('./lib/connectMongoose');
const Usuario = require('./models/Usuario');

db.once('open', async () => {
  try {

    await initUsuarios();
    db.close();

  } catch(err) {
    console.log('Hubo un error:', err);
    process.exit(1);
  }

});

async function initUsuarios() {
  await Usuario.deleteMany();
  await Usuario.insertMany([
    {
      email: 'admin@example.com',
      password: await Usuario.hashPassword('1234')
    }
  ]);

}
