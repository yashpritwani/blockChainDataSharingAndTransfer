const CryptoJS = require('crypto-js');
const crypto = require("crypto");
const fs = require('fs');
const bcrypt = require("bcrypt");
const path = require('path');
const saltRounds = 8;

function encryptFileWithAES(filePath) {
  // Read the file content
  fs.readFile(filePath, 'utf8', async function(err, data){
    var id = crypto.randomBytes(32);
    const buff = Buffer.from(id, "utf-8");

    // convert buffer to string
    const resultStr = buff.toString();
    console.log("poc is ", buff,resultStr);
    let savedId = id;
    // Encrypt the file content with AES
    let hash = await generatekey(id);
    // console.log(hash, hash.length, Buffer.from(id), Buffer.from(hash));
    // const encrypted = CryptoJS.AES.encrypt(data, hash);

    const iv = crypto.randomBytes(16);
    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv('aes-256-cbc', buff, iv);
    
    // Updating text
    let encrypted = cipher.update(data);
    
    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    fs.writeFile(`${hash}.txt`, encrypted.toString('hex'), (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        console.log(fs.readFileSync(`${hash}.txt`, "utf8"));
        console.log("id to be recorded is", id);
        console.log({
          iv: iv.toString('hex'),
          key: id,
          data:encrypted.toString('hex')
        });
        // Return the encrypted content as a string
        return {
          iv: iv.toString('hex'),
          key: savedId.toString(),
          data:encrypted.toString('hex')
        };
      }
    });
  });

}

async function decryptFileWithAES(key) {
  const files = fs.readdirSync(process.cwd());
  files.forEach(async file => {
    console.log("Reading file", file, key.toString(), await validateKey(key.toString(),path.parse(file).name));
    if(await validateKey(key.toString(),path.parse(file).name)){
      let encryptedFilePath = `${path.parse(file).name}.txt`;
      let decryptedFilePath = `${path.parse(file).name}-decrypt.txt`
      
      // read the encrypted file into memory
      let encryptedData = fs.readFileSync(encryptedFilePath);
      
      // create a decipher object with the same algorithm and key
      // const decipher = crypto.createDecipher('aes-256-cbc', path.parse(file).name);
      
      // create a read stream for the encrypted file and a write stream for the decrypted file
      const encryptedStream = fs.createReadStream(encryptedFilePath);
      const decryptedStream = fs.createWriteStream(decryptedFilePath);
      // Defininf iv
      const iv = Buffer.alloc(16, 0);
      const decipher = crypto.createDecipheriv('aes-256-cbc', path.parse(file).name, iv);

      let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

      decryptedData += decipher.final("utf8");

      console.log("Decrypted message: " + decryptedData);



      // pipe the streams through the decipher object
      encryptedStream.pipe(decipher).pipe(decryptedStream);
      
      // log a message when the decryption is complete
      return decryptedStream.on('finish', () => {
        console.log('Decryption complete.');
        
        // read the decrypted file into memory
        const decryptedData = fs.readFileSync(decryptedFilePath);
        
        // send the decrypted data back to the user
        // e.g. by sending it as an HTTP response
        return decryptedData;
      });
    }
  });

}

async function generatekey(id) {
  console.log("Generating key",  id);
  return await bcrypt
  .hash(id, saltRounds)
  .then(async hash => {
    return hash
  })
  .catch(err => console.error(err.message))
}

async function validateKey(password,hash) {
  return bcrypt.compareSync(password, hash);       
}

module.exports = {
  encryptFileWithAES,
  decryptFileWithAES
}

encryptFileWithAES('hye.txt');
decryptFileWithAES('<Buffer 23 5d 66 30 58 ba fc 30 0c 59 7a 93 6a 2b 45 70 1d 1f 87 49 e7 99 0d 09 d9 9c 5a 43 69 47 9f b4>');