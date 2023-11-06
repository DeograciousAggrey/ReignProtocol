import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import GradientButton from "../../../../uiTools/Button/GradientButton";
// import FileFields from "../../../../uiTools/Inputs/FileFields";
// import InputGroup from "../../../../uiTools/Inputs/InputGroup";
import TextArea from "../../../../uiTools/Inputs/TextArea";
import TextField from "../../../../uiTools/Inputs/TextField";
import FileUploader from "../../../Components/FileUploader";
import { CollateralDetailsValidationSchema } from "../validations/validation";
import ArrowLeft from "../../Components/SVG/ArrowLeft";

export default function Details({ handleNext, handlePrev, formData }) {
	const formik = useFormik({
		initialValues: {
			collateral_document_name: `${
				formData.collateral_document_name
					? formData.collateral_document_name
					: ""
			}`,
			collateral_document: `${
				formData.collateral_document ? formData.collateral_document : ""
			}`,
			collateral_document_description: `${
				formData.collateral_document_description
					? formData.collateral_document_description
					: ""
			}`,
			capital_loss: `${formData.capital_loss ? formData.capital_loss : ""}`,
		},
		validationSchema: CollateralDetailsValidationSchema,
		onSubmit: (values) => {
			if (
				formData.collateral_document &&
				!formik.values.collateral_document[0].name
			) {
				formik.values.collateral_document = formData.collateral_document;
			}
			console.log("clicked..", values);
			handleNext(values, true);
		},
	});

	const inputRef = useRef();

	useEffect(() => {
		inputRef.current.focus();
	}, []);

	// console.log(formik.values.collateral_document[0].name);

	return (
		<div className="dark:bg-darkmode-800  bg-white w-full mb-8 rounded-2xl mt-20 md:mt-10 px-5">
			<form onSubmit={formik.handleSubmit}>
				<div className="justify-between md:flex md:gap-3">
					<TextField
						name="collateral_document_name"
						value={formik.values.collateral_document_name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						reference={inputRef}
						error={
							formik.touched.collateral_document_name &&
							formik.errors.collateral_document_name
								? formik.errors.collateral_document_name
								: null
						}
						label="Collateral Document&nbsp;Name"
						placeholder="Enter Collateral Document Name"
						className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0"
					></TextField>
					<FileUploader
						name="collateral_document"
						handleFile={(file) => {
							formik.setFieldValue("collateral_document", file);
						}}
						onBlur={formik.handleBlur}
						error={
							formik.touched.collateral_document &&
							formik.errors.collateral_document
								? formik.errors.collateral_document
								: null
						}
						label="Upload Collateral Document"
						className="w-full md:w-1/2 md:mr-2 mb-5 md:mb-0"
						fileName={
							formData.collateral_document
								? formData.collateral_document[0].name
								: ""
						}
					/>
				</div>
				<TextArea
					name="collateral_document_description"
					value={formik.values.collateral_document_description}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					error={
						formik.touched.collateral_document_description &&
						formik.errors.collateral_document_description
							? formik.errors.collateral_document_description
							: null
					}
					className="w-full"
					label="Document Description"
					placeholder="Collateral Document Description"
				></TextArea>
				<TextField
					name="capital_loss"
					value={formik.values.capital_loss}
					onChange={formik.handleChange}
					onBlur={formik.handleBlur}
					error={
						formik.touched.capital_loss && formik.errors.capital_loss
							? formik.errors.capital_loss
							: null
					}
					label="First Loss Capital"
					placeholder="Enter First Loss Capital Percentage (if any)"
					className="w-full"
				/>

				<div className=" flex flex-col-reverse gap-5 py-5 md:my-0 md:-mb-14 pt-10 justify-center items-center md:flex-row md:justify-around pb-10">
					<div className="">
						<label
							onClick={() => {
								if (
									formData.collateral_document &&
									!formik.values.collateral_document[0].name
								) {
									formik.values.collateral_document =
										formData.collateral_document;
								}
								handlePrev(formik.values, false);
							}}
							className="text-gray-500 md:pl-28 flex-row cursor-pointerm ml-1 flex"
						>
							<ArrowLeft color="#64748B" />
							Back
						</label>
					</div>
					<div className="md:pr-24 lg:pr-10 xl:pr-0">
						<GradientButton type="submit">Next</GradientButton>
					</div>
				</div>
			</form>
		</div>
	);
}
