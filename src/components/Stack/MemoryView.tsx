import React from "react";
import styles from "./MemoryView.module.scss";

import StackData, { viewBytes } from "./Context";

function StackCell(props: {value: number, highlighted: boolean}) {
	return (
		<div className={styles.stackCell + (props.highlighted ? " " + styles.highlighted : "")}>
			{props.value}
		</div>
	);
}

const bytesPerRow = 4 * 4;

interface StackViewProps {
	highlightRange?: [number, number];
}

export default
class StackView extends React.Component<StackViewProps, any>
{
	static contextType = StackData;

	render() {
		const isHighlighted = (idx: number) => {
			if (!this.props.highlightRange)
				return false;

			const [start, count] = this.props.highlightRange;
			return idx >= start && idx < start + count;
		};

		const stackContent = this.context.memory;

		const rows : React.ReactNode[] = [];
		for (let idx = 0; idx < stackContent.length / bytesPerRow; ++idx)
		{
			const row = stackContent.slice(idx * bytesPerRow, (idx + 1) * bytesPerRow);
			rows.push(
				<div className={styles.stackRow} key={idx}>
					{[...row].map((value: number, index: number) => {
						const actualIdx = idx * bytesPerRow + index;
						const highlighted = isHighlighted(actualIdx);
						return <StackCell key={actualIdx} value={value} highlighted={highlighted}/>;
					})}
				</div>
			);
		}
		let highlightedElem: any;
		
		for (const row of rows)
		{
			highlightedElem = (row as any).props.children.find((c: any) => c.props.highlighted);
			if (highlightedElem)
				break;
		}

		if (highlightedElem) {
			console.log("Highlighted elem key: ", highlightedElem.key, typeof +highlightedElem.key);
			const len = this.props.highlightRange ? this.props.highlightRange[1] : 0;

			if (len > 0) {
				const view = viewBytes(stackContent, +highlightedElem.key, len);
				if (len === 1) {
					console.log("Reading bytes: ", view.getInt8(0));
				}
				else if (len === 2) {
					console.log("Reading bytes: ", view.getInt16(0));
				}
				else if (len === 4) {
					console.log("Reading bytes: ", view.getInt32(0));
				}
			}
		}

		return (
			<>
				Stack View
				{rows}
			</>
		);
	}
}