import React from "react";
import { getIPFSFileURL } from "../../services/Helpers/web3storageIPFS";

var signatures = {
	JVBERi0: "application/pdf",
	R0lGODdh: "image/gif",
	R0lGODlh: "image/gif",
	iVBORw0KGgo: "image/png",
	"/9j/": "image/jpg",
};

function detectMimeType(b64) {
	for (var s in signatures) {
		if (b64.indexOf(s) === 0) {
			return signatures[s];
		}
	}
}

const DocumentCard = ({ docName, docCid, fileName, disable }) => {
	const viewDoc = () => {
		if (fileName === "base64") {
			if (!docCid) return null;
			const filetype = detectMimeType(docCid);
			let url = `data:${filetype};base64,${docCid}`;
			var win = window.open();
			win.document.write(
				'<iframe src="' +
					url +
					'" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
			);
		} else {
			if (!docCid) return null;
			let url = getIPFSFileURL(docCid);
			if (fileName) url += `/${fileName}`;
			window.open(url, "_blank");
		}
	};

	return (
		<div className="justify-between mb-2 bg-lightmode-300 dark:bg-[#20232A] rounded-lg flex px-4 py-3">
			<div>
				<p className="font-semibold text-[1.1875rem]">
					{docName ? null : "view document"}
				</p>
				{docName ? <p className="italic"> {docName}</p> : null}
			</div>
			<span
				className="text-[#5375FE] cursor-pointer text-[1.1875rem]"
				onClick={viewDoc}
			>
				{disable ? null : "view document"}
			</span>
		</div>
	);
};

export default DocumentCard;
