require('@nomiclabs/hardhat-waffle');

const URL = "https://polygon-mumbai.g.alchemy.com/v2/sO38kEWnaVirRjDxkvsQgxEScXPlVfME";
const privatekey ='a0728c74ec60eb831e3a2da86d15f7c1906ad07b84298f6a5499af1fbb5b09a9';

task("accounts","Prints the list of accounts", async(taskArgs,hre)=>{
  const accounts = await hre.ethers.getSigners();

  for(const account of accounts){
   console.log(account.address);
  }
})


module.exports = {
  solidity: '0.8.0',
  defaultNetwork: "polygon",
  networks: {
    hardhat:{},
    polygon: {
      url: URL,
      accounts: [privatekey],
    },
  },
};

//https://polygon-mumbai.g.alchemy.com/v2/sO38kEWnaVirRjDxkvsQgxEScXPlVfME

//accounts : a0728c74ec60eb831e3a2da86d15f7c1906ad07b84298f6a5499af1fbb5b09a9
