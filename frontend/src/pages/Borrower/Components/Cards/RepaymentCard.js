import React, { useState } from "react";
import RepaymentModal from "../Modal/RepaymentModal";
import DollarImage from "../../../../assets/Dollar-icon.svg";

const RepaymentCard = ({
	data,
	setOpenProcessRepayment,
	setProcessRepayment,
	loadRepaymentList,
	setwalletAddress,
	settransactionId,
	setpoolName,
	setamounts,
	setUpdateRepayment,
	setCheck,
	setErrormsg,
}) => {
	const [selected, setSelected] = useState(null);
	const handleRepayment = async () => {
		setSelected(null);
	};

	return (
		<div className="my-gradient px-4 py-8 flex flex-col gap-5 rounded-xl md:w-[48%] xl:w-[32%] 2xl:w-[min(32%,30rem)]">
			<h2 className="font-semibold text-[1.4375rem] text-black dark:text-white">
				{data?.opportunityName}
			</h2>

			<div className="flex flex-col gap-2">
				<div className=" flex gap-1">
					<p>Capital Borrowed</p>

					<img src={DollarImage} className="w-4 ml-auto" alt="dollerimage" />
					<p>{data?.opportunityAmount}</p>
				</div>
				<div className=" flex gap-1">
					{data?.isOverDue ? (
						<p className="text-error-500">Overdue Amount</p>
					) : (
						<p>Due Amount</p>
					)}

					<img src={DollarImage} className="w-4 ml-auto" alt="dollerimage" />
					<p className={`${data?.isOverDue ? "text-error-500" : ""}`}>
						{data?.repaymentDisplayAmount}
					</p>
				</div>

				<div className=" flex justify-between">
					<p>Due Date</p>
					<p>{data?.nextDueDate}</p>
				</div>
			</div>

			<div className="text-center">
				<label
					htmlFor="repayment-modal"
					onClick={() => setSelected(data)}
					className="bg-secondary-500 w-[100%] inline-block text-white  cursor-pointer py-2 rounded-3xl"
				>
					Make Repayment now
				</label>
			</div>
			{selected && (
				<RepaymentModal
					setOpenProcessRepayment={setOpenProcessRepayment}
					setProcessRepayment={setProcessRepayment}
					key={data?.id}
					data={selected}
					handleRepayment={handleRepayment}
					setwalletAddress={setwalletAddress}
					settransactionId={settransactionId}
					setpoolName={setpoolName}
					setamounts={setamounts}
					setUpdateRepayment={setUpdateRepayment}
					setCheck={setCheck}
					setErrormsg={setErrormsg}
				></RepaymentModal>
			)}
		</div>
	);
};

export default RepaymentCard;
