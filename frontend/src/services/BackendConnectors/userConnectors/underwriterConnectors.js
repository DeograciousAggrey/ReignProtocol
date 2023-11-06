const { ethers } = require("ethers");
const { getOpportunity } = require("../opportunityConnectors");
const { getEthAddress } = require("./commonConnectors");
const opportunityOrigination = require("../../../artifacts/contracts/protocol/OpportunityOrigination.sol/OpportunityOrigination.json");
const Sentry = require("@sentry/react");

export const getApprovalHistory = async () => {
	Sentry.captureMessage("getApprovalHistory", "info");
	try {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			console.log({ provider });
			const contract = new ethers.Contract(
				process.env.REACT_APP_OPPORTUNITY_ORIGINATION_ADDRESS,
				opportunityOrigination.abi,
				provider
			);
			const { result } = await getEthAddress();
			const underWriter = result;
			const opportunities = await contract.getUnderWritersOpportunities(
				underWriter
			);
			let count = opportunities.length;
			let opportunitiesList = [];

			for (let i = 0; i < count; i++) {
				let tx = await contract.opportunityToId(opportunities[i]);
				if (tx.opportunityStatus.toString() !== "0") {
					//neglecting non voted opoortunities.
					let { obj } = getOpportunity(tx);
					opportunitiesList.push(obj);
				}
			}
			return { opportunitiesList, success: true };
		} else {
			Sentry.captureMessage("Wallet connect error", "warning");
			return {
				success: false,
				msg: "please connect your wallet!",
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
