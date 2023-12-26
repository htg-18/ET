import React, { useState, useEffect } from "react";
import axios from "axios";

const MATIC_TO_ETH_EXCHANGE_RATE_API =
  "https://api.coingecko.com/api/v3/exchange_rates";

const ConversionComponent = () => {
  const [maticAmount, setMaticAmount] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      const response = await axios.get(MATIC_TO_ETH_EXCHANGE_RATE_API);
      const { data } = response;
      const { rate } = data;
      setExchangeRate(rate);
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const calculateEthAmount = () => {
      const updatedEthAmount = maticAmount * exchangeRate;
      setEthAmount(updatedEthAmount);
    };

    calculateEthAmount();
  }, [maticAmount, exchangeRate]);

  const handleMaticAmountChange = (event) => {
    const updatedMaticAmount = parseInt(event.target.value);
    setMaticAmount(updatedMaticAmount);
  };

  return (
    <div>
      <label>MATIC Amount:</label>
      <input
        type="number"
        value={maticAmount}
        onChange={handleMaticAmountChange}
      />
      <br />
      <label>ETH Amount:</label>
      <span>{ethAmount}</span>
    </div>
  );
};

export default ConversionComponent;
