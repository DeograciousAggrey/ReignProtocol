import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import OverviewIcon from "../../pages/SVGIcons/OverviewIcon";
import InvestIcon from "../../pages/SVGIcons/InvestIcon";
import TransactionIcon from "../../pages/SVGIcons/TransactionIcon";
import WithdrawIcon from "../../pages/SVGIcons/WithdrawIcon";

import Header from "../Layout/Header";

const InvestorDashboardNew = () => {
	const [linkStatus, setLinkStatus] = useState(false);
	const [darkMode, setDarkMode] = useState(true);

	const handleChange = (e) => {
		setLinkStatus(e.target.checked);
	};

	return (
		<div className={`${darkMode ? "dark" : ""}`}>
			<div className="bg-neutral-50 dark:bg-darkmode-900 text-neutral-700 dark:text-white">
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
						className={`py-4 drawer-content  ${
							linkStatus ? "blur-sm lg:blur-none" : ""
						}`}
					>
						<div className="px-4 sm:px-6 md:px-8 lg:px-4 xl:px-8">
							<Outlet></Outlet>
						</div>
					</div>

					<div className="drawer-side border-r border-neutral-300 dark:border-darkmode-800">
						<label
							htmlFor="dashboard-sidebar"
							className="drawer-overlay"
						></label>
						<ul className="h-full py-4  overflow-y-auto w-60  text-[#64748B] bg-neutral-50 dark:bg-darkmode-900 flex flex-col gap-2 lg:bg-transparent lg:dark:bg-transparent">
							<li className="font-medium text-center">
								<NavLink
									className="flex pl-10 py-4 gap-2"
									to="/investorDashboard/overview"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<OverviewIcon />
									</span>
									Overview
								</NavLink>
							</li>
							<li className="font-medium text-center ">
								<NavLink
									className="flex pl-10 py-4 gap-2"
									to="/investorDashboard/invest"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span className="pl-1">
										<InvestIcon />
									</span>
									Invest
								</NavLink>
							</li>
							<li className="font-medium text-center ">
								<NavLink
									className="flex pl-10 py-4 gap-2"
									to="/investorDashboard/withdraw"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<WithdrawIcon />
									</span>
									Withdraw
								</NavLink>
							</li>
							<li className="font-medium text-center ">
								<NavLink
									className="flex pl-10 py-4 gap-2"
									to="/investorDashboard/transaction"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<TransactionIcon />
									</span>
									Transaction
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvestorDashboardNew;
