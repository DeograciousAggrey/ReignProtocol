import ArrowLeft from "../../Components/SVG/ArrowLeft";
import { useEffect, useState } from "react";
import Doller from "../../../../assets/Dollar-icon.svg";
import { getExtendableTextBreakup } from "../../../../services/Helpers/displayTextHelper";
import { getDisplayAmount } from "../../../../services/Helpers/displayTextHelper";

export default function Final({
	handlePrev,
	finalSubmit,
	formData,
	setCheckBox,
	checkBox,
}) {
	const [checked, setChecked] = useState(false);
	const [expand, setExpand] = useState(false);
	const [expand2, setExpand2] = useState(false);

	const [loanPurpose, setLoanPurpose] = useState({
		isSliced: false,
		firstText: "",
		secondText: "",
	});

	const [documentDescription, setDocumentDescription] = useState({
		isSliced: false,
		firstText: "",
		secondText: "",
	});

	function LoanPurpose() {
		if (!formData || !formData.loan_purpose) {
			return;
		}
		const { isSliced, firstText, secondText } = getExtendableTextBreakup(
			formData.loan_purpose,
			200
		);

		if (isSliced) {
			setLoanPurpose({
				firstText: firstText,
				secondText: secondText,
				isSliced: isSliced,
			});
		} else {
			setLoanPurpose({
				firstText: firstText,
				isSliced: isSliced,
			});
		}
	}
	function DocumentDescription() {
		if (!formData || !formData.collateral_document_description) {
			return;
		}
		const { isSliced, firstText, secondText } = getExtendableTextBreakup(
			formData.collateral_document_description,
			200
		);

		if (isSliced) {
			setDocumentDescription({
				firstText: firstText,
				secondText: secondText,
				isSliced: isSliced,
			});
		} else {
			setDocumentDescription({
				firstText: firstText,
				isSliced: isSliced,
			});
		}
	}
	useEffect(() => {
		if (formData) {
			LoanPurpose();
			DocumentDescription();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!checked && checkBox) {
		setChecked(true);
	}

	const handleClick = () => {
		finalSubmit(formData);
	};

	console.log("clicked...", formData);

	return (
		<div className="flex flex-col mt-20 md:mt-14 gap-1 md:gap-1 md:px-5 overflow-hidden">
			<div className="flex flex-col gap-3">
				<div className=" flex flex-col gap-1 md:gap-1">
					<h4 className="text-primary font-medium text-lg 2xl:text-xl mb-2 text-[#9281FF]">
						Loan Details
					</h4>

					<div className="flex w-full flex-col md:flex-row  justify-between">
						<div className="flex flex-col gap-2">
							<div className="font-[500] flex justify-between md:justify-start md:gap-7">
								<span className=" text-[#A0ABBB]">Pool Name</span>
								<span className="text-black dark:text-[#fff]">
									{formData.loan_name}
								</span>
							</div>

							<div className="font-[500] text-base flex justify-between md:justify-start md:gap-4">
								<span className=" text-[#A0ABBB]">Loan Tenure</span>
								<span className="text-black dark:text-[#fff]">
									{formData.loan_tenure ? `${formData.loan_tenure} Months` : ""}
								</span>
							</div>

							<div className="font-[500] text-base flex justify-between md:justify-start  md:gap-3">
								<span className=" text-[#A0ABBB]">Loan Interest</span>
								<span className="text-black dark:text-[#fff]">
									{formData.loan_interest ? `${formData.loan_interest}%` : ""}
								</span>
							</div>
						</div>

						<div className="mt-1 md:mt-0 flex flex-col gap-2">
							<div className="font-[500] text-base w-full flex justify-between  md:gap-7">
								<span className=" text-[#A0ABBB]"> Loan amount</span>
								<span className="text-black dark:text-[#fff] text-right flex gap-1">
									{formData.loan_amount ? (
										<img src={Doller} className="w-5" alt="dollerimage" />
									) : (
										""
									)}
									{getDisplayAmount(formData.loan_amount)}
								</span>
							</div>

							<div className="font-[500] text-base flex justify-between  md:gap-7">
								<span className=" text-[#A0ABBB]">Repayment frequency</span>
								<span className="text-black dark:text-[#fff] text-right">
									{formData.payment_frequency
										? `${formData.payment_frequency} Days`
										: ""}
								</span>
							</div>

							<div className="font-[500] text-base flex justify-between  md:gap-7">
								<span className="font-[500] text-[#A0ABBB]">Loan Type</span>

								<span className="text-black dark:text-[#fff] text-right ">
									{formData.loan_type === "1" ? "Term Loan" : "Bullet Loan"}
								</span>
							</div>
						</div>
					</div>

					<div className="font-[500] text-base w-full md:flex gap-2">
						<div className="text-[#A0ABBB] ">Loan&nbsp;Purpose</div>
						<div className="text-black dark:text-[#fff]">
							{loanPurpose.isSliced ? (
								<div>
									{loanPurpose.firstText}
									<span
										className=" font-semibold cursor-pointer text-[#A0ABBB]"
										onClick={() => setExpand(true)}
									>
										{expand ? null : "... view more"}
									</span>
									{expand ? <div>{loanPurpose.secondText}</div> : null}
									<span
										className=" font-semibold cursor-pointer text-[#A0ABBB]"
										onClick={() => setExpand(false)}
									>
										{expand ? "view less" : null}
									</span>
								</div>
							) : (
								<div>{loanPurpose.firstText}</div>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-1 md:gap-1 mt-5 md:mt-0 ">
					<h4 className="text-primary font-medium text-lg mb-2 text-[#9281FF]">
						Collateral
					</h4>

					<div className="flex flex-col md:justify-between gap-1 md:gap-2 md:flex-row">
						<div className="font-[500] text-base flex justify-between  md:gap-7">
							<span className=" text-[#A0ABBB]">Collateral document Name</span>
							<span className="text-black dark:text-[#fff]">
								{formData.collateral_document_name}
							</span>
						</div>

						<div className="font-[500] text-base flex justify-between  md:gap-7">
							<span className=" text-[#A0ABBB]">Collateral File</span>
							<span className="text-black dark:text-[#fff]">
								{formData.collateral_document[0]?.name}
							</span>
						</div>
					</div>

					<div className="flex-col font-[500] flex text-base mt-[0.1rem]">
						<span className="text-[#A0ABBB]">
							Collateral Document Description
						</span>
						<span className="text-black dark:text-[#fff]">
							{/* {formData.collateral_document_description} */}
							{documentDescription.isSliced ? (
								<div>
									{documentDescription.firstText}
									<span
										className=" font-semibold cursor-pointer text-[#A0ABBB]"
										onClick={() => setExpand2(true)}
									>
										{expand2 ? null : "... view more"}
									</span>
									{expand2 ? <div>{documentDescription.secondText}</div> : null}
									<span
										className=" font-semibold cursor-pointer text-[#A0ABBB]"
										onClick={() => setExpand2(false)}
									>
										{expand2 ? "view less" : null}
									</span>
								</div>
							) : (
								<div>{documentDescription.firstText}</div>
							)}
						</span>
					</div>
				</div>
			</div>
			<div className="text-center md:mt-1 mt-5  ">
				<input
					type="checkbox"
					checked={checked}
					onChange={() => {
						setCheckBox(checkBox ? false : true);
						setChecked((prev) => !prev);
					}}
					id="terms"
				/>
				&nbsp;
				<label htmlFor="terms"> I agree to all </label>
				<span
					onClick={() => {
						window.open("https://www.dygnify.com/privacy-policy", "_blank");
					}}
					className=" underline decoration-1 underline-offset-1 cursor-pointer text-[#6047FF]"
				>
					terms and condition
				</span>
			</div>

			<div className="flex flex-col-reverse gap-10  md:gap-0 justify-center md:justify-around md:flex-row md:items-center  w-full items-center content-center">
				<div className="pb-10 md:pb-0 md:mt-10">
					<label
						onClick={handlePrev}
						className="text-gray-500 flex-row cursor-pointer flex ml-1 md:pl-14 md:-mt-6"
					>
						<ArrowLeft color="#64748B" />
						Back
					</label>
				</div>

				<button
					// typeof="submit"
					// htmlFor="ProcessModal"
					onClick={handleClick}
					style={{
						borderRadius: "100px",
						padding: "12px 24px",
						color: "white",
					}}
					className={`mt-10 md:mt-2 btn btn-wide  capitalize font-medium border-none 
					bg-gradient-to-r from-[#4B74FF] to-[#9281FF] hover:from-[#9281FF] hover:to-[#4B74FF] focus:outline-[#9281FF]
					disabled:opacity-40 
							
					`}
					disabled={!checked}
				>
					Submit
				</button>
			</div>

			<div className="flex  justify-center  font-semibold text-sm text-[#FBBF24]">
				<div className="text-center">
					Note - This pool created will only be valid for 60 days from the day
					after verification
				</div>
			</div>
		</div>
	);
}
