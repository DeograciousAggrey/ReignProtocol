const tokenTransactions = (address, tokenAddress, page, offset) => {
	if (!address) {
		return null;
	}
	console.log("Fetching transactions for address - ", address);
	var api_options = {
		method: "get",
		url: `${
			process.env.REACT_APP_POLYGONSCAN_API_URL
		}/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=${
			page ? page : 1
		}&offset=${offset ? offset : 10}&sort=desc&apikey=${
			process.env.REACT_APP_POLYGONSCAN_APIKEY
		}&contractaddress=${
			tokenAddress ? tokenAddress : process.env.REACT_APP_TEST_USDCTOKEN
		}`,
	};

	return api_options;
};

module.exports = { tokenTransactions };
