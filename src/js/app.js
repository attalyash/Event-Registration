var accounts;
var account = '0x0';
var balance;
var ticketPrice;
var myContractInstance;
var contractAddress = '0xb52bd25fBEFbfCcfD0FF310dfaFa420c9CC32A1f';
var abi = JSON.parse('[ { "inputs": [ { "internalType": "uint8", "name": "_total", "type": "uint8" }, { "internalType": "uint256", "name": "_price", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Refund", "type": "event" }, { "payable": false, "stateMutability": "nonpayable", "type": "fallback" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "registrations", "outputs": [ { "internalType": "uint8", "name": "noOfTickets", "type": "uint8" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "email", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ticketsSold", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalTickets", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "string", "name": "_email", "type": "string" }, { "internalType": "uint8", "name": "_amount", "type": "uint8" } ], "name": "buyTickets", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address payable", "name": "_customer", "type": "address" } ], "name": "refundAmount", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "_buyer", "type": "address" } ], "name": "balanceOfRegistrant", "outputs": [ { "internalType": "uint256", "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]');

function initWeb3() {
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));
    setAcc();
  };

  async function loadContract() {
    myContractInstance =await new web3.eth.Contract(abi,contractAddress);
    initializeContract();
  }

  function setAcc() {
    web3.eth.getAccounts(function(err, acc) {
        if(err) {
          alert("There was an error fetching your account information.");
          return;
        }
        if(acc.length == 0) {
          alert("Could not find any accounts.");
          return;
        }
        accounts = acc;
        account = accounts[0];
        loadContract();
      });
  }

function initializeContract() {

  $("#cf_address").html(contractAddress);
  $("#cb_address").html(account);
  $("#qrcode").html("<img src = \"http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl="+contractAddress+"&chld=H|0\">");

  
 myContractInstance.methods.ticketsSold().call(function(ticketsSold) {
      $("#cf_registrants").html(ticketsSold);
      return myContractInstance.methods.totalTickets().call();
    }).then ( function(totalTickets) {
      $("#cf_quota").html(totalTickets);
      return myContractInstance.methods.price().call();
    }).then ( function(price) {
      ticketPrice = web3.utils.fromWei(price.toString(), "ether");
      $("#cf_price").html(Number(ticketPrice));
      refreshBalance();
    });
}

function setStatus(message) {
  $("#status").html(message);
};

function showTotal() {
  var numTickets = $("#numTickets").val();
  var ticketAmount = numTickets * ticketPrice;
  $("#ticketsTotal").html(ticketAmount);
};

function refreshBalance() {
  var balanceCoinbase;
balanceCoinbase = web3.eth.getCoinbase(
    function(err, add) {
     if(!err){
      web3.eth.getBalance(add, function(error, balance) {
        if(!error)
        {
            balanceCoinbase = balance;
            $("#cb_balance").html(web3.utils.fromWei(balanceCoinbase, 'ether'));
        }
      });
     }
   });
};

function buyTicket() {

  var numTickets = parseFloat($("#numTickets").val());
  var ticketAmount = numTickets * ticketPrice;
  var ticketAmountWei = web3.utils.toWei(ticketAmount.toString(), "ether");
  alert(ticketAmountWei);
  var email = $("#email").val();
  var amountAlreadyPaid;
  var amountPaidNow;

  setStatus("Initiating transaction...");

  myContractInstance.methods.balanceOfRegistrant(account).call().then(
    function(result) {
      amountAlreadyPaid = result;
      web3.eth.getCoinbase(function(err, coinbase) {
        if(!err){
          return myContractInstance.methods.buyTickets(email,numTickets).send({from: coinbase.toString(), gas: 3000000, value: ticketAmountWei});
      }})}).then(
      function(result) {
        return myContractInstance.methods.ticketsSold().call();
      }).then(
      function(ticketsSold){
        $("#cf_registrants").html(ticketsSold);
        return myContractInstance.methods.balanceOfRegistrant(account).call();
      }).then(
      function(valuePaid) {
        amountPaidNow = valuePaid - amountAlreadyPaid;
        if(amountPaidNow == ticketAmountWei) {
          setStatus("Purchase Successful");
        } else {
          setStatus("Purchase Failed");
        }
        refreshBalance();
      });
    }

    function cancelTicket() {
      setStatus("Initiating transaction...");
      myContractInstance.methods.balanceOfRegistrant(account).call().then (
        function(result) {
          if(result == 0) {
            setStatus("Not Registered, can't initiate Refund!!");
          } else {
            alert(account);
            myContractInstance.methods.refundAmount(account).send({from: account, gas: 3000000}).then (
              function() {
                return myContractInstance.ticketsSold.call();
              }).then (
              function (ticketsSold) {
                $("#cf_registrants").html(ticketsSold.toNumber());
                return myContractInstance.methods.balanceOfRegistrant(account).call(account);
              }).then (
              function(valuePaid) {
                if(valuePaid == 0) {
                  setStatus("Refund Successful !!");
                }else {
                  setStatus("Refund Failed");
                }
                refreshBalance();
              });
          }
        });
    }

   window.addEventListener('load', async () => {
      if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
          // ask user for permission
          await ethereum.enable();
          // user approved permission
      } catch (error) {
          // user rejected permission
          console.log('user rejected permission');
      }
  }
  // Old web3 provider
  else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // no need to ask for permission
  }
  // No web3 provider
  else {
      console.log('No web3 provider detected');
  }
      initWeb3();
    });

