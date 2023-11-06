export const loadBlockpassWidget = (refId) => {
	const blockpass = new window.BlockpassKYCConnect(
		process.env.REACT_APP_CLIENT_ID, // service client_id from the admin console
		{
			refId: refId, // assign the local user_id of the connected user
		}
	);

	blockpass.startKYCConnect();

	blockpass.on("KYCConnectSuccess", () => {
		//add code that will trigger when data have been sent.
	});
};

export const kycOptions = (refId) => {
	refId = "0x23Db9F9731BCFb35CAc11B2e8373ACD14318bDF5";
	const options = {
		url: `https://kyc.blockpass.org/kyc/1.0/connect/${process.env.REACT_APP_CLIENT_ID}/refId/${refId}`,
		method: "GET",
		headers: {
			Authorization: "f7067f1733f081a3d91af45181762b42",
		},
	};
	return options;
};
