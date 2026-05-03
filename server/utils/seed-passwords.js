/**
 * Prints bcrypt hashes for known passwords. Run once when seeding db.json.
 *
 *   node server/utils/seed-passwords.js
 *   node server/utils/seed-passwords.js MyOtherPassword
 */
const bcrypt = require('bcryptjs');

const passwords = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['Password123!'];

for (const plain of passwords) {
  const hash = bcrypt.hashSync(plain, 10);
  // eslint-disable-next-line no-console
  console.log(`${plain}\t${hash}`);
}
