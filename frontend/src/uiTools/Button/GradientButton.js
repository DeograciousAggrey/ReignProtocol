import React from "react";

const GradientButton = ({
	onClick,
	children,
	className,
	id,
	...otherProps
}) => {
	return (
		<button
			onClick={onClick}
			id={id}
			className={`btn btn-wide py-3 bg-gradient-to-r from-[#4B74FF] to-[#9281FF] hover:from-[#9281FF] hover:to-[#4B74FF] capitalize font-medium border-none text-white rounded-3xl ${className} focus:outline-[#9281FF]`}
			{...otherProps}
		>
			{children}
		</button>
	);
};

export default GradientButton;
