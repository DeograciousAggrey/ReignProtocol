import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TransactionCard from "./components/Cards/TransactionCard";
import axiosHttpService from "../../services/axioscall";
import { tokenTransactions } from "../../services/ApiOptions/blockchainTransactionDataOptions";
import InvestModal from "./components/Modal/InvestModal";
import {
	getUserWalletAddress,
	getWalletBal,
} from "../../services/BackendConnectors/userConnectors/commonConnectors";
import { getDisplayAmount } from "../../services/Helpers/displayTextHelper";
import Loader from "../../uiTools/Loading/Loader";
import ProcessingFundsModal from "./components/Modal/ProcessingFundsModal";
import DygnifyImage from "../../assets/Dygnify_Image.png";
import DollarImage from "../../assets/Dollar-icon.svg";
import ErrorModal from "../../uiTools/Modal/ErrorModal";

const ViewSeniorPool = () => {
	const location = useLocation();
	const defaultPoolName = "Liquidity Pool";
	const defaultAPY = "7";
	const defaultPoolAmount = 0;
	const [transactionData, setTransactionData] = useState([]);
	const [poolName, setPoolName] = useState(defaultPoolName);
	const [poolDescription, setPoolDescription] = useState();
	const [estimatedAPY, setEstimatedAPY] = useState(defaultAPY);
	const [poolAmount, setPoolAmount] = useState(defaultPoolAmount);
	const [selected, setSelected] = useState(null);
	const [processFundModal, setProcessFundModal] = useState();
	const [investProcessing, setInvestProcessing] = useState();
	const [kycStatus, setKycStatus] = useState();
	const [loading, setLoading] = useState(true);
	const [txhash, settxhash] = useState("");
	const [contractAdrress, setcontractAdrress] = useState("");
	const [amounts, setAmounts] = useState("");

	const [invest, setInvest] = useState(12);
	const [checkInvest, setCheckInvest] = useState();

	const [transactionList, setTransactionList] = useState(13);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const handleDrawdown = () => {
		setSelected(null);
	};
	useEffect(() => {
		if (location.state) {
			setPoolName(
				location.state.opportunityName
					? location.state.opportunityName
					: defaultPoolName
			);
			setPoolDescription(
				location.state.poolDescription ? location.state.poolDescription : ""
			);
			setEstimatedAPY(
				location.state.estimatedAPY ? location.state.estimatedAPY : defaultAPY
			);
			setKycStatus(location.state.kycStatus ? location.state.kycStatus : false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!kycStatus) {
			getUserWalletAddress()
				.then((res) => {
					if (res.success) {
						loadBlockpassWidget(res.address);
					} else {
						console.log(res.msg);
						setErrormsg({
							status: !res.success,
							msg: res.msg,
						});
					}
				})
				.finally(() => setLoading(false));
		} else setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadBlockpassWidget = (address) => {
		const blockpass = new window.BlockpassKYCConnect(
			process.env.REACT_APP_CLIENT_ID,
			{
				refId: address, // assign the local user_id of the connected user
			}
		);

		blockpass.startKYCConnect();

		blockpass.on("KYCConnectSuccess", () => {
			//add code that will trigger when data have been sent.
		});
	};

	useEffect(() => {
		getWalletBal(process.env.REACT_APP_SENIORPOOL).then((res) => {
			if (res.success) {
				setPoolAmount(getDisplayAmount(res.balance));
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
	}, [invest]);

	useEffect(() => {
		axiosHttpService(tokenTransactions(process.env.REACT_APP_SENIORPOOL)).then(
			(transactionDetails) => {
				if (transactionDetails && transactionDetails.res) {
					console.log(
						"%cgot transaction list",
						"font-size:2rem; color: lightpink;"
					);
					setTransactionData(transactionDetails.res.result);
				}
			}
		);
	}, [transactionList]);

	return (
		<div className="">
			{loading && <Loader />}
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<div className={`${loading ? "blur-sm" : ""}`}>
				{selected ? (
					<InvestModal
						handleDrawdown={handleDrawdown}
						isSenior={true}
						poolName={poolName}
						estimatedAPY={estimatedAPY}
						setProcessFundModal={setProcessFundModal}
						setInvestProcessing={setInvestProcessing}
						setSelected={setSelected}
						setInvest={setInvest}
						setTransactionList={setTransactionList}
						settxhash={settxhash}
						setcontractAdrress={setcontractAdrress}
						setAmounts={setAmounts}
						setCheckInvest={setCheckInvest}
						setErrormsg={setErrormsg}
					/>
				) : null}
				{processFundModal ? (
					<ProcessingFundsModal
						investProcessing={investProcessing}
						invest={true}
						txhash={txhash}
						contractAddress={contractAdrress}
						amounts={amounts}
						checkInvest={checkInvest}
						setCheckInvest={setCheckInvest}
					/>
				) : (
					<></>
				)}
				<div className=" flex items-center">
					<div className="flex items-center gap-3 md:gap-5">
						<img
							alt="dygnifyimage"
							src={DygnifyImage}
							style={{ aspectRatio: "1/1" }}
							className="rounded-[50%] w-[4em] sm:w-[5em] md:w-[6em]"
						/>

						<div>
							<p className="text-lg font-semibold">{poolName}</p>
						</div>
					</div>
				</div>

				<div className="mt-[2.5em] md:mt-[3.5em] flex flex-col gap-[1.5em] md:flex-row md:items-start xl:gap-[5em] 2xl:gap-[8em]">
					<div className="md:w-[60%] ">
						<div className="flex items-center mb-4">
							<h2 className="text-xl font-semibold md:text-2xl">
								Pool Overview
							</h2>
						</div>

						<div className="text-neutral-700 dark:text-neutral-200">
							{poolDescription}
						</div>
					</div>

					<div className="rounded-md px-4 py-6 dark:border border-[#363637] flex flex-col gap-6 md:w-[22rem] xl:w-[25rem] bg-gradient-to-tl from-[#ffffff00] dark:from-[#20232a00] to-[#D1D1D1] dark:to-[#20232A]">
						<div className="flex">
							<div className="flex flex-col justify-start text-neutral-500 dark:text-neutral-200">
								<p className=" font-bold text-md mb-2">Estimated APY.</p>
								<p className="font-bold text-md">Total Pool Balance</p>
							</div>

							<div className="ml-auto flex flex-col justify-start">
								<p className=" font-semibold text-xl mb-1 text-right">
									{estimatedAPY}%
								</p>
								<div className="flex gap-1 text-right">
									<img src={DollarImage} className="w-4" alt="dygnifyimage" />
									<p className="font-semibold text-xl">{poolAmount}</p>
								</div>
							</div>
						</div>

						<label
							htmlFor={kycStatus ? "InvestModal" : ""}
							id={kycStatus ? "" : "blockpass-kyc-connect"}
							onClick={() => {
								if (kycStatus) return setSelected(true);
								else return null;
							}}
							className="cursor-pointer font-semibold text-center py-2 rounded-[1.8em] sm:w-[50%] sm:mx-auto md:w-[100%] text-white bg-gradient-to-r from-[#4B74FF] to-[#9281FF]"
						>
							{kycStatus ? "Invest" : "Complete your KYC"}
						</label>
					</div>
				</div>

				<div className="mt-[3em] md:mt-[4em] md:w-[58%]">
					<h2 className="text-xl font-semibold md:text-2xl">Recent Activity</h2>
					{transactionData?.length ? (
						<div className=" mt-8 py-6  justify-start gap-4    flex font-bold border-y border-neutral-300 dark:border-darkmode-500">
							<p className="w-1/3 md:w-1/4 pl-4">Address</p>
							<p className="w-1/3 md:w-1/4 pl-4 sm:pl-10 md:pl-3 xl:pl-5">
								Type
							</p>
							<p className="w-1/3 md:w-1/4  text-end pr-4 sm:pr-10 md:pr-2 xl:pr-5 2xl:pr-8">
								Amount
							</p>
							<p className="hidden md:block w-1/3 md:w-1/4 text-end pr-4 ">
								Date
							</p>
						</div>
					) : (
						<></>
					)}
					{transactionData?.length > 0 ? (
						<div className="mt-6 flex flex-col gap-3">
							{transactionData ? (
								transactionData.map((item) => (
									<TransactionCard
										key={item.hash}
										data={item}
										address={process.env.REACT_APP_SENIORPOOL}
									/>
								))
							) : (
								<></>
							)}
						</div>
					) : (
						<p>Transaction details are not available at this moment</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ViewSeniorPool;
