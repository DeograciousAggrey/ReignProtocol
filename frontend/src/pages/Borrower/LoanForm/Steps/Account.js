import { useFormik } from "formik";
import GradientButton from "../../../../uiTools/Button/GradientButton";
import TextArea from "../../../../uiTools/Inputs/TextArea";
import TextField from "../../../../uiTools/Inputs/TextField";
import { loanDetailsValidationSchema } from "../validations/validation";
import Selection from "../../../../uiTools/Inputs/Selection";
import { useState } from "react";

const loantenure = [
	{ value: 6, label: 6 },
	{ value: 12, label: 12 },
	{ value: 18, label: 18 },
	{ value: 24, label: 24 },
	{ value: 30, label: 30 },
	{ value: 36, label: 36 },
];

const paymentfrequency = [
	{ value: 30, label: 30 },
	{ value: 60, label: 60 },
	{ value: 90, label: 90 },
];
const loantypes = [
	{ value: 1, label: "Term Loan" },
	{ value: 0, label: "Bullet Loan" },
];

export default function Account({ formData, handleNext, handleForm }) {
	const formik = useFormik({
		initialValues: formData,
		validationSchema: loanDetailsValidationSchema,
		onSubmit: (values, { resetForm }) => {
			console.log("clicked.", values);
			handleNext(values, false);
		},
	});
	const [outlineType, setoutlineType] = useState(false);
	const [outlineLoan, setoutlineLoan] = useState(false);
	const [outlinePay, setoutlinePay] = useState(false);
	return (
		<>
			<div className=" flex flex-col mt-20 md:mt-14 md:px-5 ">
				<form onSubmit={formik.handleSubmit}>
					<div className="md:flex md:gap-3">
						<TextField
							name="loan_name"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0"
							label="Pool Name"
							placeholder="Enter Pool Name"
							value={formik.values.loan_name}
							error={
								formik.touched.loan_name && formik.errors.loan_name
									? formik.errors.loan_name
									: null
							}
						></TextField>
						<TextField
							name="loan_amount"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={
								formik.touched.loan_amount && formik.errors.loan_amount
									? formik.errors.loan_amount
									: null
							}
							className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0"
							label="Loan Amount"
							placeholder="Loan Amount"
							text={process.env.REACT_APP_TOKEN_NAME}
							value={formik.values.loan_amount}
						></TextField>
					</div>
					<div className="md:flex md:gap-3">
						<div className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0">
							<label className="label">
								<span className="text-white">Loan&nbsp;Tenure</span>
							</label>
							<div
								className={`input input-bordered items-center flex justify-between dark:bg-[#24272F] bg-[#E7EAEE] ${
									outlineLoan
										? "outline outline-2 outline-offset-2 dark:outline-[#3A3C43] outline-[#E7EAEE]"
										: ""
								}`}
							>
								<Selection
									onChange={(value) =>
										formik.setFieldValue("loan_tenure", value.value)
									}
									value={formik.values.loan_tenure}
									placeholder="Loan&nbsp;Tenure"
									options={loantenure}
									focus={setoutlineLoan}
								></Selection>

								<div className="text-gray-400">Months</div>
							</div>
							{formik.touched.loan_tenure && formik.errors.loan_tenure ? (
								<p style={{ color: "red" }}>
									<small>{formik.errors.loan_tenure}</small>
								</p>
							) : null}
						</div>

						<div className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0">
							<label className="label">
								<span className="text-white">Repayment&nbsp;Frequency</span>
							</label>
							<div
								className={`input input-bordered items-center flex justify-between dark:bg-[#24272F] bg-[#E7EAEE] ${
									outlinePay
										? "outline outline-2 outline-offset-2 dark:outline-[#3A3C43] outline-[#E7EAEE]"
										: ""
								}`}
							>
								<Selection
									onChange={(value) =>
										formik.setFieldValue("payment_frequency", value.value)
									}
									value={formik.values.payment_frequency}
									placeholder="Enter&nbsp;Repayment"
									options={paymentfrequency}
									focus={setoutlinePay}
								></Selection>

								<div className="text-gray-400">Days</div>
							</div>
							{formik.touched.payment_frequency &&
							formik.errors.payment_frequency ? (
								<p style={{ color: "red" }}>
									<small>{formik.errors.payment_frequency}</small>
								</p>
							) : null}
						</div>
					</div>
					<div className="md:flex md:gap-3">
						<TextField
							name="loan_interest"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={
								formik.touched.loan_interest && formik.errors.loan_interest
									? formik.errors.loan_interest
									: null
							}
							className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0"
							label="Loan Interest"
							placeholder="Enter Loan Interest Percentage"
							value={formik.values.loan_interest}
						></TextField>
						<div className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0">
							<label className="label">
								<span className="text-white mb-1">Loan Type</span>
							</label>
							<div
								className={`input input-bordered items-center flex justify-between dark:bg-[#24272F] bg-[#E7EAEE] ${
									outlineType
										? "outline outline-2 outline-offset-2 dark:outline-[#3A3C43] outline-[#E7EAEE]"
										: ""
								}`}
							>
								<Selection
									onChange={(value) =>
										formik.setFieldValue("loan_type", value.value)
									}
									value={formik.values.loan_type}
									placeholder="Enter&nbsp;Repayment"
									options={loantypes}
									focus={setoutlineType}
								></Selection>
							</div>

							{formik.touched.loan_type && formik.errors.loan_type ? (
								<p style={{ color: "red" }}>
									<small>{formik.errors.loan_type}</small>
								</p>
							) : null}
						</div>
					</div>
					<TextArea
						name="loan_purpose"
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={
							formik.touched.loan_purpose && formik.errors.loan_purpose
								? formik.errors.loan_purpose
								: null
						}
						className="w-full mb-5 md:mb-0"
						label="Loan Purpose"
						placeholder="Short Summary on Purpose of Loans"
						value={formik.values.loan_purpose}
					></TextArea>

					<div className="flex justify-center items-center flex-col-reverse  md:flex-row md:justify-around gap-5  mt-6 -mb-2 overflow-hidden">
						<div className="">
							<label
								className="cursor-pointer md:pl-32 ml-1"
								onClick={handleForm}
							>
								Cancel
							</label>
						</div>
						<div className="md:pr-40 lg:pr-10 xl:pr-0 py-1">
							<GradientButton type="submit">Next</GradientButton>
						</div>
					</div>
				</form>
			</div>
		</>
	);
}
