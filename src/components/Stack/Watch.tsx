import React from "react";
import styles from "./MemoryView.module.scss";

import StackData, { viewBytes } from "./Context";

type MouseHoverCallback = (index: number, value: any) => void;

interface StackValuesViewProps {
	values?: any[];
	onValueHovered?: MouseHoverCallback;
	onValueUnhovered?: MouseHoverCallback;
}

export default
class WatchWindow extends React.Component<StackValuesViewProps, any>
{
	static contextType = StackData;

	constructor(props: any) {
		super(props);
		
		this.handleMouseEnter = this.handleMouseEnter.bind(this);

		this.state = {
			values: props.values ?? [
				{ kind: 'stackFrame', size: 0 },
				{ kind: 'var', name: '', type: 'Char', size: 1, address: 0 },
				{ kind: 'var', name: 'i', type: 'Int32', size: 4, address: 1 },
				{ kind: 'stackFrame', size: 5 },
				{ kind: 'var', name: 'c', type: 'Int32', size: 4, address: 5 },
				{ kind: 'var', name: 'x', type: 'Int32', size: 4, address: 9 },
				{ kind: 'var', name: 'z', type: 'Int32', size: 4, address: 13 },
				{ kind: 'stackFrame', size: 17 },
				{ kind: 'var', name: 'c', type: 'Int32', size: 4, address: 17 },
				{ kind: 'var', name: 'x', type: 'Int32', size: 4, address: 21 },
				{ kind: 'var', name: 'z', type: 'Int32', size: 4, address: 25 },
			]
		}
	}

	handleMouseEnter(index: number) {
		if (this.props.onValueHovered)
			this.props.onValueHovered(index, this.state.values[index]);
	}
	handleMouseLeave(index: number) {
		if (this.props.onValueUnhovered)
			this.props.onValueUnhovered(index, this.state.values[index]);
	}

	render() {
		const viewValue = (value: any) => {
			if (this.context.memory.length <= value.address + value.size)
				return "?";

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
				return viewBytes(this.context.memory, value.address, value.size).getInt16(0);
			else if (value.size === 4)
				return viewBytes(this.context.memory, value.address, value.size).getInt32(0);
			else
				return "";
		}

		return (
			<>
				Stack Values View
				{this.state.values.map((value: any, index: number) => 
					<div key={value.address || (-index)} className={styles.stackElem}
							onMouseEnter={() => this.handleMouseEnter(index)}
						>
						{
							value.kind === 'var' ?
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
								Stack Frame (initial size: {value.size})
							</div>
						}
					</div>
				)}
			</>
		);
	}
}
