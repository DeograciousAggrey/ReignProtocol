import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../Layout/Header";
import BorrowIcon from "../../pages/SVGIcons/BorrowIcon";
import ApprovalIcon from "../../pages/SVGIcons/ApprovalIcon";

const DiligenceExpert = () => {
	const [linkStatus, setLinkStatus] = useState(false);
	const [darkMode, setDarkMode] = useState(true);

	const handleChange = (e) => {
		setLinkStatus(e.target.checked);
	};

	return (
		<div className={`${darkMode ? "dark" : ""} `}>
			<div className="dark:bg-[#14171F] bg-[#F7F8F9] dark:text-[#FFFFFF] text-[#323A46]">
				<Header
					linkStatus={linkStatus}
					darkMode={darkMode}
					setDarkMode={setDarkMode}
				/>
				<div className="drawer drawer-mobile border-t-[1px] border-t-[#B8C0CC] dark:border-t-[#20232A]">
					<input
						id="dashboard-sidebar"
						type="checkbox"
						className="drawer-toggle"
						checked={linkStatus}
						onChange={handleChange}
					/>
					<div
						className={`mt-6 drawer-content ${
							linkStatus ? "blur-sm lg:blur-none" : ""
						}`}
					>
						<div className="px-5">
							<Outlet></Outlet>
						</div>
					</div>

					<div className="drawer-side pt-3 border-r-[#B8C0CC] dark:border-r-[#20232A] border-r-[1px]">
						<label
							htmlFor="dashboard-sidebar"
							className="drawer-overlay"
						></label>
						<ul className="h-full  overflow-y-auto w-60 text-[#64748B] dark:bg-darkmode-900 bg-[#F7F8F9]  flex flex-col gap-2 lg:dark:bg-transparent lg:bg-transparent">
							<li className="font-medium text-center">
								<NavLink
									className="flex pl-4 py-4 gap-2"
									to="/diligenceExpert/borrowRequest"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span className="ml-7">
										<BorrowIcon />
									</span>
									Borrow request
								</NavLink>
							</li>
							<li className="font-medium text-center">
								<NavLink
									className="flex pl-4 py-4 gap-2"
									to="/diligenceExpert/approvalHistory"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span className="ml-7">
										<ApprovalIcon />
									</span>
									Approval history
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DiligenceExpert;
