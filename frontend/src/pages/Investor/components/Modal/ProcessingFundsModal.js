import React from "react";
import { getTrimmedWalletAddress } from "../../../../services/Helpers/displayTextHelper";
import { useNavigate } from "react-router-dom";

const ProcessingFundsModal = ({
	investProcessing,
	invest,
	txhash,
	amounts,
	contractAddress,
	checkInvest,
	setCheckInvest,
}) => {
	const path = useNavigate();

	const data = invest ? "investment" : "withdraw";
	return (
		<div className="">
			<input
				type="checkbox"
				id={invest ? "InvestProcessModal" : "WithdrawProcessModal"}
				className="modal-toggle"
				checked={checkInvest}
			/>
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg px-4">
				<div className="bg-neutral-50 dark:bg-darkmode-800 w-[100%] sm:w-[85%] md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[45rem] pb-6 rounded-xl md:pb-8">
					<div className="md:px-8 flex px-4 py-3 text-2xl font-semibold border-b border-neutral-300 dark:border-neutral-500">
						<h3> {invest ? "Invest" : "Withdraw"}</h3>

						<button
							onClick={() => setCheckInvest(false)}
							className="ml-auto cursor-pointer"
						>
							✕
						</button>
					</div>

					<div className="px-4 md:px-8 mt-6">
						<div className=" flex flex-col  gap-4 text-center">
							<p className="text-5xl font-bold">
								{!investProcessing ? `Yay! 🎉` : "In Progress ⏱"}
							</p>
							<div className="flex justify-center items-center gap-2">
								<p className="text-xl font-semibold mt-1">
									{investProcessing
										? `${data} is in progress`
										: `${data} was successful`}
								</p>
								{investProcessing ? (
									<div className="animate-spin border-solid border-[3px] border-t-[#14171F] border-r-[#14171F] border-[#fff] w-[1.5rem] h-[1.5rem] rounded-full"></div>
								) : (
									<></>
								)}
							</div>
							{!investProcessing ? (
								<p className="font-semibold text-base">
									You successfully {invest ? "invested" : "withdrew"}
									<span className="text-success-500 px-1">
										{amounts} {process.env.REACT_APP_TOKEN_NAME}
									</span>
									{invest ? "in" : "from"} pool
								</p>
							) : (
								<></>
							)}
						</div>

						<div className="mt-3 border border-neutral-700 dark:border-neutral-500 px-4 py-4 rounded-lg flex flex-col gap-4">
							<div className="flex flex-col gap-4 md:flex-row md:justify-between">
								<div className="flex flex-col gap-1">
									<p className="text-neutral-400">Status</p>
									{investProcessing ? (
										<p className="text-warning-400 font-semibold">Processing</p>
									) : (
										<p className="text-success-500 font-semibold">Completed</p>
									)}
								</div>

								<div className="flex flex-col gap-1 md:mx-auto">
									<p className="text-neutral-400">Transaction ID</p>
									<p className="font-semibold pl-1">
										{txhash ? getTrimmedWalletAddress(txhash, 25) : "--"}
									</p>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<p className="text-neutral-400">Contract Address</p>
								<p className="font-semibold overflow-hidden">
									{contractAddress
										? getTrimmedWalletAddress(contractAddress, 25)
										: "--"}
								</p>
							</div>
						</div>

						<div className="border-2 border-neutral-300 dark:border-neutral-500 rounded-[1.8em] mt-8">
							<p className="text-black dark:text-white cursor-pointer font-semibold py-3 text-center">
								<button
									onClick={() => {
										path("/investorDashboard/transaction");
									}}
								>
									View Transaction
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProcessingFundsModal;
