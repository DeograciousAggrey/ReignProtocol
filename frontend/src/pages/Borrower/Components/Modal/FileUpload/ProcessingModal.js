import { useState } from "react";
import FileUpload from "./FileUpload";

function ProcessingModal({ setUploading, uploading, fileUploadStatus }) {
	const handleClose = () => {
		setUploading(false);
	};

	return (
		<>
			<input
				type="checkbox"
				className="modal-toggle"
				checked={uploading}
				readOnly
			/>
			<div className="modal backdrop-filter backdrop-brightness-[100%] dark:backdrop-brightness-[40%] backdrop-blur-lg">
				<div className="bg-neutral-50 dark:bg-darkmode-800 w-[100%] sm:w-[85%] md:w-[70%] lg:w-[50%] xl:w-[45%] 2xl:w-[45rem] pb-6 rounded-xl md:pb-8">
					<div className="md:px-8 flex px-4 py-3 text-2xl font-semibold border-b border-neutral-300 dark:border-neutral-500">
						<h3>Edit Borrower Profile</h3>

						<button onClick={handleClose} className="ml-auto cursor-pointer">
							✕
						</button>
					</div>

					<div className="px-4 md:px-8 mt-6">
						<div className=" flex justify-center items-center  gap-4 text-center">
							<p className="text-4xl font-bold">Saving Borrower Profile</p>
							<span className="ml-1 animate-spin border-solid border-[3px] border-t-[#14171F] border-r-[#14171F] border-[#fff] w-[1.5rem] h-[1.5rem] rounded-full p-2"></span>
						</div>

						{fileUploadStatus.length ? (
							<div className="mt-6 border border-neutral-700 dark:border-neutral-500 px-4 py-4 rounded-lg flex flex-col gap-6">
								{fileUploadStatus.map((fileStatus) => {
									return (
										<FileUpload
											key={Math.random() * 100}
											fileName={fileStatus.fileName}
											progress={fileStatus.progress}
											status={fileStatus.status}
										/>
									);
								})}
							</div>
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default ProcessingModal;
