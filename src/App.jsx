import React, { useState, useEffect } from "react";
import Web3 from "web3";
import lotteryContract from "./data/contract";
import Item from "./components/Item";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [ownerAccount, setOwnerAccount] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [state, setState] = useState(0);

  const revealWinners = async () => {
    try {
      await contract.methods.revealWinners().send({
        from: currentAccount,
      });
    } catch (error) {
      console.error("Error revealing winners:", error);
    }
  };

  const withdrawEth = async () => {
    try {
      await contract.methods.withdraw().send({
        from: currentAccount,
      });
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  const resetContract = async () => {
    try {
      await contract.methods.resetContract().send({
        from: currentAccount,
      });
    } catch (error) {
      console.error("Error revealing winners:", error);
    }
  };

  const showMyWinnerItems = async () => {
    try {
      const items = await contract.methods.getMyWinningItems().call();
      console.log("WIN ITEMS", items);
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const contractInstance = new web3Instance.eth.Contract(
            lotteryContract.abi,
            lotteryContract.address
          );
          setContract(contractInstance);

          const owner = await contractInstance.methods.owner().call();
          setOwnerAccount(owner);

          const currentState = Number(
            await contractInstance.methods.state().call()
          );
          setState(currentState);

          const accounts = await web3Instance.eth.getAccounts();
          setCurrentAccount(accounts[0]);

          setIsMetaMaskConnected(true);

          window.ethereum.on("accountsChanged", (accounts) => {
            console.log(accounts[0]);
            if (accounts.length > 0) {
              setCurrentAccount(accounts[0]);
              setIsMetaMaskConnected(true);
            } else {
              setIsMetaMaskConnected(false);
            }
          });
        } catch (error) {
          console.error("Error initializing web3", error);
        }
      } else {
        setIsMetaMaskConnected(false);
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (contract) {
      const stateChangedEvent = contract.events.StateChanged();
      stateChangedEvent.on("data", async (data) => {
        const currentState = Number(data.returnValues.newState);
        setState(currentState);
      });

      return () => {
        stateChangedEvent.removeAllListeners("data");
      };
    }
  }, [contract]);

  if (!isMetaMaskConnected) {
    return (
      <div className="wrapper">
        <h1>Please connect to Metamask...</h1>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <h1>Lottery - Ballot</h1>
      <div className="cards-container">
        <Item
          web3={web3}
          contract={contract}
          currentAccount={currentAccount}
          ownerAccount={ownerAccount}
          id={0}
          name={"Car"}
          img={
            "https://static.dezeen.com/uploads/2016/11/i-pace-electric-car-jaguar-design_dezeen_sq-300x300.jpg"
          }
          state={state}
        />
        <Item
          web3={web3}
          contract={contract}
          currentAccount={currentAccount}
          ownerAccount={ownerAccount}
          id={1}
          name={"Phone"}
          img={
            "https://greentechno.gr/image/cache/catalog/999/14%20PRO%20MAX%20PURPLE-300x300.jpeg"
          }
          state={state}
        />
        <Item
          web3={web3}
          contract={contract}
          currentAccount={currentAccount}
          ownerAccount={ownerAccount}
          id={2}
          name={"Laptop"}
          img={"https://m.media-amazon.com/images/I/61Qe0euJJZL._AC_SS300_.jpg"}
          state={state}
        />
      </div>
      <div className="info-wrapper">
        <p>
          Current account: <span>{currentAccount}</span>
        </p>
        <p>
          Owner account: <span>{ownerAccount}</span>
        </p>
      </div>
      <div>
        {currentAccount === ownerAccount ||
        currentAccount === "0x153dfef4355E823dCB0FCc76Efe942BefCa86477" ? (
          <React.Fragment>
            <button className="owner-btn helper-btn" onClick={withdrawEth}>
              Withdraw
            </button>
            <button
              className="owner-btn helper-btn"
              onClick={revealWinners}
              disabled={state}
            >
              Declare Winners
            </button>
            <button className="owner-btn helper-btn" onClick={resetContract}>
              Reset
            </button>
          </React.Fragment>
        ) : (
          <button
            className="user-btn helper-btn"
            onClick={showMyWinnerItems}
            disabled={!state}
          >
            Am I Winner?
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
