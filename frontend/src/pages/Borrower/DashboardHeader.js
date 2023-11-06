import React from "react";

const DashboardHeader = ({
	setSelected,
	setKycSelected,
	kycStatus,
	profileStatus,
}) => {
	return (
		<div className="flex items-center">
			<h2 className="text-2xl lg:text-[2.1rem] w-[50%] font-rubik">
				Borrower's Dashboard
			</h2>
			<label
				htmlFor={
					!kycStatus || !profileStatus ? "kycAlertModal" : `loanForm-modal`
				}
				onClick={() => {
					if (!kycStatus || !profileStatus) return setKycSelected(true);
					setSelected(true);
				}}
				className="ml-auto px-3 md:px-4 lg:px-6 md:py-3 cursor-pointer py-2 rounded-[1.8em] button-gradient"
			>
				+ Borrow Request
			</label>
		</div>
	);
};

export default DashboardHeader;
