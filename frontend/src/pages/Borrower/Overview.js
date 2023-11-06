import React, { useState, useEffect } from "react";
import DrawdownCard from "./Components/Cards/DrawdownCard";
import DueDateCard from "./Components/Cards/DueDateCard";
import RepaymentCard from "./Components/Cards/RepaymentCard";
import LoanFormModal from "./Components/Modal/LoanFormModal";
import DashboardHeader from "./DashboardHeader";
import { getUserWalletAddress } from "../../services/BackendConnectors/userConnectors/commonConnectors";
import {
	getOpportunitiesWithDues,
	getDrawdownOpportunities,
} from "../../services/BackendConnectors/opportunityConnectors";
import DoughnutChart from "../Components/DoughnutChart";
import ProcessingRequestModal from "./Components/Modal/ProcessingModal";
import Loader from "../../uiTools/Loading/Loader";

import { getDisplayAmount } from "../../services/Helpers/displayTextHelper";
import KycCheckModal from "./Components/Modal/KycCheckModal";
import axiosHttpService from "../../services/axioscall";
import { kycOptions } from "../../services/KYC/blockpass";
import ProcessingDrawdownModal from "./Components/Modal/processingDrawdownModal";
import ProcessingRepaymentModal from "./Components/Modal/ProcessingRepaymentModal";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import { getBorrowerDetails } from "../../services/BackendConnectors/userConnectors/borrowerConnectors";

