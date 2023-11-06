import React, { useEffect, useState } from "react";
import { createOpportunity } from "../../../../services/BackendConnectors/opportunityConnectors";
import Stepper from "../../LoanForm/Stepper";
import Account from "../../LoanForm/Steps/Account";
import Details from "../../LoanForm/Steps/Details";
import Final from "../../LoanForm/Steps/Final";
import { getBorrowerJson } from "../../../../services/BackendConnectors/userConnectors/borrowerConnectors";
import {
	storeFiles,
	makeFileObjects,
} from "../../../../services/Helpers/web3storageIPFS";

import { captureException } from "@sentry/react";

const LoanFormModal = ({
	setSelected,
	handleForm,
	setBorrowReqProcess,
	setProcessModal,
	setUpdateRepayment,
	setFileUpload,
	setErrormsg,
}) => {
	const [formData, setFormData] = useState({
		loan_name: "",
		loan_type: "1",
		loan_amount: "",
		loan_purpose: "",
		loan_tenure: "",
		loan_interest: "",
		payment_frequency: "",
	});
	const [currentStep, setCurrentStep] = useState(1);
	const [brJson, setBrJson] = useState();
	const [checkBox, setCheckBox] = useState(false);

	useEffect(() => {
		getBorrowerJson()
			.then((dataReader) => {
				if (dataReader) {
					dataReader.onloadend = function () {
						let data = JSON.parse(dataReader.result);
						setBrJson(data);
					};
				}
			})
			.catch((e) => captureException(e));
	}, []);

	const steps = ["Add Loan Details", "Add Collateral", "Submit for Review"];

	const displayStep = (step) => {
		switch (step) {
			case 1:
				return (
					<Account
						handleNext={handleNext}
						formData={formData}
						handleForm={handleForm}
					/>
				);
			case 2:
				return (
					<Details
						handleNext={handleNext}
						handlePrev={handlePrev}
						formData={formData}
					/>
				);
			case 3:
				return (
					<Final
						handlePrev={handlePrev}
						finalSubmit={finalSubmit}
						formData={formData}
						setCheckBox={setCheckBox}
						checkBox={checkBox}
					/>
				);
			default:
		}
	};
	async function onFileUpload(selectedFile, loan_info) {
		try {
			let collateralHash = await storeFiles(selectedFile);
			let loanInfoFile = makeFileObjects(loan_info, `${collateralHash}.json`);
			let loanInfoHash = await storeFiles(loanInfoFile);
			return [collateralHash, loanInfoHash];
		} catch (error) {
			console.log(error);
		}
	}

	const finalSubmit = async (data) => {
		setProcessModal(true);
		setSelected(false);
		setBorrowReqProcess(true);
		let {
			loan_name,
			loan_type,
			loan_amount,
			loan_purpose,
			loan_tenure,
			loan_interest,
			capital_loss,
			payment_frequency,
			...rest
		} = data;
		loan_tenure = loan_tenure * 30;
		const collateral_document = rest.collateral_document;

		setFileUpload({
			fileName: collateral_document[0].name,
			progress: "0",
			status: "Pending",
		});

		console.log(rest);
		let loanDetails = {
			loan_type,
			loan_amount,
			loan_tenure,
			loan_interest,
			payment_frequency,
			capital_loss: capital_loss ? capital_loss : "0",
		};

		const loan_info = {
			loan_name,
			loan_purpose,
		};
		loan_info.collateral_document_name = rest.collateral_document_name;
		loan_info.collateral_document_description =
			rest.collateral_document_description;
		loan_info.collateral_filename = collateral_document[0].name;
		loan_info.companyDetails = brJson;

		const [collateralHash, loanInfoHash] = await onFileUpload(
			collateral_document,
			loan_info
		);
		loanDetails = { ...loanDetails, collateralHash, loanInfoHash, loan_name };

		// sending data in backend to create opportunity with hash code

		const res = await createOpportunity(loanDetails);
		if (res.success) {
			console.log(res.success);
			setBorrowReqProcess(false);
		} else {
			console.log(res.msg);
			setProcessModal(false);
			setErrormsg({ status: !res.success, msg: res.msg });
		}
		setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
		setUpdateRepayment(Math.random());
	};

	const handleNext = (newData, value) => {
		if (value === true) {
			let temp = { ...formData, ...newData };
			setFormData(temp);
		} else {
			setFormData((prev) => ({ ...prev, ...newData }));
		}
		setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
	};

	const handlePrev = (newData, value) => {
		if (value === true) {
			let temp = { ...formData, ...newData };
			setFormData(temp);
		} else {
			setFormData((prev) => ({ ...prev, ...newData }));
		}
		setCurrentStep((prevCurrentStep) => prevCurrentStep - 1);
		displayStep(currentStep);
	};

	return (
		<div>
			<input type="checkbox" id="loanForm-modal" className="modal-toggle" />
			<div
				// class="modal block backdrop-blur-xl backdrop-opacity-100 md:flex"
				// style={{ backdropFilter: "brightness(40%) blur(8px)" }}
				className="modal block backdrop-filter backdrop-brightness-[100%] backdrop-opacity-100 dark:backdrop-brightness-[40%] backdrop-blur-xl md:flex"
			>
				<div className="w-screen h-full modal-box max-w-full max-h-full rounded-none md:h-auto md:w-1/2 md:max-w-4xl bg-white dark:bg-[#14171F]   md:rounded-[16px]">
					<div className="py-5 md:-mt-2 mb-5 md:py-0 flex justify-between items-center text-center md:border-b-2 md:border-b-[#292C33] -mx-5">
						<h3 className="font-medium text-lg  md:border-b-[#292C33] ml-5 md:pb-3">
							Create Borrow Request
						</h3>
						<label
							htmlFor="loanForm-modal"
							className="btn btn-ghost font-bold w-14 md:pb-3"
							onClick={() => handleForm()}
						>
							<svg
								width="19"
								height="19"
								viewBox="0 0 19 19"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									className="dark:fill-white fill-black"
									d="M18.4596 3.44507C18.8501 3.05454 18.8501 2.42138 18.4596 2.03085L17.1358 0.707107C16.7453 0.316583 16.1121 0.316583 15.7216 0.707107L9.58333 6.84538L3.44507 0.707107C3.05454 0.316583 2.42138 0.316583 2.03085 0.707107L0.707107 2.03085C0.316583 2.42138 0.316582 3.05454 0.707107 3.44507L6.84538 9.58333L0.707107 15.7216C0.316583 16.1121 0.316583 16.7453 0.707107 17.1358L2.03085 18.4596C2.42138 18.8501 3.05454 18.8501 3.44507 18.4596L9.58333 12.3213L15.7216 18.4596C16.1121 18.8501 16.7453 18.8501 17.1358 18.4596L18.4596 17.1358C18.8501 16.7453 18.8501 16.1121 18.4596 15.7216L12.3213 9.58333L18.4596 3.44507Z"
									fill="white"
								/>
							</svg>
						</label>
					</div>

					<div className="md:-mx-5 -mx-2 pb-2 md:mt-4">
						<Stepper steps={steps} currentStep={currentStep} />
						<div>{displayStep(currentStep)}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoanFormModal;
