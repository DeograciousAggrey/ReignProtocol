import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../Layout/Header";
import OverviewIcon from "../../pages/SVGIcons/OverviewIcon";
import BorIcon from "../../pages/SVGIcons/BorIcon";
// import TransactionIcon from "../../pages/SVGIcons/TransactionIcon";
import UnderIcon from "../../pages/SVGIcons/UnderIcon";
import ProfileIcon from "../../pages/SVGIcons/ProfileIcon";

const BorrowerDashboard = () => {
	const [linkStatus, setLinkStatus] = useState(false);

	const [darkMode, setDarkMode] = useState(true);

	const handleChange = (e) => {
		setLinkStatus(e.target.checked);
	};

	return (
		<div className={`${darkMode ? "dark" : ""} `}>
			<div className="bg-white dark:bg-darkmode-900 ">
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
						className={`py-4 drawer-content text-black dark:text-white ${
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
						<ul className="h-full  overflow-y-auto w-60 pt-3 text-[#64748B] lg:dark:bg-transparent dark:bg-darkmode-900 bg-[#F7F8F9]  flex flex-col gap-2 lg:bg-transparent">
							<li className="font-medium text-center">
								<NavLink
									to="/borrowerDashboard/overview"
									className="flex pl-11 py-4 gap-2"
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
							<li className="font-medium text-center">
								<NavLink
									to="/borrowerDashboard/borrowList"
									className="flex pl-11 py-4 gap-2"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<BorIcon />
									</span>
									Borrow
								</NavLink>
							</li>
							<li className="font-medium text-center">
								<NavLink
									to="/borrowerDashboard/transaction"
									className="flex pl-11 py-4 gap-2"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<UnderIcon />
									</span>
									Transactions
								</NavLink>
							</li>

							<li className="font-medium text-center">
								<NavLink
									to="/borrowerDashboard/borrowerProfile"
									className="flex pl-11 py-4 gap-2"
									onClick={() => {
										setLinkStatus(false);
									}}
								>
									<span>
										<ProfileIcon />
									</span>
									Profile
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BorrowerDashboard;
