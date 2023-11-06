import React from "react";

const GradientBtnForModal = ({
	onClick,
	children,
	className,
	htmlFor,
	id,
	...otherProps
}) => {
	return (
		<label
			onClick={onClick}
			htmlFor={htmlFor}
			id={id}
			style={{ borderRadius: "100px", padding: "12px 24px", color: "white" }}
			className={`btn btn-wide bg-gradient-to-r from-[#4B74FF] to-[#9281FF] hover:from-[#9281FF] hover:to-[#4B74FF] capitalize font-medium border-none ${className}`}
			{...otherProps}
		>
			{children}
		</label>
	);
};

export default GradientBtnForModal;
