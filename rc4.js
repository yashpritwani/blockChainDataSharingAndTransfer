const crypto = require('crypto');
const fs = require('fs');
const ecnryption_method = 'rc4';

// Encrypt data
async function encryptData(fileName) {
  let data = fs.readFileSync(`${fileName}.txt`);
  let random = crypto.randomBytes(8);
  let id = random.toString('hex');
  let hash = await generateIv(id);
  console.log(id, id.length, hash, hash.length);
  const cipher = crypto.createCipheriv(ecnryption_method, id, hash)
  let encrypted = Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex'));
  return fs.writeFile(`${id}.txt`, encrypted, (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log({ key: id });
      return { key: id };
    }
  });
}

// Decrypt data
async function decryptData(id) {
  let encryptedData = fs.readFileSync(`${id}.txt`);
  const buff = Buffer.from(encryptedData, 'base64');
  let hash = await generateIv(id);
  const decipher = crypto.createDecipheriv(ecnryption_method, id, hash)
  let decryptedData = decipher.update(buff.toString('utf8'), 'hex', 'utf8') +  decipher.final('utf8');
  console.log(decryptedData);
  return decryptedData;
}

// async function generatekey(id) {
//   return crypto.createHash('sha512').update(id).digest('hex').substring(0, 32);
// }

async function generateIv(id) {
  return crypto.createHash('sha512').update(id).digest('hex').substring(0, 24);
}

encryptData("hye");
// decryptData("bde48399242b993e");