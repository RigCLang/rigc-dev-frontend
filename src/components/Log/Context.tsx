import React from "react";
import { ILogEntry } from "./Window";

export interface ILogDataContext {
	entries: ILogEntry[];
}

const generateMockupLog = (count: number) => {
	const log: ILogEntry[] = [];
	for (let i = 0; i < count; i++) {
		log.push({
			message: `Message ${i}`,
			kind: (i % 3 === 0 || i % 7 === 0) ? 'info' : 'error',
		});
	}
	return log;
};

export const logMockupData = generateMockupLog(5);

const LogData = React.createContext<ILogDataContext>(
	{
		entries: logMockupData
	}
);

export default LogData;
