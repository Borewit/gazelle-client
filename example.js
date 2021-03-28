const gazelle = require('./lib');

const client = new gazelle.GazelleClient('https://what.cd', 'username', 'password');

(async () => {

  try {
    const data = await client.getIndex();
    console.log(data);
  } catch(error) {
    console.error(error.message);
  }
})();
