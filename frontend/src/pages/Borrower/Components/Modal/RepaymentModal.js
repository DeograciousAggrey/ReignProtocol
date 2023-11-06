import React, { useState, useEffect } from "react";
import { repayment } from "../../../../services/BackendConnectors/userConnectors/borrowerConnectors";
import { getWalletBal } from "../../../../services/BackendConnectors/userConnectors/commonConnectors";
// import GradientBtnForModal from "../../../../uiTools/Button/GradientBtnForModal";
import WalletImage from "../../../../assets/wallet_white.png";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import approve from "../../../../services/BackendConnectors/approve";
import allowance from "../../../../services/BackendConnectors/allowance";
import Loader from "../../../../uiTools/Loading/Loader";
import ErrorModal from "../../../../uiTools/Modal/ErrorModal";

const RepaymentModal = ({
	data,
	handleRepayment,
	setOpenProcessRepayment,
	setProcessRepayment,
	setwalletAddress,
	settransactionId,
	setpoolName,
	setamounts,
	setUpdateRepayment,
	setCheck,
	setErrormsg,
}) => {
	const [walletBal, setWalletBal] = useState();
	const [approvedvalue, setApprovedvalue] = useState();
	const [isInvest, setIsInvest] = useState(false);
	const [isApproved, setIsApproved] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getWalletBal().then((res) => {
			if (res.success) {
				setWalletBal(res.balance);
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
		getAllowance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading]);

	async function getAllowance() {
		const newdata = await allowance(
			window.ethereum.selectedAddress,
			data.opportunityPoolAddress
		);
		console.log(data.repaymentAmount, "--", newdata);

		if (data.repaymentAmount <= newdata) {
			setIsInvest(true);
			setIsApproved(false);
		} else {
			setIsApproved(true);
			setIsInvest(false);
		}

		setApprovedvalue(data.repaymentAmount);
	}
	async function onRepayment() {
		settransactionId(null);
		setOpenProcessRepayment(true);
		setProcessRepayment(true);
		setpoolName(data?.opportunityName);
		setamounts(approvedvalue);
		setwalletAddress(data.opportunityPoolAddress);
		handleRepayment();
		setCheck(true);
		const res = await repayment(data.opportunityPoolAddress);
		if (!res.success) {
			setOpenProcessRepayment(false);
			setErrormsg({
				status: !res.success,
				msg: res.msg,
			});
		}
		console.log(res.tx);
		settransactionId(res.tx.hash);
		setProcessRepayment(false);
		setUpdateRepayment(Math.random());
	}
	return (
		<div>
			<input type="checkbox" id="repayment-modal" className="modal-toggle" />
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg">
				{loading && <Loader />}
				<div
					className={`bg-white dark:bg-darkmode-800  w-[100vw] h-[100vh] flex flex-col md:block md:h-auto md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[40%] pb-[6em] md:rounded-xl md:pb-8 ${
						loading ? "blur-sm" : ""
					}`}
				>
					<div className=" flex justify-between px-4 md:px-8 md:border-b mt-[4em] md:mt-0 py-4">
						<h3 className="font-semibold text-xl">Repayment</h3>

						<label
							htmlFor="repayment-modal"
							className="hover:text-primary-600 text-xl"
							onClick={() => handleRepayment()}
						>
							✕
						</label>
					</div>

					<div className="px-4 md:px-8 mt-[4em] md:mt-6 flex flex-col gap-8">
						<img
							src={WalletImage}
							style={{ aspectRatio: 1 / 1 }}
							className="w-[4rem] mx-auto p-4 bg-[#9281FF] rounded-[50%]"
							alt=""
						/>

						<div className="py-4 px-3 flex gap-1 bg-[#D0D5DD] dark:bg-darkmode-500 rounded-md ">
							<p className="font-semibold text-[1.125rem]">Total Balance</p>

							<img
								src={DollarImage}
								className="ml-auto w-[1rem]"
								alt="walletBal"
							/>
							<p className="font-semibold text-[1.125rem]">{walletBal}</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-10 flex flex-col gap-1">
						<div className="flex justify-between font-semibold">
							<p>Pool Name</p>
							<p>{data?.opportunityName}</p>
						</div>

						<div className="flex gap-1 font-semibold">
							{data?.isOverDue ? (
								<p className="flex justify-start text-error-500">
									Overdue Amount
								</p>
							) : (
								<p className="flex justify-start">Due Amount</p>
							)}

							<img
								src={DollarImage}
								className="ml-auto w-[1rem]"
								alt="DollarImage"
							/>
							<p className="font-semibold text-[1.125rem]">
								{data?.repaymentDisplayAmount}
							</p>
						</div>
						<div className="flex justify-between font-semibold">
							<p>Due Date</p>
							<p>{data?.nextDueDate}</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-auto md:mt-8">
						<button
							className={`block font-semibold text-white focus:outline-offset-2 ${
								!isApproved
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40 "
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]"
							}  text-center py-2 rounded-[1.8em] select-none`}
							onClick={() => {
								if (isApproved) {
									setLoading(true);
									const approvePromise = approve(
										data.opportunityPoolAddress,
										data.repaymentAmount
									);
									approvePromise
										.then(function (val) {
											setLoading(false);
											setIsApproved(false);
											setIsInvest(true);
										})
										.catch((error) => {
											setLoading(false);
										});
								}
							}}
						>
							Approve
						</button>
					</div>
					<div className="px-4 md:px-8 mt-auto md:mt-8">
						<button
							className={`block font-semibold text-white focus:outline-offset-2 ${
								!isInvest
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40"
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]"
							}  text-center py-2 rounded-[1.8em] select-none`}
							onClick={() => (isInvest ? onRepayment() : "")}
						>
							Make Repayment
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RepaymentModal;
