import React, { useState, useEffect } from "react";
import GradientBtnForModal from "../../../../uiTools/Button/GradientBtnForModal";
import { getWalletBal } from "../../../../services/BackendConnectors/userConnectors/commonConnectors";
import WalletImage from "../../../../assets/wallet_white.png";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import ErrorModal from "../../../../uiTools/Modal/ErrorModal";

const DrawdownModal = ({ data, handleDrawdown, onDrawdown }) => {
	const [walletBal, setWalletBal] = useState();
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

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
	}, []);

	return (
		<>
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<input type="checkbox" id="drawdown-modal" className="modal-toggle" />
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg">
				<div className="bg-white dark:bg-darkmode-800  w-[100vw] h-[100vh] flex flex-col md:block md:h-auto md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[40%] pb-[6em] md:rounded-xl md:pb-8">
					<div className=" flex justify-between px-4 md:px-8 md:border-b mt-[4em] md:mt-0 py-4">
						<h3 className="font-semibold text-xl">Drawdown</h3>

						<label
							for="drawdown-modal"
							className="hover:text-primary-600 text-xl"
							onClick={() => handleDrawdown()}
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

							<img src={DollarImage} className="ml-auto w-[1rem]" alt="" />
							<p className="font-semibold text-[1.125rem]">{walletBal}</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-10 flex flex-col gap-1">
						<div className="flex justify-between font-semibold">
							<p>Pool Name</p>
							<p>{data?.opportunityName}</p>
						</div>
						<div className="flex justify-between font-semibold">
							<p>Interest Rate</p>
							<p>{data?.loanInterest}</p>
						</div>
						<div className="flex gap-1 font-semibold">
							<p>Available for drawdown</p>

							<img src={DollarImage} className="w-4 ml-auto" alt="" />
							<p>{data?.opportunityAmount}</p>
						</div>
					</div>

					<div className="px-4 md:px-8 mt-auto md:mt-8">
						<button
							onClick={onDrawdown}
							className="block font-semibold text-white focus:outline-offset-2 bg-gradient-to-r from-[#4B74FF] to-primary-500 w-[100%] cursor-pointer focus:outline-none focus:outline-[#9281FF] hover:outline-[#9281FF]
							  text-center py-2 rounded-[1.8em] select-none"
						>
							Drawdown Funds
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default DrawdownModal;
