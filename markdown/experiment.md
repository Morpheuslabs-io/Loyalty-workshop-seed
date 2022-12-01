<h3 id="experiment_start">Running experiments</h3>

<h6>Get Account list</h6>

- Get accounts will be using in this experiment by running a following command:

```bash
yarn accounts
```

<h6>Deploy and set configurations</h6>

- Deploy smart contracts onto BitTorrent Chain Testnet and set configurations:
    
```bash
yarn demo
```

- This script helps to:
    - Deploy two types of Membership: `Membership1` and `Membership2`
    - Deploy two types of Loyalty: `Loyalty1` and `Loyalty2`
    - Deploy two Vouchers: `Voucher1` and `Voucher2`
    - Deploy `Periphery1` contract:
        - Manage pairs of `Membership` and `Loyalty`
        - Register/Un-register Vouchers
        - Buy loyalty points
        - Redeem points
        - Topup voucher
    - Deploy `Periphery2` contract:
        - Swap two types of loyalty
        - Set exchange rates (regular and special swap)
    - Set experiment's configurations:
        - `Periphery1`, `Periphery2` and `DEPLOYER` will be granted the Operator role
        - Set special event's schedule
            - Regular swap is applied daily
            - Special swap is limited (within schedule)
        - Set exchange rates
            - Regular rate: `1pts (Loyalty 1) : 5pts (Loyalty 2)`
            - Special rate: `2pts (Loyalty 1) : 15pts (Loyalty 2)`
        - `Membership1` and `Membership2` tier list and its requirements:
            - Tier 1: 10,000 pts
            - Tier 2: 20,000 pts
            - Tier 3: 50,000 pts
            - Tier 4: 100,000 pts
            - Tier 5: 300,000 pts

<h6>Config environment variables</h6>

- Saved accounts and deployed contracts' addresses as following

```text
// Replace by your addresses
Account1="0x31003C2D5685c7D28D7174c3255307Eb9a0f3015"
Account2="0xF9F36dC75eAfc38f5e6525fadbA2939FCbC666e0"

// Replace these addresses by your deployed contracts
Membership1="0x3b4f0B5b36765807bfd89d4233B191E85835116c"
Membership2="0x418c422BEBDDfAb972A8dBB34eeC41ea7c9983DE"
Loyalty1="0x430CB3ac2CcCD9ca19A39d52bF70C3218d0b1a1f"
Loyalty2="0x00AA5Bab83335913653b83C5cA6062c8F9e61B95"
Voucher1="0xe8b7491C6cE425ACbEEC02512117aE031Bc3f1Ac"
Voucher2="0xeF43A894F46184B52B427Ed242DC64524Fa43eD9"
Periphery1="0xa867A1C7c9482632E9E23003b3f7a1c3cf7f101D"
Periphery2="0xF37903B82D90f18fC80e361870C722A580bfDc46"
```

- Copy and paste them into a command line

<h6>Open deployed smart contracts</h6>

- You can check and read latest states of smart contracts

```text
// Replace by your deployed addresses
Membership1: https://testnet.bttcscan.com/address/0x3b4f0B5b36765807bfd89d4233B191E85835116c#code
Membership2: https://testnet.bttcscan.com/address/0x418c422BEBDDfAb972A8dBB34eeC41ea7c9983DE#code
Loyalty1: https://testnet.bttcscan.com/address/0x430CB3ac2CcCD9ca19A39d52bF70C3218d0b1a1f#code
Loyalty2: https://testnet.bttcscan.com/address/0x00AA5Bab83335913653b83C5cA6062c8F9e61B95#code
Voucher1: https://testnet.bttcscan.com/address/0xe8b7491C6cE425ACbEEC02512117aE031Bc3f1Ac#code
Voucher2: https://testnet.bttcscan.com/address/0xeF43A894F46184B52B427Ed242DC64524Fa43eD9#code
```

- Copy these links to your web browser

<h6>Register new Member</h6>

- Register `Account2` as a new member of `Membership1` (member id = 1)

```bash
yarn reg_mem --membership $Membership1 --member $Account2 --memberid 1
```

<h6>Update loyalty points</h6>

- Update loyalty points for new registered member by Operator
- The script helps to add `9000` loyalty points to `Account2`

```bash
yarn update_pts --loyalty $Loyalty1 --member $Account2 --value 9000
```

<h6>Buy loyalty points</h6>

- Tier 1 of `Membership1` requires 10,000 pts to upgrade -> need to purchase 1,000 pts to meet the requirement
- Approve an amount of allowance

```bash
yarn set_allowance --periphery $Periphery1 --caller $Account2 --amount "999999999999999"
```

- Buy 1,000 points

```bash
yarn buy_pts --membership $Membership1 --periphery $Periphery1 --buyer $Account2 --memberid 1 --pts 1000
```

- Latest balance: 10,000 pts

<h6>Upgrade tier</h6>

- Requirement is met -> `Account2` is now able to upgrade a current tier

```bash
yarn upgrade_tier --membership $Membership1 --periphery $Periphery1 --caller $Account2 --memberid 1
```

- Tier 0 -> Tier 1

<h6>Redeem loyalty points</h6>

- Redeem loyalty points -> voucher
- Conversion rate: 100pts = 1pts voucher

```bash
yarn redeem --membership $Membership1 --voucher $Voucher1 --periphery $Periphery1 --caller $Account2 --memberid 1 --pts 10000
```

- Receive `100,000,000,000,000,000,000` (100pts) with scaling `decimals = 18`

<h6>Topup voucher</h6>

- Topup current voucher's value

```bash
yarn topup --membership $Membership1 --voucher $Voucher1 --periphery $Periphery1 --buyer $Account2 --memberid 1 --amount 2000
```

- Updated balance: `2100,000,000,000,000,000,000` (2100pts) with scaling `decimals = 18`

<h6>Register new Member</h6>

- Register `Account2` as a new member in the `Membership2` contract

```bash
yarn reg_mem --membership $Membership2 --member $Account2 --memberid 1
```

<h6>Swap two types of Loyalty</h6>

- In previous steps, loyalty points is redeemed to voucher
- Thus, it requires to add more points to execute this
- Update points for `Account2` (existing member) in the `Membership1` contract

```bash
yarn update_pts --loyalty $Loyalty1 --member $Account2 --value 12000
```

- Regular swap `Loyalty1` -> `Loyalty2` (`rate = 1:5`)

```bash
yarn swap --periphery $Periphery2 --bmembership $Membership1 --qmembership $Membership2 \
--caller $Account2 --bmemberid 1 --qmemberid 1 \
--amount 1000 --eventid 0
```

- Updated balance: 5,000pts (Loyalty 2) and 11,000pts (Loyalty 1)
- Special swap `Loyalty1` -> `Loyalty2` (`rate = 2:15`)

```bash
yarn swap --periphery $Periphery2 --bmembership $Membership1 --qmembership $Membership2 \
--caller $Account2 --bmemberid 1 --qmemberid 1 \
--amount 1000 --eventid 1
```

- Receive 7,500pts (Loyalty 2)
- Updated balance: 12,500pts (Loyalty 2) and 10,000pts (Loyalty 1) 
- Requirement is met (`Membership2`) -> `Account2` is now able to upgrade a current tier

```bash
yarn upgrade_tier --membership $Membership2 --periphery $Periphery1 --caller $Account2 --memberid 1
```

- Tier 0 -> Tier 1 (in the `Membership2`)

<p align="center">
    <a href="../README.md#readme_start">Back to readme</a>
</p>