import React from "react";
import { useNavigate } from "react-router-dom";

const KycCheckModal = ({ kycStatus, profileStatus }) => {
	const navigate = useNavigate();
	return (
		<>
			<input type="checkbox" id="kycAlertModal" className="modal-toggle" />
			<div
				style={{ backdropFilter: "brightness(40%) blur(8px)" }}
				className="modal"
			>
				<div
					style={{ borderRadius: "16px" }}
					className="bg-white dark:bg-darkmode-800   modal-box w-1/3 max-w-5xl p-0"
				>
					<label
						for="kycAlertModal"
						className="btn btn-ghost absolute right-2 top-2 pb-2"
						// onClick={() => handleForm()}
					>
						✕
					</label>
					<h3
						style={{ borderBottom: "2px solid #292C33" }}
						className="font-bold text-lg py-3 px-4"
					>
						Complete your Profile
					</h3>
					<p
						style={{ display: "flex", fontSize: 40, fontWeight: 600 }}
						className="justify-center"
					>
						{!kycStatus && profileStatus
							? `Incomplete KYC!`
							: "Incomplete Profile!"}
					</p>
					<p
						style={{ display: "flex", fontSize: 23, fontWeight: 600 }}
						className="justify-center mb-2"
					>
						{!kycStatus && profileStatus
							? "Please complete your KYC."
							: "Please complete your profile."}
					</p>

					<div
						className="modal-action mx-4 mt-2 mb-4 text-sm py-3 px-4 items-center justify-center"
						style={{
							width: 400,
							height: 45,
							marginLeft: 24,
							borderRadius: 100,
							borderWidth: 1,
							borderColor: "#64748B",
							alignSelf: "center",
							marginTop: 60,
							marginInline: "auto",
						}}
						onClick={() =>
							navigate(
								!kycStatus && profileStatus
									? `/borrowerDashboard/borrowerProfile`
									: `/borrowerDashboard/editProfile`
							)
						}
					>
						<p
							className="justify-center"
							style={{ display: "flex", cursor: "pointer" }}
						>
							{!kycStatus && profileStatus ? "Go to Profile" : "Create Profile"}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default KycCheckModal;
