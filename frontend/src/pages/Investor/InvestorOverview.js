import { useState, useEffect } from "react";
import PoolCard from "./components/Cards/PoolCard";
import GradientButtonHeader from "../../uiTools/Button/GradientButtonHeader";
import {
	getUserSeniorPoolInvestment,
	getJuniorWithdrawableOp,
	getSeniorPoolDisplaySharePrice,
	getTotalInvestmentOfInvestor,
	getSeniorPoolData,
} from "../../services/BackendConnectors/userConnectors/investorConncector";
import { getWalletBal } from "../../services/BackendConnectors/userConnectors/commonConnectors";
import { useNavigate } from "react-router-dom";
import DoughnutChart from "../Components/DoughnutChart";
import { getDisplayAmount } from "../../services/Helpers/displayTextHelper";
import Loader from "../../uiTools/Loading/Loader";
import ErrorModal from "../../uiTools/Modal/ErrorModal";

const InvestorOverview = () => {
	const [totalInvestment, setTotalInvestment] = useState(0);
	const [totalYield, setTotalYield] = useState(0);
	const [seniorPool, setSeniorPool] = useState();
	const [juniorPool, setJuniorPool] = useState([]);
	const [seniorPoolInvestment, setSeniorPoolInvestment] = useState();
	const [loading, setLoading] = useState(true);
	const [seniorPoolLoading, setSeniorPoolLoading] = useState(true);
	const [juniorPoolLoading, setJuniorPoolLoading] = useState(true);
	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const path = useNavigate();

	async function updateSummery() {
		let data = await getTotalInvestmentOfInvestor();

		if (data.success) {
			setTotalInvestment(data.totalInvestment);
			setTotalYield(data.totalYield);
			setSeniorPoolInvestment(data.data);
		}

		setSeniorPoolLoading(false);
	}
	// useEffect(() => {
	// 	getUserSeniorPoolInvestment()
	// 		.then((data) => {
	// 			if (data.success) {
	// 				setSeniorPoolInvestment(data.data);
	// 			}
	// 		})
	// 		.catch((error) => console.log("Failed to get liquidity pool investment"))
	// 		.finally(() => setSeniorPoolLoading(false));
	// }, []);

	useEffect(() => {
		if (seniorPoolInvestment) {
			let totalSPInvestment =
				seniorPoolInvestment.stakingAmt + seniorPoolInvestment.withdrawableAmt;
			if (totalSPInvestment.toFixed(2) <= 0.0) {
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

								if (res.success) {
									seniorInvestmentData.opportunityAmount = getDisplayAmount(
										res.balance
									);

									seniorInvestmentData.capitalInvested = getDisplayAmount(
										totalSPInvestment
									);

									const price = await getSeniorPoolDisplaySharePrice(
										spJson.estimatedAPY
									);

									if (price.success) {
										const { displaySharePrice, sharePriceFromContract } = price;
										seniorInvestmentData.estimatedAPY = displaySharePrice;
										seniorInvestmentData.yieldGenerated = getDisplayAmount(
											parseFloat(
												(totalSPInvestment * sharePriceFromContract) / 100
											)
										);

										setSeniorPool(seniorInvestmentData);
									} else {
										setSeniorPool(null);
										setErrormsg({
											status: !price.status,
											msg: price.msg,
										});
									}
								} else {
									setErrormsg({
										status: !res.success,
										msg: res.msg,
									});
								}
							}
						} catch (error) {
							console.log(error);
						}
					};
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [seniorPoolInvestment]);

	useEffect(() => {
		async function fetch() {
			await updateSummery();
			const juniorPools = await getJuniorWithdrawableOp();
			if (juniorPools.success) {
				setJuniorPool(juniorPools.opportunityList);
			} else {
				console.log(juniorPools.msg);
				setErrormsg({
					status: !juniorPools.status,
					msg: juniorPools.msg,
				});
			}

			setJuniorPoolLoading(false);
		}
		fetch();
	}, []);

	useEffect(() => {
		if (!juniorPoolLoading && !seniorPoolLoading) setLoading(false);
	}, [juniorPoolLoading, seniorPoolLoading]);

	return (
		<div className="lg:relative">
			{loading && <Loader />}
			<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
			<div className={`${loading ? "blur-sm" : ""}`}>
				<div className="flex items-center mb-8">
					<h2 className="text-[1.4rem] lg:text-[1.75rem] w-[50%] font-semibold">
						Investor's Dashboard
					</h2>
					<GradientButtonHeader
						onClick={() => path("/investorDashboard/invest")}
						className="ml-auto text-white"
					>
						+ Invest
					</GradientButtonHeader>
				</div>

				{/* parent div */}
				<div className="flex flex-col md:flex-row gap-6">
					{/* child 1 */}
					<div className="flex flex-col gap-4 card-gradient px-4 py-4 rounded-xl md:flex-row sm:px-[4vw] md:pl-2 md:pr-[1.5vw] md:gap-3 lg:px-[1vw] xl:px-[1vw] xl:gap-8 md:w-1/2 2xl:items-center 2xl:justify-around">
						<div className="flex flex-col items-center gap-2 md:items-start	">
							<h2 className="text-xl font-bold text-[#64748B] md:text-sm 2xl:text-lg">
								Yield Earned
							</h2>

							<div className="">
								{totalInvestment || totalYield ? (
									<DoughnutChart
										data={[totalInvestment, totalYield ? totalYield : 0]}
										color={["#5375FE", "#ffffff"]}
										width={200}
										labels={["Total Investment", "Total Yield"]}
										borderWidth={[1, 8]}
										legendStyle={{ display: false }}
									/>
								) : (
									<DoughnutChart
										data={[1]}
										color={["#64748B"]}
										width={200}
										labels={["Total Investment", "Total Yield"]}
										borderWidth={[1, 8]}
										legendStyle={{ display: false }}
									/>
								)}
							</div>
						</div>
						{/* Change this total implementation */}

						<div className="flex flex-col gap-3 justify-center">
							<div className="flex items-center md:flex-col md:items-start gap-1">
								<p className="text-sm lg:text-base text-[#64748B] flex gap-1 items-center">
									<span className="inline-block w-3 h-2 bg-primary-500 rounded-3xl"></span>
									Total amount invested
								</p>

								{totalInvestment === 0 ? (
									<p className="ml-auto md:ml-0  text-xl lg:text-[1.75rem] px-5">
										- -
									</p>
								) : (
									<div className="ml-auto md:ml-0 font-semibold flex items-end gap-2 px-4">
										<p className=" text-xl lg:text-[1.75rem] ">
											{getDisplayAmount(totalInvestment)}
										</p>
										<p className="text-base lg:text-xl">
											{process.env.REACT_APP_TOKEN_NAME}
										</p>
									</div>
								)}
							</div>

							<div className="flex items-center md:flex-col md:items-start gap-1">
								<p className="text-sm lg:text-base text-[#64748B]  flex gap-1 items-center">
									<span className="inline-block w-3 h-2 bg-white rounded-3xl"></span>
									Total Yield Earned
								</p>

								{totalYield === 0 ? (
									<p className="ml-auto md:ml-0 text-xl lg:text-[1.75rem] px-5">
										- -
									</p>
								) : (
									<div className="ml-auto md:ml-0 font-semibold flex items-end gap-2 px-5">
										<p className=" text-xl lg:text-[1.75rem] ">
											{getDisplayAmount(totalYield)}
										</p>
										<p className="text-base lg:text-xl">
											{process.env.REACT_APP_TOKEN_NAME}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* child 2 */}
					{/* <div className="card-gradient md:w-1/2 px-2 py-4 flex flex-col gap-4 rounded-xl 2xl:justify-center xl:px-6 ">
						<p className="text-sm lg:text-base font-semibold  sm:px-4">
							Growth of investment on reinvesting everything for
						</p>
						<LineChart />
					</div> */}
				</div>

				<div className="flex flex-col gap-5 mt-[4em] md:mt-[5em]">
					<h1 className="text-[1.75rem] md:text-2xl font-semibold">
						Your Investments
					</h1>

					<div className="mb-4">
						<h2 className="md:text-[1.75rem] text-2xl mb-4">
							Liquidity Provider
						</h2>
						{seniorPool ? (
							<PoolCard data={seniorPool} />
						) : (
							<div className="text-center">
								<p className="text-neutral-500 text-lg">No stats available.</p>
							</div>
						)}
					</div>

					<div>
						<h2 className="md:text-[1.75rem] text-2xl mb-4">Underwriter</h2>
						{juniorPool.length === 0 ? (
							<div className="text-center">
								<p className="text-neutral-500 text-lg">No stats available.</p>
							</div>
						) : (
							<div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
								{juniorPool.map((juniorPoolData) => (
									<PoolCard key={juniorPoolData.id} data={juniorPoolData} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvestorOverview;
<h2>InvestorOverview</h2>;
