import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { convertDate } from "../../../../services/BackendConnectors/userConnectors/commonConnectors";
import { getDisplayAmount } from "../../../../services/Helpers/displayTextHelper";
import DollarImage from "../../../../assets/Dollar-icon.svg";

const TransactionsCard = ({ data }) => {
	const [link, setLink] = useState();
	const [amount, setAmount] = useState();
	const [date, setDate] = useState();

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
		<div className="px-2 bg-neutral-100 dark:bg-darkmode-800 flex justify-around rounded-xl py-3 gap-4 md:gap-6 text-center text-neutral-900 dark:text-neutral-50">
			<p className="w-1/3 md:w-1/6 my-auto">{data?.opportunityName}</p>
			<p className="hidden md:block w-1/3 md:w-1/6 my-auto">{date}</p>
			<p className="hidden md:block w-1/3 md:w-1/6 my-auto">
				{data?.isWithdraw ? "Deposit" : "Withdrawal"}
			</p>

			<p className="flex gap-1 items-center w-1/3 md:w-1/6 my-auto justify-center">
				<img src={DollarImage} className="w-4" alt="" />
				{data?.isWithdraw ? "+" : "-"}
				{amount}
			</p>

			<p className="w-1/3 md:w-1/6 my-auto transaction-button">
				<button className="bg-gradient-to-r from-[#51B960] to-[#83DC90]">
					Completed
				</button>
			</p>

			{/* {data?.status === "Not Completed" && ( */}
			{/* {data?.input === "deprecated" && (
					<p className="w-1/6 text-center">
						<button
							style={{
								borderRadius: "35px",
								padding: "5px 8px",
								background:
									"linear-gradient(97.67deg, #E73838 1.07%, #FFBABA 100%)",
								border: "none",
								marginLeft: 5,
							}}
							className="btn btn-xs btn-error"
						>
							Not Completed
						</button>
					</p>
				)}
				{data?.status === "Processing" && (
					<p className="w-1/6 text-center">
						<button
							style={{
								borderRadius: "35px",
								padding: "5px 8px",
								background:
									"linear-gradient(95.8deg, #FFE202 5%, #F2B24E 95.93%)",
								border: "none",
							}}
							className="btn btn-xs btn-warning"
						>
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
			</a>
		</div>
	);
};

export default TransactionsCard;
