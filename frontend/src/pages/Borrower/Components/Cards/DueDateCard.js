import React from "react";
import DollarImage from "../../../../assets/Dollar-icon.svg";

const DueDateCard = ({ data }) => {
	return (
		<div className="px-2 my-gradient flex justify-around rounded-xl py-3 gap-4 md:gap-6 ">
			<p className="w-1/3 md:w-1/4 my-auto text-center ">
				{data?.opportunityName}
			</p>
			<div className="hidden md:flex md:w-1/4  text-right pr-5 gap-1  justify-center">
				<img src={DollarImage} className="w-4" alt="logo" />
				{data?.opportunityAmount}
			</div>
			<div className="w-1/3 md:w-1/4 my-auto  text-right pr-5 flex gap-1  justify-center">
				<img src={DollarImage} className="w-4" alt="logo" />
				{data?.repaymentDisplayAmount}
			</div>
			<p className="w-1/3 md:w-1/4 text-center ">{data?.nextDueDate}</p>
		</div>
	);
};

export default DueDateCard;
