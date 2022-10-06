
import React from 'react';
import Splitter, { SplitDirection } from '@devbookhq/splitter';

// import cookies
import {
	setCookie,
	getCookie,
} from "../../helper/Cookies";


export interface SizedSplitPaneProps {
	children: React.ReactNode;
	initialSize: [number, number];
	minimalSize: [number, number];
	direction: "x" | "y";
	cookieName?: string;
}


function translateDirection(direction: "x" | "y"): SplitDirection {
	if (direction === "x") {
		return SplitDirection.Horizontal;
	}
	return SplitDirection.Vertical;
}

export default function SplitPane({
		children,
		initialSize,
		minimalSize,
		direction,
		cookieName
	}: SizedSplitPaneProps)
{
	const [sizes, setSizes] = React.useState<[number, number]>(initialSize);

	React.useEffect(() => {
		if (cookieName) {
			const cookie = getCookie(cookieName);
			if (cookie) {
				setSizes(JSON.parse(cookie));
			}
		}
	}, [cookieName]);

	const handleResize = (sizes: [number, number]) => {
		setSizes(sizes);
		if (cookieName) {
			setCookie(cookieName, JSON.stringify(sizes), 365);
		}
	};

	return (
		<Splitter direction={translateDirection(direction)}
				initialSizes={sizes}
				onResizeFinished={(_, s) => handleResize(s as [number, number])}
				{...(direction === "x"
					?
					{ minWidths: minimalSize }
					:
					{ minHeights: minimalSize }
				)}
			>
			{children}
		</Splitter>
	);
}