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
			className={`bg-gradient-to-r from-[#4B74FF] to-[#9281FF] hover:from-[#9281FF] hover:to-[#4B74FF] capitalize font-semibold border-none ${className} focus:outline-[#9281FF] rounded-full  text-base  px-4 sm:px-6 md:px-8 flex items-center gap-2 py-2 sm:py-3`}
			{...otherProps}
		>
			{children}
		</button>
	);
};

export default GradientButton;
