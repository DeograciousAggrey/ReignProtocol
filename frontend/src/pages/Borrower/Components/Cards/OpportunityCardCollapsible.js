import React from "react";
import DoughnutChart from "../../../Components/DoughnutChart";
import DollarImage from "../../../../assets/Dollar-icon.svg";
const OpportunityCardCollapsible = ({ data }) => {
	function getStatus(index) {
		let status = "";
		switch (index) {
			case "0":
				status = "Under Review";
				break;
			case "1":
				status = "Rejected";
				break;
			case "2":
				status = "Approved";
				break;
			case "3":
				status = "Unsure";
				break;
			case "4":
				status = "Collateralized";
				break;
			case "5":
				status = "Active";
				break;
			case "6":
				status = "Drawndown";
				break;
			case "7":
				status = "WriteOff";
				break;
			case "8":
				status = "Repaid";
				break;
			default:
				break;
		}

		return status;
	}

	console.log(data);

	return (
		<div className="collapse collapse-arrow dark:bg-darkmode-500 bg-lightmode-200 rounded-xl">
			<input type="checkbox" className="peer" />

			<div className="collapse-title flex gap-4 md:gap-8 text-center">
				<p className="w-1/3 md:w-1/4  my-auto">{data?.opportunityName}</p>
				<p className="md:flex gap-1 hidden items-center w-1/4  justify-center">
					<img src={DollarImage} className="w-4" alt="dollerImage" />
					{data?.opportunityAmount}
				</p>
				<p className="w-1/3 md:w-1/4  my-auto">{data?.createdOn}</p>
				<p className="w-1/3 md:w-1/4  my-auto">{getStatus(data?.status)}</p>
			</div>

			<div className="collapse-content">
				<div className="font-semibold pt-8 pb-4">
					<div className="hidden md:flex justify-evenly">
						<div className="">
							<DoughnutChart
								data={[
									+data?.status >= 6
										? 0
										: data.actualLoanAmount - data.poolBalance,
									+data?.status >= 6 ? data.actualLoanAmount : data.poolBalance,
								]}
								color={["#5375FE", "#ffffff"]}
								width={200}
								labels={["Capital Requested", "Total Raised"]}
								borderWidth={[1, 8]}
								legendStyle={{ display: false }}
							/>
						</div>

						<div className="flex gap-8 xl:gap-14 2xl:gap-[8vw] ">
							<div className="border-r-2 border-darkmode-500 pr-6 xl:pr-12 2xl:pr-[6vw] flex flex-col justify-evenly">
								<div className="">
									<p className="text-neutral-300">Capital requested</p>

									<p className="text-lg flex gap-1">
										{data ? data.opportunityAmount : "--"}
										<span>{process.env.REACT_APP_TOKEN_NAME}</span>
									</p>
								</div>

								<div className="">
									<p className="text-neutral-300">Total raised till now</p>
									<p className="text-lg flex gap-1">
										{data && data.poolDisplayBalance
											? +data?.status >= 6
												? data.opportunityAmount
												: data.poolDisplayBalance
											: "-- "}

										<span>{process.env.REACT_APP_TOKEN_NAME}</span>
									</p>
								</div>
							</div>
							<div className="flex flex-col justify-evenly 2xl:pr-[6vw]">
								<div>
									<p className="text-neutral-300">Interest Rate</p>
									<p className="text-lg">{data?.loanInterest}</p>
								</div>

								<div>
									<p className="text-neutral-300">Loan Tenure</p>
									<p className="text-lg">{data?.loanTenure}</p>
								</div>
							</div>

							<div className="flex flex-col justify-evenly">
								<div className="">
									<p className="text-neutral-300">Payment Frequency</p>
									<p className="text-lg">{data?.paymentFrequencyInDays}</p>
								</div>

								<div className="">
									<p className="text-neutral-300">Loan Type</p>
									<p className="text-lg">
										{data?.loanType === "0" ? "Bullet Loan" : "Term Loan"}
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-center md:hidden gap-6">
						<DoughnutChart
							data={[data.actualLoanAmount, data.poolBalance]}
							color={["#5375FE", "#ffffff"]}
							width={200}
							labels={["Capital Requested", "Total Raised"]}
							borderWidth={[1, 8]}
							legendStyle={{ display: false }}
						/>

						<div className="flex w-full justify-around">
							<div className="flex flex-col gap-3">
								<div className="">
									<p className="text-neutral-300">Capital requested</p>

									<p className="text-lg flex gap-1">
										<img src={DollarImage} className="w-4" alt="dollerImage" />
										{data ? data.opportunityAmount : "--"}
									</p>
								</div>
								<div>
									<p className="text-neutral-300">Interest Rate</p>
									<p className="text-lg">{data?.loanInterest}</p>
								</div>

								<div>
									<p className="text-neutral-300">Loan Tenure</p>
									<p className="text-lg">{data?.loanTenure}</p>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<div className="">
									<p className="text-neutral-300">Total raised till now</p>
									<p className="text-lg flex gap-1">
										<img src={DollarImage} className="w-4" alt="dollerImage" />
										{data && data.poolDisplayBalance
											? data.poolDisplayBalance
											: "-- "}
									</p>
								</div>

								<div className="">
									<p className="text-neutral-300">Payment Frequency</p>
									<p className="text-lg">{data?.paymentFrequencyInDays}</p>
								</div>

								<div className="">
									<p className="text-neutral-300">Loan Type</p>
									<p className="text-lg">
										{data?.loanType === 0 ? "Bullet Loan" : "Term Loan"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OpportunityCardCollapsible;
