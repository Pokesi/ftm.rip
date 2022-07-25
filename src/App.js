
import './App.css';
import { Rave, exampleName } from '@rave-names/rave';
import { useState, useEffect } from 'react';
import { ethers, providers } from 'ethers';
import { externalabi } from './extabi';
import Tooltip from '@mui/material/Tooltip';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
 
import Swal from 'sweetalert2'
 
 const rave = new Rave();
 
 const provider = new providers.JsonRpcProvider('https://rpc.ftm.tools');
 
 function App() {
   const name = window.location.host.split('.')[0] + '.ftm';
   document.title = name;
 
   const [rn,setRn] = useState({
     name: false,
     isOwned: false,
     avatar: false,
     owner: false,
   });
   const [records,setRecords] = useState([]);
   const [webR,setWebR] = useState('');
   const [contract,setContract] = useState(
     new ethers.Contract('0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac', externalabi, provider)
   );
 
   const [twitter,setTwitter] = useState('');
 
   const [ acctData, setAcctData ] = useState({
     account: '',
     signer: null,
   });
 
   const connectWallet = async () => {
    window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0xFA",
        rpcUrls: ["https://rpc.ftm.tools"],
        chainName: "Fantom Opera",
        nativeCurrency: {
            name: "FTM",
            symbol: "FTM",
            decimals: 18
        },
        blockExplorerUrls: ["https://ftmscan.com/"]
      }]
    });
 
    const provider = new ethers.providers.Web3Provider(window.ethereum, 250);
   console.log('Connected?')
    let signer = provider.getSigner();
    let accounts =await provider.send("eth_requestAccounts", []);
    let account = accounts[0];
 
   console.log(account);
 
    setAcctData({
      signer: signer,
      account: account,
    });
 
    setContract(
      new ethers.Contract('0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac', externalabi, signer)
    );
  };
 
   const getData = async () => {
     const lnk = (await rave.reverse(await rave.resolveStringToAddress(name)));
     setRn(lnk);
   }
 
   const getRecords = async () => {
     const records = (await rave.getTexts(name));
     setRecords(records);
   }
 
   const getWebRecord = async () => {
     const record = (await rave.getText(name, 'ftm.rip.website'));
     setWebR(record);
   }
 
   const getTwitterRecord = async () => {
     const record = (await rave.getText(name, 'com.twitter'));
     setTwitter(record.split('@')[1]);
   }
 
   const truncateAddress = (address) => {
     address = address.substring(0, 12) + '...' + address.substring(address.length - 8, address.length)
    return address
   }
 
   useEffect(() => {
     getData();
     getRecords();
     getWebRecord();
     getTwitterRecord();
   });
 
   const setSite = async () => { const { value: text } =await Swal.fire({
     title: 'Set your website...',
     text: 'must be https:// prefixed. Use https://ipfs.io/ipfs for IPFS resolution.',
     confirmButtonText: 'Set...',
     input: 'url',
     inputLabel: 'URL address',
     inputPlaceholder: 'Enter the URL'
   });
  console.log(text);
   contract.setText(name.toUpperCase(), 'ftm.rip.website', text);}
 
   const nameown = (rn.isOwned) ? ((name === 'z.ftm') ? rn.owner : "Not Owned") : "Not Owned"
 
  return (
     <div className="App">
       <header className="header">
         <img src={nameown ? rn.avatar : "https://rave.domains/RaveBase.png"} className="App-logo" alt="logo" />
         <p>
           {name} is {nameown}
         </p>
         {rn.isOwned && <><button style={{
             border: 'none',
             background: '#272727',
             color: '#FFF',
             cursor: 'pointer',
             borderRadius: '15px',
             padding: '2vh 4vh',
             fontFamily: 'Montserrat',
             fontSize: '21px',
             marginBottom: '15px',}}
           onClick={connectWallet}>{acctData.account ? truncateAddress(acctData.account) : "Connect wallet!"}</button>
         <br />
         <button style={{
         border: 'none',
         background: '#272727',
         color: '#FFF',
         cursor: 'pointer',
         borderRadius: '15px',
         padding: '2vh 4vh',
         fontFamily: 'Montserrat',
         fontSize: '21px',
         marginBottom: '15px',}}
         onClick={setSite}>Set your ftm.rip website!</button>
         <br />
         {(twitter !== '') && (<><TwitterTimelineEmbed
                                 sourceType="profile"
                                 screenName={twitter}
                                 options={{
                                   width: 500,
                                   height: 600
                                 }}
                                 theme="dark"
                               />
         <br /></>)}
         {(webR !== '') &&
           <iframe src={webR} title={`${name}'s website'`} style={{
             height: '60%',
             width: '60%',
           }} />
         }
         {(records.length > 0) && <h3>{name}'s text records</h3>}
         {records.map(
           function (item, key) {
            return <>{(records.length > 0) && <><Tooltip title={`Click to copy`}><button style={{
             border: 'none',
             background: '#272727',
             color: '#FFF',
             cursor: 'pointer',
             borderRadius: '15px',
             padding: '2vh 4vh',
             fontFamily: 'Montserrat',
             fontSize: '14px',
             marginBottom: '15px',}}
             onClick={() => {navigator.clipboard.writeText(item.value)}}>{item.key} | {item.value}</button></Tooltip><br /></>}</>
           }
         )}</>}
       </header>
     </div>
   );
 }
 
export default App;
 