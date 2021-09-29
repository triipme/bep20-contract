# BEP20 TIIM Token use Hardhat development environment

T.B.D

# Setup project with hardhat

1. Install hardhat `npm install --save-dev hardhat`
2. Install packages: `npm install`
3. Install shorthand: `npm i -g hardhat-shorthand` after install can run hardhat command by `hh` instead of `npx hardhat`

# Setup env vars

1. PRIVATE_KEY: your private key has native coin(ETH|BNB...) with corresponding network
2. ETHERSCAN_API_KEY: create api key from [eth](https://etherscan.io/myapikey), or [bsc](https://bscscan.com/myapikey)

# Compile, deploy and verify code on testnet

Get BNB on testnet at [faucet](https://testnet.binance.org/faucet-smart)

1. `hh compile`
2. Deploy contract: `hh run scripts/deploy.js --network bsc_testnet`
3. Verify contract: `hh verify <contract_address> --network bsc_testnet --contract contracts/BEP20TIIM.sol:BEP20TIIM`

# Testing

`hh test`

# Token information:

### BSC testnet:
  - Token: [0xE3Dd18D59Bee6860C64290c166D4Ae82713aA1C6](https://testnet.bscscan.com/address/0xE3Dd18D59Bee6860C64290c166D4Ae82713aA1C6)
  - Owner: [0xfe32DBc156E104D99428147e40135a706A08D6F6](https://testnet.bscscan.com/address/0xfe32DBc156E104D99428147e40135a706A08D6F6)
  - Symbol: SYRO1M

# Pancakeswap testnet integration:

## Prepare test enviroment:

1. Install metamask on chrome [extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
2. Create new wallet on metamask
3. Add bsc testnet network to metamask:
    - Access [BSC testnet](https://testnet.bscscan.com/)
    - Click `add BSC network` button at bottom page
    - Accept add network on metamask
4. Get BNB/USDT/... on testnet:
    - Access [BSC faucet](https://testnet.binance.org/faucet-smart)
    - Copy address on metamask to input then choose give BNB or USDT

## Swap token on pancakeswap testnet:

1. Access [pancakeswap swap testnet](https://pancake.kiemtienonline360.com/#/swap)
2. Click `select a curency` at to section, fill `<token address>` then click `add`
3. Fill amount at `from section` to swap to selected token
4. Click swap and sign transaction on metamask

## Create Liquidity on pancakeswap testnet:
The account must have the BEP20 tokens

1. Access [pancakeswap pool testnet](https://pancake.kiemtienonline360.com/#/pool)
2. Click `add liquidity`, input amount and select token
3. Click `supply` and sign transaction on metamask


# Useful command:
```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```
