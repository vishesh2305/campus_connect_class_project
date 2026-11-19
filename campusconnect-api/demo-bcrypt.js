import bcrypt from 'bcryptjs';

const hash1 = await bcrypt.hash('mypassword',10);
const hash2 = await bcrypt.hash('mypassword',10);
console.log(hash1);
console.log(hash2);
console.log('same password, same hash?', hash1 === hash2);
console.log('right password:', await bcrypt.compare('mypassword', hash1));
console.log('wrong password:', await bcrypt.compare('wrong', hash1));