const Overview = () => {
	const [drawdownList, setDrawdownList] = useState([]);
	const [repaymentList, setRepaymentList] = useState([]);
	const [totalBorrowedAmt, setTotalBorrowedAmt] = useState("--");
	const [totalOutstandingAmt, setTotalOutstandingAmt] = useState("--");
	const [totalRepaidAmt, setTotalRepaidAmt] = useState("--");
	const [totalLoanAmtWithInterest, setTotalLoanAmtWithInterest] = useState(0);
	const [nextDueDate, setNextDueDate] = useState();
	const [nextDueAmount, setNextDueAmount] = useState();
	const [selected, setSelected] = useState(null);
	const [kycSelected, setKycSelected] = useState();
	const [kycStatus, setKycStatus] = useState();
	const [profileStatus, setProfileStatus] = useState();
	const [borrowReqProcess, setBorrowReqProcess] = useState(false);
	const [processModal, setProcessModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadDrawdownList, setLoadDrawdownList] = useState();
	const [loadRepaymentList, setLoadRepaymentList] = useState();
	const [processDrawdown, setProcessDrawdown] = useState();
	const [openProcessDrawdown, setOpenProcessDrawdown] = useState();
	const [openProcessRepayment, setOpenProcessRepayment] = useState();
	const [processRepayment, setProcessRepayment] = useState();
	const [transactionId, settransactionId] = useState("");
	const [walletAddress, setwalletAddress] = useState("");
	const [poolName, setpoolName] = useState("");
	const [amounts, setamounts] = useState("");
	const [drawdownId, setDrawdownId] = useState("");
	const [check, setCheck] = useState();
	const [checkForDrawdown, setCheckForDrawdown] = useState();

	const [updateRepayment, setUpdateRepayment] = useState(12);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const [fileUpload, setFileUpload] = useState({});

	const handleForm = () => {
		setSelected(null);
		setKycSelected(null);
	};

	const cutProcessModal = () => {
		setSelected(null);
		setProcessModal(null);
		setOpenProcessDrawdown(null);
	};

	useEffect(() => {
		const fetchData = async () => {
			let opportunities = await getDrawdownOpportunities();
			if (opportunities.success) {
				setDrawdownList(opportunities.opportunities);
			} else {
				setErrormsg({
					status: !opportunities.success,
					msg: opportunities.msg,
				});
			}
		};
		fetchData();
		getUserWalletAddress().then((res) => {
			if (res.success) {
				checkForKycAndProfile(res.address);
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
	}, [loadDrawdownList, updateRepayment]);

	function sortByProperty(property) {
		return function (a, b) {
			if (a[property] < b[property]) return -1;
			else if (a[property] > b[property]) return 1;

			return 0;
		};
	}

	const checkForKycAndProfile = async (refId) => {
		try {
			const result = await axiosHttpService(kycOptions(refId));
			if (
				result.res.status === "success" &&
				result.res.data.status === "approved"
			) {
				setKycStatus(true);
			}
			if (result.res.status === "error") {
				setKycStatus(false);
			}

			getBorrowerDetails().then((res) => {
				if (res.borrowerCid) {
					setProfileStatus(true);
				} else {
					setProfileStatus(false);
				}

				setLoading(false);
			});
		} catch (error) {
			console.log(error);
		}
	};

	// get all upcoming reapayments
	useEffect(() => {
		const fetchData = async () => {
			let opportunities = await getOpportunitiesWithDues();
			if (opportunities.success) {
				if (opportunities.opportunities.length >= 0) {
					//sort the list based on date
					opportunities.opportunities.sort(sortByProperty("epochDueDate"));
					setRepaymentList(opportunities.opportunities);

					// set next due date and amount
					setNextDueAmount(
						getDisplayAmount(opportunities.opportunities[0]?.repaymentAmount)
					);
					setNextDueDate(opportunities.opportunities[0]?.nextDueDate);
				} else {
					setRepaymentList([]);
				}
			} else {
				console.log(opportunities.msg);
				setErrormsg({
					status: !opportunities.success,
					msg: opportunities.msg,
				});
			}
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadRepaymentList, updateRepayment]);

	useEffect(() => {
		// set total borrowed amount
		let totalLoanAmt = 0;
		let totalLoanWithIntAmount = 0;
		let totalRepaidAmt = 0;
		for (const op of repaymentList) {
			let loanAmt = parseFloat(op.actualLoanAmount);
			totalLoanAmt += loanAmt;
			totalLoanWithIntAmount += op.TotalLoanRepaymentAmount;
			totalRepaidAmt += op.totalRepaidAmount;
		}
		if (totalLoanAmt >= 0) {
			setTotalBorrowedAmt(getDisplayAmount(totalLoanAmt));
		}

		totalRepaidAmt = totalRepaidAmt ? totalRepaidAmt : 0;
		setTotalRepaidAmt({
			amount: totalRepaidAmt,
			displayTotalRepaidAmt: getDisplayAmount(totalRepaidAmt),
		});
		totalLoanWithIntAmount = totalLoanWithIntAmount
			? totalLoanWithIntAmount
			: 0;

		setTotalLoanAmtWithInterest(totalLoanWithIntAmount);
		setTotalOutstandingAmt(
			getDisplayAmount(totalLoanWithIntAmount - totalRepaidAmt)
		);
	}, [repaymentList]);

	return (
		<>
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			{loading && <Loader />}
			<div className={`${loading ? "blur-sm" : ""}`}>
				<DashboardHeader
					setSelected={setSelected}
					kycStatus={kycStatus}
					profileStatus={profileStatus}
					setKycSelected={setKycSelected}
				/>
				{selected && (
					<LoanFormModal
						key={drawdownList?.id}
						data={drawdownList}
						handleForm={handleForm}
						setBorrowReqProcess={setBorrowReqProcess}
						setSelected={setSelected}
						setProcessModal={setProcessModal}
						setFileUpload={setFileUpload}
						setErrormsg={setErrormsg}
					/>
				)}

				{processModal && (
					<ProcessingRequestModal
						borrowReqProcess={borrowReqProcess}
						setSelected={setSelected}
						handleDrawdown={cutProcessModal}
						setProcessModal={setProcessModal}
						processModal={processModal}
						fileUpload={fileUpload}
					/>
				)}

				{kycSelected ? (
					<KycCheckModal kycStatus={kycStatus} profileStatus={profileStatus} />
				) : (
					<></>
				)}

				<div className=" mt-6 lg:mt-12 flex flex-col gap-4 md:flex-row ">
					<div className="card-gradient px-4 sm:px-6 md:px-3 pt-6 pb-3 rounded-xl md:flex flex-col justify-center md:w-[25%]">
						{totalBorrowedAmt ? (
							<div className="font-bold flex items-end gap-2 text-xl flex-wrap">
								<h3 className="text-[1.75rem] md:text-3xl xl:text-5xl text-[#26E367]">
									{totalBorrowedAmt}
								</h3>
								<p className="text-xl text-[#26E367]">
									{process.env.REACT_APP_TOKEN_NAME}
								</p>
							</div>
						) : (
							<p>--</p>
						)}

						<p className="font-semibold text-neutral-500 text-sm lg:text-base">
							Total Amount Borrowed
						</p>
					</div>

					<div className="card-gradient pt-3 pb-4  rounded-xl  md:w-[50%]">
						<div className="hidden md:block">
							<h2 className="text-neutral-500 font-semibold text-base md:text-xl px-5">
								Active loans distribution
							</h2>
						</div>
						<div className="flex flex-col gap-8 md:flex-row-reverse md:justify-between md:gap-[3vw] md:items-center md:px-5">
							<div className=" flex flex-col gap-3 items-center md:block ">
								<h2 className="text-neutral-500 font-semibold text-xl md:hidden">
									Active loans distribution
								</h2>
								{totalLoanAmtWithInterest || totalRepaidAmt.amount ? (
									<DoughnutChart
										data={[
											totalLoanAmtWithInterest - totalRepaidAmt.amount,
											totalRepaidAmt.amount ? totalRepaidAmt.amount : 0,
										]}
										color={["#5375FE", "#ffffff"]}
										width={200}
										labels={["Total Outstanding", "Total Repaid"]}
										borderWidth={[1, 8]}
										legendStyle={{ display: false }}
									/>
								) : (
									<DoughnutChart
										data={[1]}
										color={["#64748B"]}
										width={200}
										labels={["Total Outstanding", "Total Repaid"]}
										borderWidth={[1, 8]}
										legendStyle={{ display: false }}
									/>
								)}
							</div>

							<div className="px-4 sm:px-6 flex flex-col gap-2 md:px-0 md:py-2">
								<div className="flex flex-col gap-3 md:gap-2">
									<div className="flex md:flex-col gap-1 items-end md:items-start">
										<p className="text-neutral-500 flex gap-1 items-center">
											<span className="inline-block w-3 h-2 bg-gradient-to-r from-[#4B74FF] to-primary-500 rounded-3xl"></span>
											Total Outstanding
										</p>
										<div className="ml-auto font-semibold md:ml-0 flex  gap-2 items-end  px-4">
											<h3 className="text-2xl">
												{totalOutstandingAmt ? totalOutstandingAmt : "--"}
											</h3>
											<p className="">{process.env.REACT_APP_TOKEN_NAME}</p>
										</div>
									</div>

									<div className="flex md:flex-col gap-1 items-end md:items-start">
										<p className="text-neutral-500 flex gap-1 items-center">
											<span className="inline-block w-3 h-2 bg-white rounded-3xl"></span>
											Total Repaid
										</p>
										<div className="ml-auto font-semibold md:ml-0 flex  gap-2 items-end  px-4">
											<h3 className="text-2xl">
												{totalRepaidAmt?.displayTotalRepaidAmt
													? totalRepaidAmt?.displayTotalRepaidAmt
													: "--"}
											</h3>
											<p className="">{process.env.REACT_APP_TOKEN_NAME}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4 md:w-[25%]">
						<div className="card-gradient py-4 rounded-xl px-4 sm:px-6 md:h-[50%]">
							{nextDueAmount ? (
								<div className="font-bold text-primary-500 flex items-end gap-1 text-xl flex-wrap">
									<h3 className="text-[1.75rem] md:text-[1.1875rem] lg:text-2xl xl:text-[1.75rem]">
										{nextDueAmount}
									</h3>
									<p className="text-xl md:text-sm lg:text-xl">
										{process.env.REACT_APP_TOKEN_NAME}
									</p>
								</div>
							) : (
								<p>- -</p>
							)}
							<p className="text-neutral-500 text-[0.875rem]">
								Next Due Amount
							</p>
						</div>

						<div className="card-gradient py-4 rounded-xl px-4 sm:px-6 md:h-[50%]">
							{nextDueDate ? (
								<h3 className="font-bold text-[1.75rem] md:text-[1.1875rem] lg:text-2xl xl:text-[1.75rem] text-primary-500">
									{nextDueDate}
								</h3>
							) : (
								<p>- -</p>
							)}
							<p className="text-neutral-500 text-[0.875rem]">Next Due Date</p>
						</div>
					</div>
				</div>

				<div className="my-16">
					<h2 className="font-semibold text-[1.4375rem] mb-4">
						Repayment Notification
					</h2>
					{repaymentList.length === 0 ? (
						<div
							style={{ display: "flex", marginTop: 20 }}
							className="justify-center"
						>
							<div style={{ color: "#64748B", fontSize: 18 }}>
								No repayment available.
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
							{repaymentList.map((item) => (
								<RepaymentCard
									key={item.id}
									data={item}
									loadRepaymentList={setLoadRepaymentList}
									setOpenProcessRepayment={setOpenProcessRepayment}
									setProcessRepayment={setProcessRepayment}
									setwalletAddress={setwalletAddress}
									settransactionId={settransactionId}
									setUpdateRepayment={setUpdateRepayment}
									setpoolName={setpoolName}
									setamounts={setamounts}
									setCheck={setCheck}
									setErrormsg={setErrormsg}
								/>
							))}
						</div>
					)}

					{openProcessRepayment && (
						<ProcessingRepaymentModal
							check={check}
							setCheck={setCheck}
							processRepayment={processRepayment}
							transactionId={transactionId}
							walletAddress={walletAddress}
							poolName={poolName}
							amounts={amounts}
						/>
					)}
				</div>
				<div className="">
					<h2 className="font-semibold text-[1.4375rem] mb-4">
						Drawdown Funds
					</h2>

					{drawdownList.length === 0 ? (
						<div className="flex mt-5 justify-center">
							<p className="text-neutral-500 text-lg">No drawdown available.</p>
						</div>
					) : (
						<div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
							{drawdownList.map((item) => (
								<DrawdownCard
									key={item.id}
									data={item}
									loadDrawdownList={setLoadDrawdownList}
									setOpenProcessDrawdown={setOpenProcessDrawdown}
									setProcessDrawdown={setProcessDrawdown}
									setUpdateRepayment={setUpdateRepayment}
									setDrawdownId={setDrawdownId}
									setCheckForDrawdown={setCheckForDrawdown}
									setErrormsg={setErrormsg}
								/>
							))}
						</div>
					)}

					{openProcessDrawdown ? (
						<ProcessingDrawdownModal
							processDrawdown={processDrawdown}
							handleDrawdown={cutProcessModal}
							drawdownId={drawdownId}
							checkForDrawdown={checkForDrawdown}
							setCheckForDrawdown={setCheckForDrawdown}
						/>
					) : (
						<></>
					)}
				</div>

				<div className="my-16">
					<h2 className="font-semibold text-[1.4375rem] mb-4">
						Upcoming Due Dates
					</h2>

					<div className="px-1 mt-8 py-6 gap-4 md:gap-0 md:justify-around flex font-bold border-y border-darkmode-500 text-center">
						<p className="w-1/3 md:w-1/4 my-auto">Pool Name</p>
						<p className="hidden md:block w-1/3 md:w-1/4 my-auto">
							Capital Borrowed
						</p>
						<p className="w-1/3 md:w-1/4 my-auto">Amount Due</p>
						<p className="w-1/3 md:w-1/4 my-auto">Due Date</p>
					</div>
					{repaymentList.length === 0 ? (
						<div className="justify-center flex mt-10">
							<p className="text-neutral-500 text-lg">
								No due dates available.
							</p>
						</div>
					) : (
						<div className="my-5 flex flex-col gap-3">
							{repaymentList.map((item) => (
								<DueDateCard key={item.id} data={item} />
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Overview;
