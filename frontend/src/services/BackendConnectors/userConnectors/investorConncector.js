const { ethers } = require("ethers");
const opportunityPool = require("../../../artifacts/contracts/protocol/OpportunityPool.sol/OpportunityPool.json");
const seniorPool = require("../../../artifacts/contracts/protocol/SeniorPool.sol/SeniorPool.json");
const investor = require("../../../artifacts/contracts/protocol/Investor.sol/Investor.json");
const opportunityOrigination = require("../../../artifacts/contracts/protocol/OpportunityOrigination.sol/OpportunityOrigination.json");
const { requestAccount, getEthAddress } = require("./commonConnectors");
const { getOpportunity } = require("../opportunityConnectors");
const Sentry = require("@sentry/react");
const { getDisplayAmount } = require("../../Helpers/displayTextHelper");
const { retrieveFileFromURL } = require("../../Helpers/fileHelper");
const {
	getIPFSFileURL,
	retrieveFiles,
	getIPFSFileURLOption2,
	getIPFSFileURLOption3,
} = require("../../Helpers/web3storageIPFS");

const sixDecimals = 6;
const nullAddress = "0x0000000000000000000000000000000000000000";

export const withdrawAllJunior = async (poolAddress) => {
	Sentry.captureMessage("withdrawAllJunior", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const poolContract = new ethers.Contract(
				poolAddress,
				opportunityPool.abi,
				signer
			);

			const transaction = await poolContract.withdrawAll(0); // 0 is juniorpool ID
			await transaction.wait();
			return { transaction, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const withdrawSeniorPoolInvestment = async (amount) => {
	Sentry.captureMessage("withdrawSeniorPoolInvestment", "info");
	try {
		if (!amount || +amount <= 0) {
			Sentry.captureMessage("Invalid amount", "warning");
			return {
				success: false,
				msg: "Invalid Amount",
			};
		}
		if (typeof window.ethereum !== "undefined") {
			await requestAccount();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			console.log({ signer });
			const contract = new ethers.Contract(
				process.env.REACT_APP_SENIORPOOL,
				seniorPool.abi,
				signer
			);

			amount = ethers.utils.parseUnits(amount, sixDecimals);
			if (amount && amount > 0) {
				let transaction = await contract.withdrawWithLP(amount);
				await transaction.wait();
				return { transaction, success: true };
			}
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getTotalInvestmentOfInvestor = async () => {
	Sentry.captureMessage("getTotalInvestmentOfInvestor", "info");
	let { result } = await getEthAddress();
	let investorAddress = result;
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const contract = new ethers.Contract(
				process.env.REACT_APP_INVESTOR,
				investor.abi,
				provider
			);
			const originationContract = new ethers.Contract(
				process.env.REACT_APP_OPPORTUNITY_ORIGINATION_ADDRESS,
				opportunityOrigination.abi,
				provider
			);

			let opportunities = await contract.getOpportunityOfInvestor(
				investorAddress
			);
			let totalInvestment = 0;
			let totalYield = 0;
			// get liquidity pool investment with yield
			let spInvestments = await getUserSeniorPoolInvestment();
			let seniorInvestment =
				spInvestments.data.stakingAmt + spInvestments.data.withdrawableAmt;
			totalInvestment += seniorInvestment;

			const signer = provider.getSigner();
			const seniorPoolContract = new ethers.Contract(
				process.env.REACT_APP_SENIORPOOL,
				seniorPool.abi,
				signer
			);
			let sharePrice = await seniorPoolContract.sharePrice();
			let seniorPoolSharePrice = ethers.utils.formatUnits(
				sharePrice.toString(),
				sixDecimals
			);

			let seniorPoolYieldEarned =
				seniorInvestment * parseFloat(seniorPoolSharePrice);
			totalYield += seniorPoolYieldEarned;

			// get junior pool investment with yield
			for (let i = 0; i < opportunities.length; i++) {
				let tx = await originationContract.opportunityToId(opportunities[i]);
				let { obj } = await getOpportunity(tx);
				if (obj.opportunityPoolAddress === nullAddress) {
					continue;
				}
				const poolContract = new ethers.Contract(
					obj.opportunityPoolAddress,
					opportunityPool.abi,
					provider
				);
				let stakingBal = await poolContract.stakingBalance(investorAddress);
				stakingBal = ethers.utils.formatUnits(
					stakingBal.toString(),
					sixDecimals
				);
				totalInvestment += parseFloat(stakingBal);

				if (tx.opportunityStatus.toString() === "8") {
					let yieldPercentage = await poolContract.juniorYieldPerecentage();
					yieldPercentage = ethers.utils.formatUnits(
						yieldPercentage.toString(),
						sixDecimals
					);
					let opportunityYieldEarned =
						parseFloat(stakingBal) * parseFloat(yieldPercentage);
					totalYield += opportunityYieldEarned;
				}
			}
			return {
				totalInvestment,
				totalYield,
				data: {
					stakingAmt: spInvestments.data.stakingAmt,
					withdrawableAmt: spInvestments.data.withdrawableAmt,
				},
				success: true,
			};
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getSeniorPoolSharePrice = async () => {
	Sentry.captureMessage("getSeniorPoolSharePrice", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const contract = new ethers.Contract(
				process.env.REACT_APP_SENIORPOOL,
				seniorPool.abi,
				provider
			);
			let sharePrice = await contract.sharePrice();
			sharePrice = ethers.utils.formatUnits(sharePrice, sixDecimals) * 100;

			return { sharePrice, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getSeniorPoolDisplaySharePrice = async () => {
	Sentry.captureMessage("getSeniorPoolDisplaySharePrice", "info");
	let backendSharePrice = await getSeniorPoolSharePrice();

	if (backendSharePrice.success) {
		return {
			displaySharePrice:
				parseFloat(backendSharePrice.sharePrice).toFixed(2) + "%",
			sharePriceFromContract: backendSharePrice.sharePrice,
			success: true,
		};
	} else {
		return backendSharePrice;
	}
};

export const getJuniorWithdrawableOp = async () => {
	Sentry.captureMessage("getJuniorWithdrawableOp", "info");
	let { result } = await getEthAddress();
	let investorAddress = result;
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				process.env.REACT_APP_INVESTOR,
				investor.abi,
				provider
			);
			const originationContract = new ethers.Contract(
				process.env.REACT_APP_OPPORTUNITY_ORIGINATION_ADDRESS,
				opportunityOrigination.abi,
				provider
			);

			let opportunities = await contract.getOpportunityOfInvestor(
				investorAddress
			);
			let opportunityList = [];
			for (let i = 0; i < opportunities.length; i++) {
				let tx = await originationContract.opportunityToId(opportunities[i]);
				let { obj } = await getOpportunity(tx);
				if (obj.opportunityPoolAddress === nullAddress) {
					continue;
				}

				const poolContract = new ethers.Contract(
					obj.opportunityPoolAddress,
					opportunityPool.abi,
					signer
				);
				let stakingBal = await poolContract.stakingBalance(investorAddress);
				stakingBal = ethers.utils.formatUnits(
					stakingBal.toString(),
					sixDecimals
				);
				obj.capitalInvested = getDisplayAmount(stakingBal);
				let poolBal = await poolContract.poolBalance();
				poolBal = ethers.utils.formatUnits(poolBal, sixDecimals);

				let estimatedAPY = await poolContract.juniorYieldPerecentage();

				let apy = ethers.utils.formatUnits(estimatedAPY, sixDecimals);
				obj.estimatedAPY = parseFloat(apy * 100).toFixed(2) + "%";
				if (tx.opportunityStatus.toString() === "8") {
					obj.yieldGenerated = getDisplayAmount(apy * stakingBal);
				}
				let investorWithdrawable = await poolContract.getUserWithdrawableAmount();
				investorWithdrawable = ethers.utils.formatUnits(
					investorWithdrawable.toString(),
					sixDecimals
				);
				obj.withdrawableAmt =
					parseInt(poolBal) >= parseInt(obj.opportunityAmount)
						? investorWithdrawable
						: 0;
				opportunityList.push(obj);
			}
			return { opportunityList, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getUserSeniorPoolInvestment = async () => {
	Sentry.captureMessage("getUserSeniorPoolInvestment", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			await requestAccount();
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			console.log({ signer });
			const contract = new ethers.Contract(
				process.env.REACT_APP_SENIORPOOL,
				seniorPool.abi,
				signer
			);

			let data = await contract.getUserInvestment();
			if (data) {
				return {
					data: {
						stakingAmt: parseFloat(
							ethers.utils.formatUnits(data.stakingAmt, sixDecimals)
						),
						withdrawableAmt: parseFloat(
							ethers.utils.formatUnits(data.withdrawableAmt, sixDecimals)
						),
					},
					success: true,
				};
			}
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const investInSeniorPool = async (amount) => {
	Sentry.captureMessage("investInSeniorPool", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			console.log({ provider });
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				process.env.REACT_APP_SENIORPOOL,
				seniorPool.abi,
				signer
			);
			amount = ethers.utils.parseUnits(amount, sixDecimals);
			let transaction = await contract.stake(amount);
			await transaction.wait();
			return { transaction, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const investInJuniorPool = async (poolAddress, amount) => {
	Sentry.captureMessage("investInJuniorPool", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			console.log({ provider });
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				poolAddress,
				opportunityPool.abi,
				signer
			);
			amount = ethers.utils.parseUnits(amount, sixDecimals);
			let transaction = await contract.deposit("0", amount); //0 denotes junior subpool
			await transaction.wait();
			return { transaction, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "Please connect your wallet!",
			};
		}
	} catch (error) {
		Sentry.captureException(error);
		return {
			success: false,
			msg: error.message,
		};
	}
};

export const getSeniorPoolData = async () => {
	Sentry.captureMessage("getOpportunityJson", "info");
	try {
		let file = await retrieveFiles(process.env.REACT_APP_SENIORPOOL_CID);
		let dataReader = await retrieveFileFromURL(
			getIPFSFileURL(process.env.REACT_APP_SENIORPOOL_CID) +
				"/seniorPoolData.json"
		);
		if (!dataReader) {
			dataReader = await retrieveFileFromURL(
				getIPFSFileURLOption2(process.env.REACT_APP_SENIORPOOL_CID) +
					"/seniorPoolData.json"
			);
		}
		if (!dataReader) {
			dataReader = await retrieveFileFromURL(
				getIPFSFileURLOption3(process.env.REACT_APP_SENIORPOOL_CID) +
					"/seniorPoolData.json"
			);
		}
		return dataReader;
	} catch (error) {
		Sentry.captureException(error);
	}
};
