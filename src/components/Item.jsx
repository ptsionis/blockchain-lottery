import React, { useEffect, useState } from "react";

const Item = ({
  web3,
  contract,
  currentAccount,
  ownerAccount,
  id,
  name,
  img,
  state,
}) => {
  const [biddersCount, setBiddersCount] = useState(0);
  const bidForItem = async () => {
    try {
      await contract.methods.bid(id).send({
        from: currentAccount,
        value: web3.utils.toWei("0.01", "ether"),
      });
    } catch (error) {
      console.error("Error bidding:", error);
    }
  };

  useEffect(() => {
    const fetchBiddersCount = async () => {
      if (contract) {
        try {
          const count = Number(
            await contract.methods.getItemBiddersCount(id).call()
          );
          setBiddersCount(count);
        } catch (error) {
          console.error("Error fetching item:", error);
        }
      }
    };

    fetchBiddersCount();
  }, []);

  useEffect(() => {
    if (contract) {
      const bidPlacedEvent = contract.events.BidPlaced();
      bidPlacedEvent.on("data", async (data) => {
        const itemIdBigInt = data.returnValues.itemId;
        const itemId = Number(itemIdBigInt);
        if (itemId === id) {
          setBiddersCount((biddersCount) => biddersCount + 1);
        }
      });

      return () => {
        bidPlacedEvent.removeAllListeners("data");
      };
    }
  }, [contract]);

  return (
    <div className="card">
      <span className="card-title">{name}</span>
      <span className="card-counter">({biddersCount} bidders)</span>
      <img className="card-img" src={img} alt={name} width={250} height={250} />
      <button
        className="user-btn"
        onClick={bidForItem}
        disabled={
          currentAccount == ownerAccount ||
          currentAccount == "0x153dfef4355E823dCB0FCc76Efe942BefCa86477" ||
          state
        }
      >
        Bid
      </button>
    </div>
  );
};

export default Item;
