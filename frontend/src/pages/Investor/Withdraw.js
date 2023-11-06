import React, { useState, useEffect, useRef } from "react";

import WithdrawCard from "./components/Cards/WithdrawCard";
import { getWalletBal } from "../../services/BackendConnectors/userConnectors/commonConnectors";
import {
	getUserSeniorPoolInvestment,
	getSeniorPoolDisplaySharePrice,
	getJuniorWithdrawableOp,
	getSeniorPoolData,
} from "../../services/BackendConnectors/userConnectors/investorConncector";

import { getDisplayAmount } from "../../services/Helpers/displayTextHelper";

import WithdrawFundsModal from "./components/Modal/WithdrawFundsModal";
import Loader from "../../uiTools/Loading/Loader";
import ProcessingFundsModal from "./components/Modal/ProcessingFundsModal";
import ErrorModal from "../../uiTools/Modal/ErrorModal";

const Withdraw = () => {
	const [seniorPool, setSeniorPool] = useState();
	const [juniorPools, setJuniorPools] = useState([]);
	const [selected, setSelected] = useState(null);
	const [seniorPoolInvestment, setSeniorPoolInvestment] = useState();
	const [walletBal, setWalletBal] = useState();
	const [showModal, setShowModal] = useState(false);
	const [processFundModal, setProcessFundModal] = useState();
	const [investProcessing, setInvestProcessing] = useState();
	const [loading, setLoading] = useState(true);
	const [txhash, settxhash] = useState("");
	const [contractAdrress, setcontractAdrress] = useState("");
	const [amounts, setAmounts] = useState("");
	const [seniorPoolSharePrice, setSeniorPoolSharePrice] = useState();
	const [updateSenior, setUpdateSenior] = useState(12);
	const [updateJunior, setUpdateJunior] = useState(12);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});
	const [seniorPoolLoading, setSeniorPoolLoading] = useState(true);
	const [juniorPoolLoading, setJuniorPoolLoading] = useState(true);
	const [checkInvest, setCheckInvest] = useState();

	const handleForm = () => {
		setSelected(null);
	};

	useEffect(() => {
		getUserSeniorPoolInvestment()
			.then((data) => {
				if (data.success) {
					setSeniorPoolInvestment(data.data);
				} else {
					setSeniorPoolLoading(false);
					setSeniorPoolInvestment(null);
				}
			})
			.catch((error) => console.log("Failed to get liquidity pool investment"));

		getWalletBal().then((res) => {
			if (res.success) {
				setWalletBal(getDisplayAmount(res.balance));
			} else {
				console.log(res.msg);
				setErrormsg({
					status: !res.success,
					msg: res.msg,
				});
			}
		});
	}, [updateSenior]);

	useEffect(() => {
		if (seniorPoolInvestment) {
			let totalInvestment =
				seniorPoolInvestment.stakingAmt + seniorPoolInvestment.withdrawableAmt;
			if (totalInvestment.toFixed(2) <= 0.0) {
				setSeniorPoolLoading(false);
				return;
			}

			// fetch data from IPFS
			getSeniorPoolData().then((read) => {
				if (read) {
					read.onloadend = async function () {
						try {
							let spJson = JSON.parse(read.result);
							if (spJson) {
								let seniorInvestmentData = {};
								seniorInvestmentData.opportunityName = spJson.poolName;
								const res = await getWalletBal(
									process.env.REACT_APP_SENIORPOOL
								);

								let balance;

								if (res.success) {
									balance = res.balance;
									seniorInvestmentData.opportunityAmount =
										getDisplayAmount(balance);
								} else {
									setErrormsg({
										status: !res.success,
										msg: res.msg,
									});
								}

								seniorInvestmentData.capitalInvested =
									getDisplayAmount(totalInvestment);

								const price = await getSeniorPoolDisplaySharePrice(
									spJson.estimatedAPY
								);

								if (price.success) {
									const { sharePriceFromContract, displaySharePrice } = price;
									seniorInvestmentData.estimatedAPY = displaySharePrice;
									setSeniorPoolSharePrice(sharePriceFromContract);

									let withdrawAmtWithSharePrice = parseFloat(
										(seniorPoolInvestment.withdrawableAmt *
											(100 + parseFloat(sharePriceFromContract))) /
											100
									).toFixed(6);

									if (+balance >= withdrawAmtWithSharePrice) {
										seniorInvestmentData.withdrawableAmt =
											withdrawAmtWithSharePrice;
									} else {
										let humanReadableBal = parseFloat(balance).toFixed(2);
										seniorInvestmentData.withdrawableAmt =
											humanReadableBal === "0.00" ? humanReadableBal : balance;
									}
									setSeniorPool(seniorInvestmentData);
								} else {
									console.log(price.msg);
									setErrormsg({
										status: !price.status,
										msg: price.msg,
									});
								}
							}
						} catch (error) {
							console.log(error);
						} finally {
							setSeniorPoolLoading(false);
						}
					};
				}
			});
		} else {
			setSeniorPool(null);
		}
	}, [seniorPoolInvestment]);

	useEffect(() => {
		getJuniorWithdrawableOp()
			.then((opportunities) => {
				if (opportunities.success) {
					setJuniorPools(opportunities.opportunityList);
				}
				setJuniorPoolLoading(false);
			})
			.catch((error) => console.log(error));
	}, [updateJunior]);

	return (
		<div>
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<div>
				{selected && (
					<WithdrawFundsModal
						showModal={showModal}
						handleForm={handleForm}
						userWalletBal={walletBal}
						data={selected}
						setShowModal={setShowModal}
						setProcessFundModal={setProcessFundModal}
						setInvestProcessing={setInvestProcessing}
						settxhash={settxhash}
						setcontractAdrress={setcontractAdrress}
						setAmounts={setAmounts}
						setUpdateSenior={setUpdateSenior}
						setUpdateJunior={setUpdateJunior}
						seniorPoolSharePrice={seniorPoolSharePrice}
						setCheckInvest={setCheckInvest}
					/>
				)}
				{processFundModal ? (
					<ProcessingFundsModal
						investProcessing={investProcessing}
						invest={false}
						txhash={txhash}
						contractAddress={contractAdrress}
						amounts={amounts}
						checkInvest={checkInvest}
						setCheckInvest={setCheckInvest}
					/>
				) : (
					<></>
				)}

				<div className="">
					<h2 className="text-[1.4375rem] lg:text-[2.0625rem] ">Withdraw</h2>
				</div>

				<div className="mt-8">
					<div className="mb-16 flex flex-col gap-5">
						<h2 className="font-semibold text-[1.4375rem] md:text-[1.75rem]">
							Liquidity Provider
						</h2>
						<div>
							{seniorPoolLoading && (
								<div className="relative">
									<Loader />
								</div>
							)}

							{seniorPool ? (
								<WithdrawCard
									data={seniorPool}
									isSeniorPool={true}
									setSelected={setSelected}
									setShowModal={setShowModal}
								/>
							) : (
								<div className="text-center">
									<p className="text-neutral-500 text-lg">
										{juniorPoolLoading ? "" : "No stats are available."}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="mb-16 flex flex-col gap-5">
						<h2 className="font-semibold text-[1.4375rem] md:text-[1.75rem]">
							Underwriter
						</h2>

						<div className={`relative ${juniorPoolLoading ? "h-[18rem]" : ""}`}>
							{juniorPoolLoading && <Loader />}
							{juniorPools.length === 0 ? (
								<div className="text-center">
									<p className="text-neutral-500 text-lg">
										{juniorPoolLoading ? "" : "No stats are available."}
									</p>
								</div>
							) : (
								<div className="flex flex-col md:flex-row flex-wrap gap-5 md:gap-[1.8vw]">
									{juniorPools.map((item) => (
										<WithdrawCard
											key={item.id}
											data={item}
											isSeniorPool={false}
											setSelected={setSelected}
											setShowModal={setShowModal}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Withdraw;
<h2>Invest</h2>;
