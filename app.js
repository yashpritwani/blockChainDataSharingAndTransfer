const express = require('express');
const app = express();
const PORT = 6767;
const Web3 = require('web3');
const cors = require('cors');
// create a new Web3 instance and connect to the Ethereum node
const web3 = new Web3('http://localhost:8545');
const { encryptFileWithAES, decryptFileWithAES } = require('./aes');

// specify the contract address and ABI
const contractAddress = ''; // specify contract address here
const abi = [
  // specify the ABI for your contract here
];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/uploadFile", async(req, res) => {
  try{    
    // storeEncryptedFileOnBlockchain

    // Connect to the blockchain and load the contract
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    // Encrypt the file with AES
    const encryptedContent = encryptFileWithAES(req.body.filePath); 

    // Store the encrypted content on the blockchain
    let resp = await contract.methods.storeFile(encryptedContent).send({ from: '0x...', gas: 1000000 });

    if(resp) res.status(200).json({message: "File saved successful",resp})
    else res.status(500).json({message: "Error occured", resp})
  } catch(err) {
      res.json({err: err})
  }
})

app.post("/downloadFile", async(req, res) => {
  try {
  // create a contract instance using the address and ABI
  const contract = new web3.eth.Contract(abi, contractAddress);

  // retrieve the encrypted file from the blockchain
  contract.methods.getEncryptedFile().call((error, result) => {
    if (error) {
      console.error(error);
      return;
    }
    let encryptedFilePath = `${req.body.key}.txt`;
    
    // save the encrypted file to a local file
    let encryptedData = Buffer.from(result.slice(2), 'hex');
    fs.writeFileSync(encryptedFilePath, encryptedData);

    let decryptedData = decryptFileWithAES(result);
    res.send(decryptedData);
  });
  } catch (err) {
    res.status(400).send("Error occured");
  }
})


app.listen(PORT, () => console.log('Server running on '+PORT));