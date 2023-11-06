const { ethers } = require("ethers");
const ERC20 = require("../../artifacts/contracts/protocol/old/TestUSDCToken.sol/TestUSDCToken.json");

const approve = async (address, amount) => {
	if (typeof window.ethereum !== "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		console.log({ provider });
		console.log(process.env.REACT_APP_TEST_USDCTOKEN);
		const signer = provider.getSigner();
		const Contract = new ethers.Contract(
			process.env.REACT_APP_TEST_USDCTOKEN,
			ERC20.abi,
			signer
		);
		const sixDecimals = 6;
		amount = ethers.utils.parseUnits(amount, sixDecimals);
		const transaction1 = await Contract.approve(address, amount);
		await transaction1.wait();
		return transaction1;
	}
};

export default approve;
