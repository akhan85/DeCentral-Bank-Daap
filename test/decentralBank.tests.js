const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecentralBank', ([owner, customer]) => {
    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before(async () => {
        //Load contracts
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)
        //Transfer all tokens to DecentralBank (1 Million)
        await rwd.transfer(decentralBank.address, tokens('1000000'))
        //Transfer of 100 tether tokens to investor
        await tether.transfer(customer, tokens('100'), {from: owner})
    })

    describe('Tether Deployment', async() => {
        it('matches name successfully', async() => {
            const name = await tether.name()
            assert.equal(name, 'Tether')
        })
    })

    describe('RWD Deployment', async() => {
        it('matches name successfully', async() => {
            const name = await rwd.name()
            assert.equal(name, 'Reward Token')
        })
    })

    describe('Decentral Bank Deployment', async() => {
        it('matches name successfully', async() => {
            const name = await decentralBank.name()
            assert.equal(name, 'Decentral Bank')
        })

        it('contract has tokens', async() => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('1000000'))
        })

    describe('Yeild Farming', async () => {
      it('rewards tokens for staking', async () => {
          let result
          //check investor balance
          result = await tether.balanceOf(customer)
          assert.equal(result.toString(), tokens('100'), 'Customer wallet balance before staking')
          
          //Check staking for customer of 100 tokens
          await tether.approve(decentralBank.address, tokens('100'), {from: customer})
          await decentralBank.depositTokens(tokens('100'), {from: customer})

          //Check updated balance of customer
          result = await tether.balanceOf(customer)
          assert.equal(result.toString(), tokens('0'), 'Customer wallet balance after staking')

          //Check updated balance of Decentral Bank
          result = await tether.balanceOf(decentralBank.address)
          assert.equal(result.toString(), tokens('100'), 'Decentral Bank balance after staking')  

          //Is Staking Update
          result = await decentralBank.isStaking(customer)
          assert.equal(result.toString(), 'true', 'customer is staking status after staking')

          //Issue tokens
          await decentralBank.issueTokens({from: owner})

          //Ensure only the owner can issue tokens
          await decentralBank.issueTokens({from: customer}).should.be.rejected;

          //Unstake tokens
          await decentralBank.unstakeTokens({from: customer})

          //Check Unstaking Balances

          //Check updated balance of customer
          result = await tether.balanceOf(customer)
          assert.equal(result.toString(), tokens('100'), 'Customer wallet balance after unstaking')
          
          //Check updated balance of Decentral Bank
          result = await tether.balanceOf(decentralBank.address)
          assert.equal(result.toString(), tokens('0'), 'Decentral Bank balance after unstaking')  
          
          //Is Staking Update
          result = await decentralBank.isStaking(customer)
          assert.equal(result.toString(), 'false', 'customer is no longer staking status after unstaking')
      })
    })    
    })
})

