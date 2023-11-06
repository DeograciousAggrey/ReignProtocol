import { Route, Routes, HashRouter, Navigate } from "react-router-dom";
import Token from "./home/Token";

import LandingPage from "./pages/LandingPage/LandingPage";
import BorrowerDashboard from "./pages/Borrower/BorrowerDashboard";
import Overview from "./pages/Borrower/Overview";
import BorrowList from "./pages/Borrower/BorrowList";
import InvestorDashboard from "./pages/Investor/InvestorDashboard";

import InvestorOverview from "./pages/Investor/InvestorOverview";
import Invest from "./pages/Investor/Invest";
import Withdraw from "./pages/Investor/Withdraw";
import ViewPool from "./pages/Investor/ViewPool";
import DiligenceExpert from "./pages/Underwriters/DiligenceExpert";
import BorrowRequest from "./pages/Underwriters/BorrowRequest";
import PoolDetails from "./pages/Underwriters/PoolDetails";
import ApprovalHistory from "./pages/Underwriters/ApprovalHistory";
import Transactions from "./pages/Investor/Transactions";
import ViewSeniorPool from "./pages/Investor/ViewSeniorPool";
import Transaction from "./pages/Borrower/Transaction";
import BorrowerProfile from "./pages/Borrower/BorrowerProfile";
import EditBorrowerProfile from "./pages/Borrower/EditBorrowerProfile";
import UnderwriterQueries from "./pages/Borrower/UnderwriterQueries";
import QueriesPoolDetails from "./pages/Borrower/QueriesPoolDetails";

const Paths = () => {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/token" element={<Token />} />

				{/* // rename */}
				<Route path="/investorDashboard" element={<InvestorDashboard />}>
					<Route index element={<Navigate to="overview" />} />
					<Route path="overview" element={<InvestorOverview />} />
					<Route path="invest" element={<Invest />} />
					<Route path="withdraw" element={<Withdraw />} />
					<Route path="transaction" element={<Transactions />} />
					<Route path="viewPool" element={<ViewPool />} />
					<Route path="viewSeniorPool" element={<ViewSeniorPool />} />
				</Route>

				<Route path="/diligenceExpert" element={<DiligenceExpert />}>
					<Route index element={<Navigate to="borrowRequest" />} />
					<Route path="borrowRequest" element={<BorrowRequest />} />
					<Route path="poolDetail" element={<PoolDetails />} />
					<Route path="approvalHistory" element={<ApprovalHistory />} />
				</Route>

				<Route path="/borrowerDashboard" element={<BorrowerDashboard />}>
					<Route index element={<Navigate to="overview" />} />
					<Route path="overview" element={<Overview />} />

					<Route path="borrowList" element={<BorrowList />} />
					<Route path="transaction" element={<Transaction />} />
					<Route path="borrowerProfile" element={<BorrowerProfile />} />
					<Route path="underwriterQueries" element={<UnderwriterQueries />} />
					<Route path="queriesPoolDetail" element={<QueriesPoolDetails />} />

					<Route path="editProfile" element={<EditBorrowerProfile />} />
				</Route>
			</Routes>
		</HashRouter>
	);
};

export default Paths;
