import React, { useState } from "react";
import GradientButton from "../../uiTools/Button/GradientButton";
import Header from "../Layout/Header";
import { useNavigate } from "react-router-dom";
import BorrowImage from "../../assets/Borrow.svg";
import InvestImage from "../../assets/Invest.svg";
import InvestImageLightmode from "../../assets/Invest_lightmode.svg";
import BorrowImageLightmode from "../../assets/Borrow_lightmode.svg";
import ErrorModal from "../../uiTools/Modal/ErrorModal";
import { isConnected } from "../../services/BackendConnectors/userConnectors/commonConnectors";
const LandingPage = () => {
	const path = useNavigate();

	const [darkMode, setDarkMode] = useState(true);
	const [metaStatus, setMetaStatus] = useState(false);

	const [errormsg, setErrormsg] = useState({
		status: false,
		msg: "",
	});

	const fetchStatus = async () => {
		const getStatus = await isConnected();
		if (getStatus.success) {
		} else {
			setErrormsg({ status: !getStatus.success, msg: getStatus.msg });
		}
	};

	function hitRequestAccount() {
		fetchStatus();
	}

	return (
		<div className={`${darkMode ? "dark" : ""} background`}>
			<div className="dark:bg-[#000000] bg-white dark:text-white text-black pb-20 md:pb-32 xl:pb-20 w-full h-full">
				<div className="landing-backgroundimage">
					<Header
						darkMode={darkMode}
						setDarkMode={setDarkMode}
						setMetaStatus={setMetaStatus}
					/>
					<ErrorModal errormsg={errormsg} setErrormsg={setErrormsg} />
					<div className="px-4">
						<div className="flex-col items-center flex pt-20 xl:pt-10">
							<h1 className="text-4xl font-bold text-center w-[90%]  md:w-[78%] md:text-5xl xl:text-[3.1rem] xl:w-[50%] 2xl:text-[3.5]">
								Democratising Credit Flow to Small Business
							</h1>

							<h6 className="font-medium text-base w-[80%] text-center my-6 md:w-[55%] xl:w-[33%] 2xl:w-[30%]">
								DeFi platform enabling stable, attractive yields for digital
								asset investors via purpose-based investments in emerging market
								opportunities
							</h6>
						</div>
						<br />

						<div className="flex flex-col w-full items-center gap-24 md:gap-0 md:flex-row md:px-5 md:justify-evenly lg:px-32 xl:px-60 2xl:px-64">
							<div className="flex flex-col justify-center items-center">
								<img
									alt="invest"
									src={darkMode ? InvestImage : InvestImageLightmode}
									className="w-72 px-auto xl:w-[18rem] 2xl:w-[21rem]"
								/>
								<h6 className="text-center py-3 w-[80%] font-medium text-base">
									Invest USDC in real world assets and earn attractive risk
									adjusted returns.
								</h6>
								<GradientButton
									onClick={() => {
										hitRequestAccount();
										if (metaStatus) path("/investorDashboard/overview");
									}}
								>
									Invest
								</GradientButton>
							</div>
							<div className="flex flex-col justify-center items-center pt-1">
								<img
									alt="Borrow"
									src={darkMode ? BorrowImage : BorrowImageLightmode}
									className="w-72 px-auto xl:w-[18rem] 2xl:w-[21rem]"
								/>
								<h6 className="text-center py-3 w-[80%] font-medium text-base">
									On tap liquidity in a transaparent and hassle free manner at
									competitive prices.
								</h6>
								<GradientButton
									onClick={() => {
										hitRequestAccount();
										if (metaStatus) path("/borrowerDashboard/overview");
									}}
								>
									Borrow
								</GradientButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
