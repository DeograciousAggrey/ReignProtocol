import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import InvestModal from "../Investor/components/Modal/InvestModal";
import TransactionCard from "./components/Cards/TransactionCard";
import {
	getUserWalletAddress,
	getWalletBal,
} from "../../services/BackendConnectors/userConnectors/commonConnectors";
import axiosHttpService from "../../services/axioscall";
import Twitter from "../SVGIcons/Twitter";
import Website from "../SVGIcons/Website";
import LinkedIn from "../SVGIcons/LinkedIn";
import { getExtendableTextBreakup } from "../../services/Helpers/displayTextHelper";
import { getDisplayAmount } from "../../services/Helpers/displayTextHelper";
import { tokenTransactions } from "../../services/ApiOptions/blockchainTransactionDataOptions";
import Loader from "../../uiTools/Loading/Loader";
import ProcessingFundsModal from "./components/Modal/ProcessingFundsModal";
import DygnifyImage from "../../assets/Dygnify_Image.png";
// import UpArrow from "../SVGIcons/UpArrow";
import DollarImage from "../../assets/Dollar-icon.svg";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import {
	getBorrowerLogoURL,
	getOpportunityJson,
} from "../../services/BackendConnectors/userConnectors/borrowerConnectors";

const ViewPool = () => {
	const location = useLocation();
	const [poolData, setPoolData] = useState();
	const [transactionData, setTransactionData] = useState([]);
	const [expand, setExpand] = useState(false);
	const [companyDetails, setCompanyDetails] = useState();
	const [kycStatus, setKycStatus] = useState();
	const [poolBal, setPoolBal] = useState();
	const [info, setInfo] = useState([]);
	const [info2, setInfo2] = useState([]);
	const [loanPurpose, setLoanPurpose] = useState({
		isSliced: false,
		firstText: "",
		secondText: "",
	});
	const [selected, setSelected] = useState(null);
	const [logoImgSrc, setLogoImgSrc] = useState();
	const [processFundModal, setProcessFundModal] = useState();
	const [investProcessing, setInvestProcessing] = useState();

	const [loading, setLoading] = useState(true);
	const [txhash, settxhash] = useState("");
	const [contractAdrress, setcontractAdrress] = useState("");
	const [amounts, setAmounts] = useState("");
	const [invest, setInvest] = useState(12);
	const [transactionList, setTransactionList] = useState(13);
	const [isFullStatus, setIsFullStatus] = useState();
	const [checkInvest, setCheckInvest] = useState();

	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const handleDrawdown = () => {
		setSelected(null);
	};

	const loadBlockpassWidget = (address) => {
		const blockpass = new window.BlockpassKYCConnect(
			process.env.REACT_APP_CLIENT_ID, // service client_id from the admin console
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
		if (location?.state) {
			setPoolData(location.state);
			setKycStatus(
				location.state?.kycStatus ? location.state?.kycStatus : false
			);
			setIsFullStatus(location.state.isFull ? location.state.isFull : false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (poolData) {
			loadInfo();
			console.log(poolData);
			// get pool balance
			getWalletBal(poolData.opportunityPoolAddress).then((res) => {
				if (res.success) {
					setPoolBal(getDisplayAmount(res.balance));
				} else {
					console.log(res.msg);
					setErrormsg({
						status: !res.success,
						msg: res.msg,
					});
				}
			});

			// fetch the opportunity details from IPFS
			if (location.state.opData) {
				setCompanyDetails(location.state.opData.companyDetails);
				let imgUrl = getBorrowerLogoURL(
					location.state.opData.companyDetails?.companyLogoFile
						?.businessLogoFileCID,
					location.state.opData.companyDetails?.companyLogoFile
						?.businessLogoFileName
				);
				if (imgUrl) {
					setLogoImgSrc(imgUrl);
				}
				// get the loan purpose
				const { isSliced, firstText, secondText } = getExtendableTextBreakup(
					location.state.opData.loan_purpose,
					200
				);

				if (isSliced) {
					setLoanPurpose({
						firstText: firstText,
						secondText: secondText,
						isSliced: isSliced,
					});
				} else {
					setLoanPurpose({
						firstText: firstText,
						isSliced: isSliced,
					});
				}
			} else {
				getOpportunityJson(poolData).then((read) => {
					if (read) {
						read.onloadend = function () {
							let opJson = JSON.parse(read.result);
							if (opJson) {
								setCompanyDetails(opJson.companyDetails);
								let imgUrl = getBorrowerLogoURL(
									opJson.companyDetails?.companyLogoFile?.businessLogoFileCID,
									opJson.companyDetails?.companyLogoFile?.businessLogoFileName
								);
								if (imgUrl) {
									setLogoImgSrc(imgUrl);
								}
								// get the loan purpose
								const { isSliced, firstText, secondText } =
									getExtendableTextBreakup(opJson.loan_purpose, 200);

								if (isSliced) {
									setLoanPurpose({
										firstText: firstText,
										secondText: secondText,
										isSliced: isSliced,
									});
								} else {
									setLoanPurpose({
										firstText: firstText,
										isSliced: isSliced,
									});
								}
							}
						};
					}
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [poolData, invest]);

	useEffect(() => {
		if (poolData) {
			// get Pool Transaction Data
			axiosHttpService(tokenTransactions(poolData.opportunityPoolAddress))
				.then((transactionDetails) => {
					if (transactionDetails && transactionDetails.res) {
						setTransactionData(transactionDetails.res.result);
					}
				})
				.catch((error) => console.log(error));
		}
	}, [poolData, transactionList]);

	function loadInfo() {
		if (poolData) {
			setInfo([
				{
					label: "Interest Rate",
					value: poolData.loanInterest ? poolData.loanInterest : "--",
				},
				{
					label: "Payment Tenure",
					value: poolData.loanTenure ? poolData.loanTenure : "--",
				},
				{
					label: "Drawdown Cap",
					value: poolData.opportunityAmount ? poolData.opportunityAmount : "--",
				},
			]);

			setInfo2([
				{
					label: "Opening Date",
					value: poolData.createdOn ? poolData.createdOn : "--",
				},
				{
					label: "Payment Frequency",
					value: poolData.paymentFrequencyInDays
						? poolData.paymentFrequencyInDays
						: "--",
				},
				{
					label: "Borrower Address",
					value: poolData.borrowerDisplayAdd
						? poolData.borrowerDisplayAdd
						: "--",
				},
			]);
		}
	}

	const redirectToURl = (event) => {
		let url;
		console.log(event);

		switch (event.target.id) {
			case "twitter":
				url = companyDetails?.twitter;
				break;
			case "linkedin":
				url = companyDetails?.linkedin;
				break;
			case "website":
				url = companyDetails?.website;
				break;
			default:
				break;
		}

		if (url) {
			let protocol = "https://";
			let position = url.search(protocol);
			// if there is no "https://" in the url then it is not opened correctly
			if (position === -1) {
				url = protocol + url;
			}
			window.open(url, "_blank");
		}
	};

	return (
		<div>
			{loading && <Loader />}
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<div className={`${loading ? "blur-sm" : ""}`}>
				{selected ? (
					<InvestModal
						handleDrawdown={handleDrawdown}
						isSenior={false}
						poolAddress={poolData?.opportunityPoolAddress}
						poolName={poolData?.opportunityName}
						poolLimit={poolData?.opportunityAmount}
						estimatedAPY={poolData?.loanInterest}
						investableAmount={poolData?.investableAmount}
						investableDisplayAmount={poolData?.investableDisplayAmount}
						setProcessFundModal={setProcessFundModal}
						setInvestProcessing={setInvestProcessing}
						setSelected={setSelected}
						settxhash={settxhash}
						setcontractAdrress={setcontractAdrress}
						setAmounts={setAmounts}
						setInvest={setInvest}
						setTransactionList={setTransactionList}
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
							alt="dygnigyImage"
							src={logoImgSrc ? logoImgSrc : DygnifyImage}
							style={{ aspectRatio: "1/1" }}
							className="rounded-[50%] w-[4em] sm:w-[5em] md:w-[6em]"
						/>

						<div>
							<p className="text-lg font-semibold">
								{poolData?.opportunityName}
							</p>
							<p className="text-neutral-500">
								{companyDetails ? companyDetails.companyName : ""}
							</p>
						</div>
					</div>

					{/* social links */}
					<div className="ml-auto flex items-center gap-3 sm:gap-6 md:gap-4 text-white">
						{companyDetails?.linkedin ? (
							<button
								id="linkedin"
								className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
								onClick={redirectToURl}
							>
								<LinkedIn />
								LinkedIn
							</button>
						) : (
							<></>
						)}
						{companyDetails?.website ? (
							<button
								id="website"
								className="btn btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
								onClick={redirectToURl}
							>
								<Website />
								Website
							</button>
						) : (
							<></>
						)}

						{companyDetails?.twitter ? (
							<button
								id="twitter"
								className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  lowercase flex pb-5"
								onClick={redirectToURl}
							>
								<Twitter /> twitter
							</button>
						) : (
							<></>
						)}
					</div>
				</div>

				<div className="mt-[2.5em] md:mt-[3.5em] flex flex-col gap-[1.5em] md:flex-row md:items-start xl:gap-[5em] 2xl:gap-[8em]">
					<div className="md:w-[60%]">
						<div className="flex items-center mb-4">
							<h2 className="text-xl font-semibold md:text-2xl">
								Deals Overview
							</h2>
							{/* <div className="ml-auto flex gap-2 items-center px-3 py-1 rounded-[1.5em] bg-darkmode-500 cursor-pointer">
								View Details <UpArrow />
							</div> */}
						</div>

						{loanPurpose.isSliced ? (
							<div className="text-neutral-700 dark:text-neutral-200">
								{loanPurpose.firstText}
								<span
									onClick={() => setExpand(true)}
									className="cursor-pointer font-semibold"
								>
									{expand ? null : " ...view more"}
								</span>
								{expand ? <span>{loanPurpose.secondText}</span> : null}
								<span
									onClick={() => setExpand(false)}
									className="cursor-pointer font-semibold"
								>
									{expand ? " view less" : null}
								</span>
							</div>
						) : (
							<div className="text-neutral-700 dark:text-neutral-200">
								{loanPurpose.firstText}{" "}
							</div>
						)}
					</div>

					<div className="rounded-md px-4 py-6 border dark:border-[#363637] flex flex-col gap-6 md:w-[22rem] xl:w-[25rem] bg-gradient-to-tl from-[#ffffff00] dark:from-[#20232a00] to-[#D1D1D1] dark:to-[#20232A]">
						<div className="flex ">
							<div className="flex flex-col justify-start text-neutral-500 dark:text-neutral-200">
								<p className=" font-bold text-md mb-2">Estimated APY.</p>

								<p className=" font-bold text-md mb-2">Pool Limit</p>

								<p className=" font-bold text-md mb-2">Total supplied</p>

								<p className=" font-bold text-md mb-2">Payment terms</p>
								<p className=" font-bold text-md mb-2">Payment frequency</p>
							</div>
							<div className="ml-auto flex flex-col justify-start">
								<p className="font-semibold text-xl mb-1">
									{poolData ? poolData.loanInterest : "--"}
								</p>

								<p className="font-semibold text-xl mb-1 flex gap-1 items-center">
									<img src={DollarImage} className="w-4" alt="Dollar" />
									{poolData ? poolData.opportunityAmount : "--"}
								</p>
								<p className="font-semibold text-xl mb-1 flex gap-1 items-center">
									<img src={DollarImage} className="w-4" alt="DollarImage" />
									{poolBal ? poolBal : "--"}
								</p>
								<p className="font-semibold text-xl mb-1">
									{poolData ? poolData.loanTenure : "--"}
								</p>
								<p className="font-semibold text-xl mb-1">
									{poolData ? poolData.paymentFrequencyInDays : "--"}
								</p>
							</div>
						</div>

						<label
							htmlFor={kycStatus ? "InvestModal" : ""}
							id={kycStatus ? "" : "blockpass-kyc-connect"}
							onClick={() => {
								if (kycStatus && !isFullStatus) return setSelected(true);
								else return null;
							}}
							className={`block font-semibold text-white ${
								isFullStatus
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40"
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer"
							}  text-center py-2 rounded-[1.8em] select-none`}
							// className="cursor-pointer text-center py-2 bg-gradient-to-r from-[#4b74ff] to-[#9281ff] rounded-[1.8em] sm:w-[50%] sm:mx-auto md:w-[100%] text-white"
						>
							{kycStatus ? "Invest" : "Complete your KYC"}
						</label>
						{isFullStatus ? (
							<div className="flex  justify-center  font-semibold text-sm text-[#FBBF24]">
								<div className="text-center">
									Note - Cannot invest as opportunity is full
								</div>
							</div>
						) : (
							<></>
						)}
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

					{transactionData?.length ? (
						<div className="mt-6 flex flex-col gap-3">
							{transactionData.map((item) => (
								<TransactionCard
									key={item.hash}
									data={item}
									address={poolData.opportunityPoolAddress}
								/>
							))}
						</div>
					) : (
						<p>Transaction details are not available at this moment</p>
					)}
				</div>

				<div className="mt-[5em] md:w-[58%]">
					<h2 className="text-xl font-semibold md:text-2xl mb-6">
						Borrower Details
					</h2>

					<div>
						<div className=" flex items-center">
							<div className="flex items-center gap-3 md:gap-5">
								<img
									alt="logo"
									src={logoImgSrc ? logoImgSrc : DygnifyImage}
									style={{ aspectRatio: "1/1" }}
									className="rounded-[50%] w-[4em] sm:w-[5em] md:w-[6em]"
								/>

								<div>
									<p className="text-lg font-semibold">
										{companyDetails?.companyName}
									</p>
								</div>
							</div>

							<div className="ml-auto flex items-center gap-3 sm:gap-6 md:gap-4 text-white">
								{companyDetails?.linkedin ? (
									<button
										id="linkedin"
										className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
										onClick={redirectToURl}
									>
										<LinkedIn />
										LinkedIn
									</button>
								) : (
									<></>
								)}
								{companyDetails?.website ? (
									<button
										id="website"
										className="btn  btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  capitalize flex pb-5"
										onClick={redirectToURl}
									>
										<Website />
										Website
									</button>
								) : (
									<></>
								)}

								{companyDetails?.twitter ? (
									<button
										id="twitter"
										className="btn CreateProfileIcon btn-sm px-2 dark:border-none btn-outline dark:bg-[#292C33] border border-neutral-500  dark:text-white text-black py-2 gap-1 rounded-full  lowercase flex pb-5"
										onClick={redirectToURl}
									>
										<Twitter /> twitter
									</button>
								) : (
									<></>
								)}
							</div>
						</div>
						<div className="mt-4 text-neutral-700 dark:text-neutral-200">
							{companyDetails
								? companyDetails.companyBio
								: "Unable to fetch company profile"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewPool;
