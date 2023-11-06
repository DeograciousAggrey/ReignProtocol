import React from "react";

const TextArea = ({
	label,
	placeholder,
	className,
	name,
	value,
	onChange,
	onBlur,
	error,
	reference,
}) => {
	return (
		<div className={`${className}`}>
			<label className="label">
				<span className="text-black dark:text-white">{label}</span>
			</label>
			<textarea
				onChange={onChange}
				onBlur={onBlur}
				name={name}
				value={value}
				placeholder={placeholder}
				className={`textarea textarea-bordered h-36 dark:bg-darkmode-800 bg-lightmode-200 dark:border-[#343C43] border-[#BBC0CC] ${className}`}
				style={{
					borderWidth: "1px",
					borderRadius: "8px",
				}}
				ref={reference}
			/>
			{error && (
				<p style={{ color: "red", margin: "0px" }}>
					<small>{error}</small>
				</p>
			)}
		</div>
	);
};

export default TextArea;
