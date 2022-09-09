import React from "react";
import styles from "./MemoryView.module.scss";

import StackData, { viewBytes } from "./Context";

type MouseHoverCallback = (index: number, value: any) => void;

interface StackValuesViewProps {
	values: any[];
	onValueHovered?: MouseHoverCallback;
	onValueUnhovered?: MouseHoverCallback;
}

export type Stack = any[];
export type StackFrame = {
  initialSize: number;
}

export type StackAllocation  = {
  name: string;
  type: string;
  size: number;
  address: number;
}

export default
class WatchWindow extends React.Component<StackValuesViewProps, any>
{
	static contextType = StackData;

	constructor(props: any) {
		super(props);
		
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
	}

	handleMouseEnter(index: number) {
		if (this.props.onValueHovered)
			this.props.onValueHovered(index, this.props.values[index]);
	}
	handleMouseLeave(index: number) {
		if (this.props.onValueUnhovered)
			this.props.onValueUnhovered(index, this.props.values[index]);
	}

	render() {
		const viewValue = (value: any) => {
			if (value.size === 1)
			{
				const val = this.context.memory[value.address];
				if (value.type === 'Int8')
					return val;
				else if (value.type === 'Char')
					return `'${String.fromCharCode(val)}'`;
				else
					return val;
			}
			else if (value.size === 2)
				return;
			else if (value.size === 4)
				return;
			else
				return "";
		}

		return (
			<>
				Stack Values View
				{this.props.values.map((value: any, index: number) => 
					<div key={value.address || (-index)} className={styles.stackElem}
							onMouseEnter={() => this.handleMouseEnter(index)}
						>
						{
							value.kind === 'allocation' ?
							<div className={styles.stackValue}>
								<span className={styles.variableName + (!value.name ? ' ' + styles.unknownVar : '')}>
									{value.name || '?'}
								</span>
								&nbsp;
								<span className={styles.typeName}>{value.type}</span>
								&nbsp;({value.size} b)&nbsp;
								{value.address}
								&nbsp;
								Value: {viewValue(value)}
							</div>
							:
							<div className={styles.stackFrame}>
								Stack Frame (initial size: {value.initialSize})
							</div>
						}
					</div>
				)}
			</>
		);
	}
}
