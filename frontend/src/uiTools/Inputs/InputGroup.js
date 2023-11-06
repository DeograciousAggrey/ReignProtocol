import React from "react";
import FileUploader from "../../pages/Components/FileUploader";
import TextField from "./TextField";

const InputGroup = ({
	caption,
	name,
	value,
	error,
	onChangeText,
	onChange,
	onBlur,
	fileName,
	reference,
}) => {
	return (
		<div className="bg-lightmode-300 dark:bg-darkmode-800  w-full px-4 pb-4 mb-2 rounded-2xl">
			<h2 className="pt-2 font-bold text-[1.1875rem]">{caption}</h2>

			<div className="flex flex-col gap-2 md:flex-row md:justify-between">
				<TextField
					label="Document Name"
					placeholder="Enter Document Name"
					className="md:w-[48%]"
					name={name}
					value={value}
					error={error}
					onChange={onChangeText}
					onBlur={onBlur}
					reference={reference}
				/>

				<FileUploader
					label="Upload Document"
					className="md:w-[48%]"
					handleFile={onChange}
					fileName={fileName}
				/>
			</div>
		</div>
	);
};

export default InputGroup;
