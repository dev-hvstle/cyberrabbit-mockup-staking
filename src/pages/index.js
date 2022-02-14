import React, {useState} from 'react'
import Web3 from 'web3';
import CB from '../ABI/CyberRabbitGen1.json';
import CBStaking from '../ABI/CyberStaking.json';

const Staking = () => {
    const web3 = new Web3(window.ethereum);
    const [userAddress, setUserAddress] = useState();
    const [CyberRabbit, setCyberRabbit] = useState();
    const [CyberStaking, setCyberStaking] = useState();
    const [balance, setBalance] = useState(0);
    const [yieldToken, setYieldToken] = useState(0);
    const [approved, setApproved] = useState(false);
    const [stakedNft, setStakedNft] = useState();
    const nftContract = "0x3107F7b0108C70d7dCE16Cb604c80bf3a7c9378f";
    const stakingContract = "0x4B3E3602710c176e45d082D5F0D7329F340eC1b2";

    const connectWallet = async() =>{
        if(typeof window.ethereum != 'undefined'){
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            const tempAccount = web3.utils.toChecksumAddress(accounts[0]);
            setUserAddress(tempAccount);
            connectSmartContract(tempAccount);
        }
    }

    const connectSmartContract = async(tempAccount) => {
        try{
            const tempCyberRabbit = await new web3.eth.Contract(CB.abi, nftContract);
            const tempBalance = await tempCyberRabbit.methods.walletOf().call({from: tempAccount});
            const tempIsApproved = await tempCyberRabbit.methods.isApprovedForAll(tempAccount, stakingContract).call();
            
            const tempCyberStaking = await new web3.eth.Contract(CBStaking.abi, stakingContract);
            const tempStakedNft = await tempCyberStaking.methods.getStakedNFT().call({from: tempAccount});
            const tempTotalBalance = await tempCyberStaking.methods.getTotalBalance().call({from: tempAccount});
            
            setCyberRabbit(tempCyberRabbit);
            setCyberStaking(tempCyberStaking);
            setBalance(tempBalance);
            setApproved(tempIsApproved);
            setStakedNft(tempStakedNft);
            setYieldToken(tempTotalBalance);
        }
        catch(e){
            console.log(e);
        }
    }

    const approve = async() =>{
        try{
            await CyberRabbit.methods.setApprovalForAll(stakingContract, true).send({from: userAddress});
            setApproved(true);
        }
        catch(e){
            console.log(e);
        }
    }

    const stake = async() =>{
        try{
            setApproved(false);
            const nftID = parseInt(document.getElementById('nftID').value);
            await CyberStaking.methods.stakeRabbit(nftID).send({from: userAddress});
            setApproved(true)
        }
        catch(e){
            console.log(e);
        }
    }

    const unstake = async() =>{
        try{
            const nftID = parseInt(document.getElementById('nftID').value);
            await CyberStaking.methods.unstakeRabbit(nftID).send({from: userAddress});
        }
        catch(e){

        }
    }

  return (
    <>
        <p>User Address: {userAddress}</p>
        <button onClick={connectWallet}>Connect Wallet</button>
        <p>Owned NFT: {balance}</p>
        <button>Test Mint</button>
        <br></br>
        <p>Staked NFT: {stakedNft}</p>
        <p>Yielded Token: {web3.utils.fromWei(String(yieldToken))}</p>
        <button onClick={approve}>Approve All</button>
        <br></br>
        <br></br>
        <button disabled={(approved ? '' : 'disabled')} onClick={stake}>Stake</button>
        <input id='nftID' type='text' placeholder='Enter ID' ></input>
        <button onClick={unstake}>Unstake</button>
        <br></br>
        <br></br>
        <button>Claim Token</button>
    </>
  )
}

export default Staking