import React, { useState } from "react";
const TextField = ({
	label,
	placeholder,
	className,
	name,
	value,
	onChange,
	onBlur,
	error,
	reference,
	text,
}) => {
	const [loanAmOutline, setLoanAmOutline] = useState(false);

	return text ? (
		<div className={`${className}`}>
			<label className="label text-lg">
				<span className="text-black dark:text-white text-lg">{label}</span>
			</label>
			<div
				className={`input input-bordered items-center flex justify-between bg-lightmode-200 dark:bg-[#24272F] 
			
			${
				loanAmOutline
					? "outline outline-2 outline-offset-2 dark:outline-[#3A3C43] outline-[#E7EAEE] "
					: ""
			}`}
			>
				<input
					onChange={onChange}
					onFocus={() => {
						setLoanAmOutline(loanAmOutline ? false : true);
					}}
					onBlur={(e) => {
						setLoanAmOutline(loanAmOutline ? false : true);
						onBlur(e);
					}}
					name={name}
					value={value}
					ref={reference}
					type="text"
					placeholder={placeholder}
					className="outline-none w-[80%] appearance-none rounded-lg bg-lightmode-200 dark:bg-[#24272F]"
				/>
				<div className="text-gray-400 font-normal">{text}</div>
			</div>
			{error && (
				<p style={{ color: "red", margin: "0px" }}>
					<small>{error}</small>
				</p>
			)}
		</div>
	) : (
		<div className={`${className}`}>
			<label className="label text-lg">
				<span className="text-black dark:text-white">{label}</span>
			</label>
			<input
				onChange={onChange}
				onBlur={onBlur}
				name={name}
				value={value}
				ref={reference}
				type="text"
				placeholder={placeholder}
				className="input input-bordered w-full bg-lightmode-200 dark:bg-darkmode-800 dark:border-[#3A3C43] border-[#BBC0CC]"
				style={{
					borderWidth: "1px",
					borderRadius: "8px",
				}}
			/>
			{error && (
				<p style={{ color: "red", margin: "0px" }}>
					<small>{error}</small>
				</p>
			)}
		</div>
	);
};

export default TextField;
