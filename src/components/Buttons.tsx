"use client";

import clsx from "clsx";
import "@/style/mcbutton.scss";
import "@/style/global.css";

export default function McButton(props: { className?: string, onClick?: () => void, children: React.ReactNode}){
	return (

			<button
				className="btn min-w-5 min-h-5"
				type="button"
				onClick={props.onClick}
			>
				<span className={clsx("font-minecraft flex items-center justify-around flex-1 border-b-3 border-gray-800 shadow-white shadow-inner p-2", props.className)}>
					<div className="m-3">
					{props.children}
					</div>
				</span>
			</button>
	);
};
