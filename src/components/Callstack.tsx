import React from 'react';

import {
	DetailsList,
	IColumn,
	buildColumns,
} from '@fluentui/react/lib/DetailsList';

export type CallstackItem = {
	functionName: string;
	file: string;
	line: number;
}

export type CallstackProps = {
	content: CallstackItem[];
}

interface IDetailsListDragDropExampleState {
	items: CallstackItem[];
	columns: IColumn[];
	isColumnReorderEnabled: boolean;
}

const callstackColumnNames = {
	'functionName': 'Function',
	'file': 'File',
	'line': 'Line',
};

interface ICallstackWindowProps {
	className?: string;
}

export class CallstackWindow extends React.Component<ICallstackWindowProps, IDetailsListDragDropExampleState> {
	constructor(props: ICallstackWindowProps) {
		super(props);

		const items: CallstackItem[] = [
			{
				functionName: 'functionName',
				file: 'file',
				line: 1
			},
			{
				functionName: 'functionName2',
				file: 'file',
				line: 1
			},
			{
				functionName: 'functionName3',
				file: 'file',
				line: 1
			},
			{
				functionName: 'functionName4',
				file: 'file',
				line: 1
			},
		];

		this.state = {
			items: items,
			columns: buildColumns(items, true).map((column) => ({ ...column, name: callstackColumnNames[column.key as keyof typeof callstackColumnNames] })),
			isColumnReorderEnabled: true,
		};
	}

	public render(): JSX.Element {
		const { items, columns } = this.state;

		return (
			<div className={this.props.className}>
				<DetailsList
					setKey="items"
					compact
					items={items}
					columns={columns}
					selectionPreservedOnEmptyClick={true}
					ariaLabelForSelectionColumn="Toggle selection"
					ariaLabelForSelectAllCheckbox="Toggle selection for all items"
					checkButtonAriaLabel="select row"
				/>
			</div>
		);
	}
}
