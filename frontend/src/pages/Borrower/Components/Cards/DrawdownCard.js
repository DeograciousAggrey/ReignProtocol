import React, { useState } from "react";
import DrawdownModal from "../Modal/DrawdownModal";
import { drawdown } from "../../../../services/BackendConnectors/userConnectors/borrowerConnectors";
import DollarImage from "../../../../assets/Dollar-icon.svg";

const DrawdownCard = ({
	data,
	loadDrawdownList,
	setOpenProcessDrawdown,
	setProcessDrawdown,
	setUpdateRepayment,
	setDrawdownId,
	setCheckForDrawdown,
	setErrormsg,
}) => {
	const [selected, setSelected] = useState(null);

	const handleDrawdown = () => {
		setSelected(null);
	};
	const onDrawdown = async () => {
		setOpenProcessDrawdown(true);
		setProcessDrawdown(true);
		setCheckForDrawdown(true);
		handleDrawdown();
		const tx = await drawdown(data?.opportunityPoolAddress);
		if (tx.success) {
			setDrawdownId(tx.hash.hash);
			setSelected(null);
			loadDrawdownList(true);
			setProcessDrawdown(false);
			setUpdateRepayment(Math.random());
		} else {
			setOpenProcessDrawdown(false);
			console.log("cancle");
			setErrormsg({
				status: !tx.success,
				msg: tx.msg,
			});
		}
	};

	return (
		<div className="my-gradient px-4 py-8 flex flex-col gap-5 rounded-xl md:w-[48%] xl:w-[32%] 2xl:w-[min(32%,30rem)]">
			<h2 className=" text-[1.4375rem]">{data?.opportunityName}</h2>

			<div className="flex flex-col gap-2">
				<div className=" flex gap-1">
					<p>Capital Requested</p>
					<img src={DollarImage} className="w-4 ml-auto" alt="dollerimage" />
					<p>{data?.opportunityAmount} </p>
				</div>

				<div className=" flex gap-1">
					<p>Available for drawdown</p>

					<img src={DollarImage} className="w-4 ml-auto" alt="dollerimage" />
					<p>{data?.opportunityAmount}</p>
				</div>
			</div>
			<div className="text-center">
				<label
					htmlFor="drawdown-modal"
					onClick={() => setSelected(data)}
					className="bg-secondary-500 w-[100%] inline-block cursor-pointer py-2 rounded-3xl text-white"
				>
					Drawdown Funds
				</label>
			</div>
			{selected && (
				<DrawdownModal
					key={data?.id}
					data={data}
					handleDrawdown={handleDrawdown}
					onDrawdown={onDrawdown}
				/>
			)}
		</div>
	);
};

export default DrawdownCard;
