- Get account list:

```bash
yarn accounts
```

- Deploy smart contracts onto BitTorrent Chain Testnet and set configurations:

```bash
yarn demo
```

- Config environment variables for being used later

```text
// Replace by your addresses and paste into your command line
Account1="0x31003C2D5685c7D28D7174c3255307Eb9a0f3015"
Account2="0xF9F36dC75eAfc38f5e6525fadbA2939FCbC666e0"
Account3="0x8df7990283F8180e4D022ee3Fd19577937D84116"

// Replace these addresses by your deployed contracts and paste into your command line
Membership1="0x89608CED7F325b65F07F12F954DA71F9c358B4fE"
Membership2="0xB8346bAe37Dbac084E7E3f1a4Fc9D2eC144aF974"
Loyalty1="0x3A2E9B23358A53E8327f66f17Bf69E5D4057C1aA"
Loyalty2="0x51C503649e0C2BC9708F4Ef1F46C2EB061C36dC6"
Voucher1="0x94Bb7C4fbE813B9742fb5E207C9dC3955A62f564"
Voucher2="0xD36e199a505209d10d4E5D01D9F650E4b8337AE5"
Periphery1="0x5963a1be39616A69c1d8964a26A25AcAC97b33ef"
Periphery2="0x326cDC99F2eC1211EA939C6F13bB5170087047B9"
```

- You can check and read latest states of smart contracts as following:

```text
// Replace by your deployed addresses and copy these links to web browsers
Membership1: https://testnet.bttcscan.com/address/0x89608CED7F325b65F07F12F954DA71F9c358B4fE#code
Membership2: https://testnet.bttcscan.com/address/0xB8346bAe37Dbac084E7E3f1a4Fc9D2eC144aF974#code
Loyalty1: https://testnet.bttcscan.com/address/0x3A2E9B23358A53E8327f66f17Bf69E5D4057C1aA#code
Loyalty2: https://testnet.bttcscan.com/address/0x51C503649e0C2BC9708F4Ef1F46C2EB061C36dC6#code
Voucher1: https://testnet.bttcscan.com/address/0x94Bb7C4fbE813B9742fb5E207C9dC3955A62f564#code
Voucher2: https://testnet.bttcscan.com/address/0xD36e199a505209d10d4E5D01D9F650E4b8337AE5#code
```
    
- Register new Member

```bash
yarn reg_mem --membership $Membership1 --member $Account2 --memberid 1
```

- Update loyalty points for new Member

```bash
yarn update_pts --loyalty $Loyalty1 --member $Account2 --value 9000
```

- Approve an amount of allowance

```bash
yarn set_allowance --periphery $Periphery1 --caller $Account2 --amount "999999999999999"
```

- Buy loyalty points

```bash
yarn buy_pts --membership $Membership1 --periphery $Periphery1 --buyer $Account2 --memberid 1 --pts 1000
```

- Upgrade current tier

```bash
yarn upgrade_tier --membership $Membership1 --periphery $Periphery1 --caller $Account2 --memberid 1
```

- Redeem loyalty points

```bash
yarn redeem --membership $Membership1 --voucher $Voucher1 --periphery $Periphery1 --caller $Account2 --memberid 1 --pts 10000
```

- Topup my voucher

```bash
yarn topup --membership $Membership1 --voucher $Voucher1 --periphery $Periphery1 --buyer $Account2 --memberid 1 --amount 2000
```

- Update loyalty points for existing Member (Membership1 contract)

```bash
yarn update_pts --loyalty $Loyalty1 --member $Account2 --value 12000
```

- Register new Member (Membership2 contract)

```bash
yarn reg_mem --membership $Membership2 --member $Account2 --memberid 1
```

- Swap two types of Loyalty (regular swap)

```bash
yarn swap --periphery $Periphery2 --bmembership $Membership1 --qmembership $Membership2 \
--caller $Account2 --bmemberid 1 --qmemberid 1 \
--amount 1000 --eventid 0
```

- Swap two types of Loyalty (special swap)

```bash
yarn swap --periphery $Periphery2 --bmembership $Membership1 --qmembership $Membership2 \
--caller $Account2 --bmemberid 1 --qmemberid 1 \
--amount 1000 --eventid 1
```

- Upgrade current tier

```bash
yarn upgrade_tier --membership $Membership2 --periphery $Periphery1 --caller $Account2 --memberid 1
```