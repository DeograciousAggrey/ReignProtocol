import React, { useState } from "react";

const FileUploader = ({
	name,
	label,
	className,
	onBlur,
	error,
	handleFile,
	fileName,
	filetype,
}) => {
	const hiddenFileInput = React.useRef(null);

	const [fileUploadedName, setFileUploadedName] = useState();

	const handleClick = (event) => {
		hiddenFileInput.current.click();
	};
	const handleChange = (event) => {
		const fileUploaded = event.target.files[0];
		setFileUploadedName(fileUploaded.name);

		handleFile(event.target.files);
	};
	return (
		<>
			<div className={`${className}`}>
				<label className="label text-lg" style={{ marginBottom: 1 }}>
					<span className="text-black dark:text-white text-lg">{label}</span>
				</label>
				<div className="flex border-dashed border-[1px] pl-1 dark:border-[#3A3C43] border-[#A0ABBB]  py-2 rounded-lg flex-row bg-lightmode-200 dark:bg-[#24272F] items-center overflow-hidden">
					<input
						type="button"
						className="bg-gray-400 dark:bg-[#30333A]  rounded-full text-white px-2 text-sm py-1"
						onClick={handleClick}
						value="Choose file"
					/>

					<div className="dark:text-[#c7cad1] pl-1 text-gray-700 overflow-hidden h-5 italic text-sm">
						{fileUploadedName ? fileUploadedName : fileName}
					</div>
				</div>
				<input
					type="file"
					name={name}
					onBlur={onBlur}
					accept={
						filetype ? filetype : ".xlsx,.xls,.doc, .docx,.ppt, .pptx,.pdf"
					}
					ref={hiddenFileInput}
					onChange={handleChange}
					style={{ display: "none" }}
				/>
				{error && (
					<p style={{ color: "red", margin: "0px" }}>
						<small>{error}</small>
					</p>
				)}
			</div>
		</>
	);
};
export default FileUploader;
