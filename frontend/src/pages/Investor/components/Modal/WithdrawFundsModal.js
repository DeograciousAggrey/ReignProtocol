import React, { useEffect, useState, useRef } from "react";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import {
	withdrawAllJunior,
	withdrawSeniorPoolInvestment,
} from "../../../../services/BackendConnectors/userConnectors/investorConncector";

import WalletImage from "../../../../assets/wallet_white.png";
import ErrorModal from "../../../../uiTools/Modal/ErrorModal";
import { getDisplayAmount } from "../../../../services/Helpers/displayTextHelper";

const WithdrawFundsModal = ({
	userWalletBal,
	handleForm,
	data,
	showModal,
	setShowModal,
	setProcessFundModal,
	setInvestProcessing,
	settxhash,
	setcontractAdrress,
	setAmounts,
	setUpdateSenior,
	setUpdateJunior,
	seniorPoolSharePrice,
	setCheckInvest,
}) => {
	const [amount, setAmount] = useState("");
	const [error, setError] = useState({
		err: true,
		msg: "",
	});
	const inputElement = useRef();

	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	async function withdrawJunior() {
		setCheckInvest(true);
		setShowModal(false);
		setProcessFundModal(true);
		setInvestProcessing(true);
		setAmounts(getDisplayAmount(data?.withdrawableAmt));
		setcontractAdrress(data.opportunityPoolAddress);
		const withdrawalData = await withdrawAllJunior(data.opportunityPoolAddress);
		if (withdrawalData.success) {
			settxhash(withdrawalData.transaction.hash);
			setShowModal(false);
			handleForm();
			setInvestProcessing(false);
			setUpdateJunior(Math.random());
		} else {
			setCheckInvest(false);
			console.log(withdrawalData.msg);
			setErrormsg({
				status: !withdrawalData.status,
				msg: withdrawalData.msg,
			});
		}
	}
	const focusInput = () => {
		inputElement.current.focus();
	};
	useEffect(() => {
		if (data?.isSeniorPool) {
			focusInput();
		}
	}, [showModal]);

	async function withdrawSeniorPool() {
		setCheckInvest(true);
		setShowModal(false);
		settxhash(false);
		setProcessFundModal(true);
		setInvestProcessing(true);
		setAmounts(amount);
		setcontractAdrress(process.env.REACT_APP_SENIORPOOL);
		console.info(amount);
		let withdrawAmt = parseFloat(
			(amount * 100) / (100 + +seniorPoolSharePrice)
		).toFixed(6);
		const data = await withdrawSeniorPoolInvestment(withdrawAmt);
		if (data.success) {
			settxhash(data.transaction.hash);
			setShowModal(false);
			handleForm();
			setInvestProcessing(false);
		} else {
			setCheckInvest(false);
			setProcessFundModal(false);
			console.log(data?.msg);
			setErrormsg({
				status: !data.status,
				msg: data.msg,
			});
		}

		setUpdateSenior(Math.random());
	}

	const handleMax = () => {
		handleAmount(data?.withdrawableAmt);
	};

	const handleAmount = (e) => {
		const value = e.target ? e.target.value : e;

		const defaultErr = {
			err: false,
			msg: "",
		};
		const invalidErr = {
			err: true,
			msg: "Invalid Amount",
		};
		const errObj = {
			err: true,
			msg: "Withdraw amount can't be greater than withdrawable amount.",
		};

		if (data?.withdrawableAmt) {
			if (+value > data?.withdrawableAmt) {
				setError(errObj);
			} else {
				setError(defaultErr);
			}
		}
		if (+value <= 0 || !value) {
			setError(invalidErr);
		}

		setAmount(value.toString());
	};

	return (
		<>
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<input
				type="checkbox"
				id="WithdrawModal"
				className="modal-toggle"
				checked={showModal}
				readOnly
			/>
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg">
				<div className="bg-neutral-50 dark:bg-darkmode-800  w-[100vw] h-[100vh] flex flex-col md:block md:h-auto md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[40%] pb-[6em] md:rounded-xl md:pb-8">
					<div className=" flex justify-between px-4 md:px-8 md:border-b mt-[4em] md:mt-0 py-4">
						<h3 className="font-semibold text-xl">Withdraw Funds</h3>

						<button
							className="hover:text-primary-600 text-xl"
							onClick={() => setShowModal(false)}
						>
							✕
						</button>
					</div>

					<div className="px-4 md:px-8 mt-[4em] md:mt-6 flex flex-col gap-8">
						<img
							src={WalletImage}
							style={{ aspectRatio: 1 / 1 }}
							className="w-[4rem] mx-auto p-4 bg-purple-500 rounded-[50%]"
							alt=""
						/>

						<div className="py-4 px-3 flex gap-1 bg-neutral-200 dark:bg-darkmode-500 rounded-md ">
							<p className="font-semibold text-[1.125rem]">Total Balance</p>
							<img alt="" src={DollarImage} className="ml-auto w-[1rem]" />
							<p className="font-semibold text-[1.125rem]">{userWalletBal}</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-8 flex flex-col gap-1">
						<div className="flex justify-between font-semibold">
							<p>Pool Name</p>
							<p>{data?.opportunityName}</p>
						</div>

						<div className="flex gap-1 font-semibold">
							<p>Amount Invested</p>

							<img alt="" src={DollarImage} className="w-4 ml-auto" />
							<p>{data?.capitalInvested}</p>
						</div>

						<div className="flex justify-between font-semibold">
							<p>Estimated APY</p>
							<p>{data?.estimatedAPY}</p>
						</div>
						<div className="flex gap-1 font-semibold">
							<p>Available for withdrawal</p>

							<img alt="" src={DollarImage} className="w-4 ml-auto" />
							<p>{getDisplayAmount(data?.withdrawableAmt)}</p>
						</div>
					</div>

					<div className="relative px-4 md:px-8 mt-8 flex flex-col gap-1">
						{data.isSeniorPool ? (
							<>
								<label htmlFor="investModalAmount" className="font-semibold">
									Enter Amount
								</label>
								<input
									ref={inputElement}
									type="number"
									className="bg-neutral-100 dark:bg-darkmode-700 border-2 border-neutral-300 dark:border-darkmode-50 outline-none px-2 py-3 pr-14 rounded-md placeholder:text-neutral-500 placeholder:font-semibold"
									id="exampleNumber0"
									placeholder="0.0"
									onChange={handleAmount}
									value={amount}
								/>

								<span className="absolute right-7 md:right-11 text-neutral-500 top-10 font-semibold">
									{process.env.REACT_APP_TOKEN_NAME}
								</span>
								<p
									onClick={handleMax}
									className="text-right pr-2 text-primary-400 cursor-pointer underline"
								>
									Max
								</p>

								{error.err && (
									<p className="text-[0.875rem] text-error-500">{error.msg}</p>
								)}
							</>
						) : (
							<></>
						)}
					</div>

					<div className="px-4 md:px-8 mt-auto md:mt-8 flex flex-col gap-4">
						<button
							className={`block font-semibold text-white focus:outline-offset-2 ${
								error.err && data?.isSeniorPool
									? "bg-neutral-400 cursor-not-allowed w-full opacity-40"
									: "bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]"
							}  text-center py-2 rounded-[1.8em] select-none `}
							onClick={() => {
								!error.err && data?.isSeniorPool
									? withdrawSeniorPool()
									: withdrawJunior();
							}}
						>
							Withdraw Funds
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default WithdrawFundsModal;
