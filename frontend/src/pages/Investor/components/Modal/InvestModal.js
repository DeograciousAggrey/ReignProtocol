import { React, useState, useEffect, useRef } from "react";
import WalletImage from "../../../../assets/wallet_white.png";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import { getWalletBal } from "../../../../services/BackendConnectors/userConnectors/commonConnectors";
import {
	investInJuniorPool,
	investInSeniorPool,
} from "../../../../services/BackendConnectors/userConnectors/investorConncector";
import approve from "../../../../services/BackendConnectors/approve";
import allowance from "../../../../services/BackendConnectors/allowance";
import Loader from "../../../../uiTools/Loading/Loader";

const InvestModal = ({
	isSenior,
	poolAddress,
	poolName,
	poolLimit,
	estimatedAPY,
	investableAmount,
	investableDisplayAmount,
	setProcessFundModal,
	setInvestProcessing,
	setSelected,
	settxhash,
	setcontractAdrress,
	setAmounts,
	setInvest,
	setTransactionList,
	handleDrawdown,
	setCheckInvest,
	setErrormsg,
}) => {
	const [amount, setAmount] = useState("");
	const [walletBal, setWalletBal] = useState();
	const [approvedvalue, setApprovedvalue] = useState();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState({
		approveErr: true,
		investErr: true,
		msg: "",
	});
	const inputElement = useRef();

	useEffect(() => {
		getWalletBal().then((res) => {
			if (res.success) {
				focusInput();
				setWalletBal(res.balance);
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
		userAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading]);

	const focusInput = () => {
		inputElement.current.focus();
	};

	async function investSenior() {
		setAmounts(amount);
		setcontractAdrress(process.env.REACT_APP_SENIORPOOL);
		setProcessFundModal(true);
		setInvestProcessing(true);
		handleDrawdown();
		setCheckInvest(true);
		const data = await investInSeniorPool(amount);
		setSelected(null);
		if (data.success) {
			settxhash(data.transaction.hash);
			setSelected(null);
			setInvestProcessing(false);
			console.log("done senior invest");
			setTimeout(() => {
				setInvest(Math.random());
			}, 1000);

			setTimeout(() => {
				setTransactionList(Math.random());
			}, 20000);
		} else {
			console.log(data?.msg);
			setSelected(null);
			setInvestProcessing(true);
			setProcessFundModal(false);
			setErrormsg({
				status: !data.status,
				msg: data.msg,
			});
		}
	}

	async function userAddress() {
		const contractAddress = isSenior
			? process.env.REACT_APP_SENIORPOOL
			: poolAddress;
		const data = await allowance(
			window.ethereum.selectedAddress,
			contractAddress
		);
		setApprovedvalue(data);
	}

	async function investJunior() {
		setAmounts(amount);
		setcontractAdrress(poolAddress);
		setProcessFundModal(true);
		setInvestProcessing(true);
		handleDrawdown();
		setCheckInvest(true);
		const data = await investInJuniorPool(poolAddress, amount);
		if (data.success) {
			settxhash(data.transaction.hash);
			setSelected(null);
			setInvestProcessing(false);

			setTimeout(() => {
				setInvest(Math.random());
			}, 1000);

			setTimeout(() => {
				console.log("getting transaction data after 15s");
				setTransactionList(Math.random());
			}, 15000);
		} else {
			console.log(data.msg);
			setSelected(null);
			setInvestProcessing(true);
			setProcessFundModal(false);

			setErrormsg({
				status: !data.status,
				msg: data.msg,
			});
		}
	}

	const handleAmount = (e) => {
		const value = e.target.value;
		let investInputCode = 0;

		// 0
		const defaultErr = {
			approveErr: false,
			investErr: true,
			msg: "",
		};

		// 1
		const allowedInvest = {
			approveErr: true,
			investErr: false,
			msg: "",
		};

		// 2
		const insufficientBalErr = {
			approveErr: true,
			investErr: true,
			msg: "Insufficient USDC to initiate transfer",
		};

		// 3
		const investableErr = {
			approveErr: true,
			investErr: true,
			msg: "Can't approve / invest more than Investable Amount",
		};

		// 4
		const invalidErr = {
			approveErr: true,
			investErr: true,
			msg: "Invalid Amount",
		};

		if (walletBal) {
			if (+value > +walletBal) {
				setError(insufficientBalErr);
				investInputCode = 2;
			} else if (+value > +approvedvalue) {
				setError(defaultErr);
				investInputCode = 0;
			} else if (+value <= +approvedvalue) {
				setError(allowedInvest);
				investInputCode = 1;
			} else {
				setError(defaultErr);
				investInputCode = 0;
			}
		}

		if (investableAmount) {
			if (+value > +investableAmount) {
				setError(investableErr);
				investInputCode = 3;
			} else {
				if (investInputCode === 0) {
					setError(defaultErr);
				}

				if (investInputCode === 1) {
					setError(allowedInvest);
				}
				if (investInputCode === 2) {
					setError(insufficientBalErr);
				}
			}
		}

		if (+value <= 0 || !value) {
			setError(invalidErr);
		} else {
			if (investInputCode === 0) {
				setError(defaultErr);
			}

			if (investInputCode === 1) {
				setError(allowedInvest);
			}
			if (investInputCode === 2) {
				setError(insufficientBalErr);
			}
		}

		setAmount(value);
	};

	return (
		<>
			<input type="checkbox" id="InvestModal" className="modal-toggle" />
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg">
				{loading && <Loader />}
				<div
					className={`bg-neutral-50 dark:bg-darkmode-800  w-[100vw] h-[100vh] flex flex-col md:block md:h-auto md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[40%] pb-[6em] md:rounded-xl md:pb-8 ${
						loading ? "blur-sm" : ""
					}`}
				>
					<div className="flex justify-between px-4 md:px-8 md:border-b md:border-neutral-300 md:dark:border-darkmode-500 mt-[4em] md:mt-0 py-4">
						<h3 className="font-semibold text-xl">Invest</h3>

						<label
							htmlFor="InvestModal"
							// onClick={() => handleDrawdown()}
							className=" hover:text-primary-600 text-xl"
						>
							✕
						</label>
					</div>

					<div className="px-4 md:px-8 mt-[4em] md:mt-6 flex flex-col gap-8">
						<img
							src={WalletImage}
							style={{ aspectRatio: 1 / 1 }}
							className="w-[4rem] mx-auto p-4 bg-purple-500 rounded-[50%]"
							alt=""
						/>

						<div className="py-4 px-3 flex gap-1 bg-neutral-200 dark:bg-darkmode-500 rounded-md">
							<p className="font-semibold text-[1.125rem]">Total Balance</p>

							<img alt="" src={DollarImage} className="ml-auto w-[1rem]" />
							<p className="font-semibold text-[1.125rem]">
								{walletBal ? walletBal : 0}
							</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-8 flex flex-col gap-1">
						<div className="flex justify-between font-semibold">
							<p className="">Pool Name</p>
							<p className="">{poolName}</p>
						</div>

						{poolLimit ? (
							<div className="flex gap-1 font-semibold">
								<p className="">Pool Limit</p>

								<img alt="" src={DollarImage} className="ml-auto w-[1rem]" />
								<p className="">{poolLimit}</p>
							</div>
						) : (
							<></>
						)}

						<div className="flex justify-between font-semibold">
							<p className="">Estimated APY</p>
							<p className="">
								{estimatedAPY}
								{isSenior ? "%" : ""}
							</p>
						</div>

						{!isSenior ? (
							<div className="flex gap-1 font-semibold">
								<p className="">Investable Amount</p>

								<img alt="" src={DollarImage} className="ml-auto w-[1rem]" />
								<p className="">{investableDisplayAmount}</p>
							</div>
						) : (
							<></>
						)}
					</div>

					<div className="relative px-4 md:px-8 mt-8 flex flex-col gap-1">
						<label htmlFor="investModalAmount" className="font-semibold">
							Enter Amount
						</label>
						<input
							ref={inputElement}
							type="number"
							id="investModalAmount"
							placeholder="0.0"
							onChange={handleAmount}
							value={amount}
							className="bg-neutral-100 dark:bg-darkmode-700 border-2 border-neutral-300 dark:border-darkmode-50 outline-none px-2 py-3 pr-14 rounded-md placeholder:text-neutral-500 placeholder:font-semibold"
						/>
						<span className="absolute right-7 md:right-11 text-neutral-500 top-10 font-semibold">
							{process.env.REACT_APP_TOKEN_NAME}
						</span>

						{error.msg.length > 0 && (
							<p className="text-[0.875rem] text-error-500">{error.msg}</p>
						)}
					</div>

					<div className="px-4 md:px-8 mt-auto md:mt-8">
						<button
							onClick={() => {
								console.log(process.env.REACT_APP_SENIORPOOL);
								if (!error.approveErr) {
									setLoading(true);
									const data = isSenior
										? approve(process.env.REACT_APP_SENIORPOOL, amount)
										: approve(poolAddress, amount);
									data
										.then(function (val) {
											setLoading(false);
											setError({
												approveErr: true,
												investErr: false,
												msg: "",
											});
										})
										.catch((error) => {
											setLoading(false);
										});
								}
							}} //if condition not true then investJunior will execute
							className={`block font-semibold text-white focus:outline-offset-2 ${
								error.approveErr
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40"
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer  focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]"
							}  text-center py-2 rounded-[1.8em] select-none `}
						>
							Approve
						</button>
					</div>
					<div className="px-4 md:px-8 mt-auto md:mt-8">
						<button
							onClick={() => {
								if (!error.investErr)
									isSenior ? investSenior() : investJunior();
							}} //if condition not true then investJunior will execute
							className={`block font-semibold text-white focus:outline-offset-2 ${
								error.investErr
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40"
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer   focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]"
							}  text-center py-2 rounded-[1.8em] select-none`}
						>
							Invest
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default InvestModal;
