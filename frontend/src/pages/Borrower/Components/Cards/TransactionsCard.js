import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { convertDate } from "../../../../services/BackendConnectors/userConnectors/commonConnectors";
import { getDisplayAmount } from "../../../../services/Helpers/displayTextHelper";
import DollarImage from "../../../../assets/Dollar-icon.svg";
import Website from "../../../SVGIcons/Website";

const TransactionsCard = ({ data }) => {
	const [amount, setAmount] = useState();
	const [date, setDate] = useState();
	const [link, setLink] = useState();

	useEffect(() => {
		if (data) {
			let amt = ethers.utils.formatUnits(data.value, data.tokenDecimal);
			setAmount(getDisplayAmount(amt));
			setDate(convertDate(data.timeStamp));
			setLink(`${process.env.REACT_APP_POLYGONSCAN_URL}/tx/${data.hash}`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="px-2 bg-lightmode-200 dark:bg-darkmode-800 flex justify-around rounded-xl py-3 gap-4 md:gap-6 text-center">
			<p className="w-1/3 md:w-1/6 my-auto ">{data?.opportunityName}</p>
			<p className="hidden md:block w-1/3 md:w-1/6 my-auto">{date}</p>
			<p className="hidden md:block w-1/3 md:w-1/6 my-auto">
				{data?.isWithdraw ? "Repayment" : "Drawdown"}
			</p>
			<p className="flex gap-1 items-center w-1/3 md:w-1/6 my-auto justify-center">
				<img src={DollarImage} className="w-4" alt="Dollarimage" />
				{data?.isWithdraw ? "+" : "-"}
				{amount}
			</p>

			<p className="w-1/3 md:w-1/6 my-auto transaction-button">
				<button className="bg-gradient-to-r from-[#51B960] to-[#83DC90]">
					Completed
				</button>
			</p>
			{/* 			
			{data?.status === "Not Completed" && (
				<p className="w-1/3 md:w-1/6 my-auto transaction-button">
					<button className="bg-gradient-to-r from-[#E73838] to-[#FFBABA] text-[0.775rem] xl:text-base">
						Not Completed
					</button>
				</p>
			)}
			{data?.status === "Processing" && (
				<p className="w-1/3 md:w-1/6 my-auto transaction-button">
					<button className="bg-gradient-to-r from-[#FFE202] to-[#F2B24E]">
						Processing
					</button>
				</p>
			)} */}
			<a
				className="hidden md:flex underline w-1/3 md:w-1/6 my-auto gap-1 items-center justify-center"
				href={link}
				target="_blank"
				rel="noopener noreferrer"
			>
				Transaction
				<Website />
			</a>
		</div>
	);
};

export default TransactionsCard;
