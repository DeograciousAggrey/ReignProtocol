import React from "react";

const arrow = (
	<svg
		width="11"
		height="17"
		viewBox="0 0 11 17"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M0.5 14.3824L6.75 8.50006L0.5 2.6177L1.75 0.264763L10.5 8.50006L1.75 16.7354L0.5 14.3824Z"
			fill="white"
		/>
	</svg>
);

const PrimaryButton = ({
	children,
	htmlFor,
	width,
	onClick,
	disable,
	data,
	className,
}) => {
	return (
		<button
			onClick={disable ? null : onClick}
			htmlFor={htmlFor}
			className={`bg-gradient-to-r bg-[#5375FE] rounded-full py-[0.5rem] w-[100%] font-semibold flex text-white gap-2 items-center justify-center ${className}`}
		>
			{children}
			{arrow}
		</button>
	);
};

export default PrimaryButton;
