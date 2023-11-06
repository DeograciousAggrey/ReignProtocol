import React from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload/FileUpload";

const ProcessingRequestModal = ({
	borrowReqProcess,
	setProcessModal,
	setSelected,
	handleDrawdown,
	processModal,
	fileUpload,
}) => {
	console.log(borrowReqProcess, "inrequest modal");
	const navigate = useNavigate();
	return (
		<>
			<input
				type="checkbox"
				id="ProcessModal"
				className="modal-toggle"
				checked={processModal}
				readOnly
			/>
			<div className="modal backdrop-filter backdrop-brightness-[100%] backdrop-blur-lg px-4">
				<div className="bg-white rounded-2xl dark:bg-darkmode-800 modal-box w-[100%] sm:w-[75%] md:w-[55%] lg:w-[45%]  xl:w-[35%] 2xl:w-[25%]  p-5">
					<div className="flex justify-between items-center pb-2  border-b border-neutral-300 dark:border-neutral-500">
						<h3>Create borrow request</h3>
						<button
							htmlFor="ProcessModal"
							className="btn btn-ghost absolute right-1"
							onClick={() => handleDrawdown()}
						>
							<svg
								width="16"
								height="17"
								viewBox="0 0 16 17"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g clipPath="url(#clip0_564_115493)">
									<path
										className="dark:fill-white fill-black"
										d="M14.6262 3.39747C15.0168 3.00695 15.0168 2.37378 14.6262 1.98326L13.8501 1.20711C13.4595 0.816582 12.8264 0.816583 12.4359 1.20711L7.66667 5.9763L2.89747 1.20711C2.50695 0.816582 1.87378 0.816582 1.48326 1.20711L0.707106 1.98326C0.316582 2.37378 0.316582 3.00695 0.707107 3.39747L5.4763 8.16667L0.707107 12.9359C0.316582 13.3264 0.316583 13.9595 0.707107 14.3501L1.48326 15.1262C1.87378 15.5168 2.50695 15.5168 2.89747 15.1262L7.66667 10.357L12.4359 15.1262C12.8264 15.5168 13.4595 15.5168 13.8501 15.1262L14.6262 14.3501C15.0168 13.9595 15.0168 13.3264 14.6262 12.9359L9.85703 8.16667L14.6262 3.39747Z"
										fill="white"
									/>
								</g>
								<defs>
									<clipPath id="clip0_564_115493">
										<rect
											width="16"
											height="16"
											fill="white"
											transform="translate(0 0.5)"
										/>
									</clipPath>
								</defs>
							</svg>
						</button>
					</div>
					<div className="pt-10 ">
						<p className="justify-center flex text-4xl w-full font-semibold md:py-5">
							{borrowReqProcess ? "In Progress⏱" : `Yay!🎉`}
						</p>
						<div className="justify-center flex text-lg sm:text-lg pt-5 md:pt-0">
							{borrowReqProcess
								? "Request is in process"
								: "Borrow request created successfully."}
							<div className="pl-1 hidden sm:block">
								{borrowReqProcess ? (
									<div className="flex gap-1 items-center">
										<p className="text-warning-400 font-semibold justify-center flex">
											Processing
										</p>
										<span className="animate-spin border-solid border-[3px] border-t-[#14171F] border-r-[#14171F] border-[#fff] w-[1.5rem] h-[1.5rem] rounded-full"></span>
									</div>
								) : (
									<p className="text-success-500 font-semibold justify-center flex">
										Completed
									</p>
								)}
							</div>
						</div>
						<p className="sm:hidden text-lg">
							{borrowReqProcess ? (
								<div className="flex gap-1 items-center justify-center pt-2">
									<p className="text-warning-400 font-semibold justify-center flex">
										Processing
									</p>
									<span className="animate-spin border-solid border-[3px] border-t-[#14171F] border-r-[#14171F] border-[#fff] w-[1.5rem] h-[1.5rem] rounded-full"></span>
								</div>
							) : (
								<p className="text-success-500 font-semibold justify-center flex">
									Completed
								</p>
							)}
						</p>
					</div>

					<div className="my-4">
						<FileUpload
							fileName={fileUpload.fileName}
							progress={fileUpload.progress}
							status={fileUpload.status}
						/>
					</div>

					<div className="border-2 border-neutral-300 dark:border-neutral-500 rounded-[1.8em] mt-8 md:mb-3">
						<p
							className="text-black dark:text-white cursor-pointer font-semibold py-2 sm:py-3 text-center"
							onClick={() => {
								navigate("/borrowerDashboard/borrowList");
								setSelected(false);
								setProcessModal(false);
							}}
						>
							Go to borrowing
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProcessingRequestModal;
