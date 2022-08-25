import React from "react";

export interface IStackDataContext {
	memory: Int8Array;
}

const StackData = React.createContext<IStackDataContext>(
	{
		memory: new Int8Array([
			53, 0, 0, 0,
			12, 237, 0, 255,
			0, 11, 40, 0,
			19, 0, 8, 0, 
		
			104, 11, 10, 23,
			3, 34, 0, 235,
			0, 18, 90, 0,
			19, 0, 112, 0, 
		
			104, 11, 10, 23,
			3, 34, 0, 235,
			0, 18, 90, 0,
			19, 0, 112, 0, 
		])
	}
);



export function viewBytes(arr: Int8Array, offset?: number, len: number = 4) {
	return new DataView(arr.buffer, offset, len);
}

export default StackData;
