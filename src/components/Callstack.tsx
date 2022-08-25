import React from 'react';
import styles from './Callstack.module.scss';

import { Link } from '@fluentui/react/lib/Link';
import {
	DetailsList,
	Selection,
	IColumn,
	buildColumns,
	IColumnReorderOptions,
	IDragDropEvents,
	IDragDropContext,
	ColumnActionsMode,
} from '@fluentui/react/lib/DetailsList';
import { getTheme, mergeStyles } from '@fluentui/react/lib/Styling';

export type CallstackItem = {
	functionName: string;
	file: string;
	line: number;
}

export type CallstackProps = {
	content: CallstackItem[];
}

export default
class Callstack extends React.Component<any, CallstackProps>
{
	constructor(props: any) {
		super(props);

		this.state = {
			content: []
		}
	}

	public push(item: CallstackItem) {
		this.setState((prev) => ({
			content: [...prev.content, item]
		}));
	}

	public pop() {
		this.setState((prev) => ({
			content: prev.content.slice(0, -1)
		}));
	}

	render() {
		return (
			<div className={styles.callstack}>
				<table>
					<thead>
						<tr>
							<th className={styles.index}>#</th>
							<th className={styles.functionName}>Function</th>
							<th className={styles.fileName}>File</th>
							<th className={styles.lineNumber}>Line</th>
						</tr>
					</thead>
					<tbody>
						{this.state.content.reverse().map((item: any, index: number) => {
							const idx = this.state.content.length - index - 1;
							return (
								<tr key={`${idx}-${item.functionName}-${item.file}-${item.line}`}>
									<td className={styles.index}>{idx}</td>
									<td className={styles.functionName}>{item.functionName}</td>
									<td className={styles.fileName}>{item.file}</td>
									<td className={styles.lineNumber}>{item.line}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}



const theme = getTheme();
const dragEnterClass = mergeStyles({
	backgroundColor: theme.palette.neutralLight,
});

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
	private _selection: Selection;
	private _dragDropEvents: IDragDropEvents;
	private _draggedItem: CallstackItem | undefined;
	private _draggedIndex: number;

	constructor(props: ICallstackWindowProps) {
		super(props);

		this._selection = new Selection();
		this._dragDropEvents = this._getDragDropEvents();
		this._draggedIndex = -1;
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
					selection={this._selection}
					selectionPreservedOnEmptyClick={true}
					onItemInvoked={this._onItemInvoked}
					onRenderItemColumn={this._onRenderItemColumn}
					dragDropEvents={this._dragDropEvents}
					columnReorderOptions={this.state.isColumnReorderEnabled ? this._getColumnReorderOptions() : undefined}
					ariaLabelForSelectionColumn="Toggle selection"
					ariaLabelForSelectAllCheckbox="Toggle selection for all items"
					checkButtonAriaLabel="select row"
				/>
			</div>
		);
	}

	private _handleColumnReorder = (draggedIndex: number, targetIndex: number) => {
		const draggedItems = this.state.columns[draggedIndex];
		const newColumns: IColumn[] = [...this.state.columns];

		// insert before the dropped item
		newColumns.splice(draggedIndex, 1);
		newColumns.splice(targetIndex, 0, draggedItems);
		this.setState({ columns: newColumns });
	};

	private _getColumnReorderOptions(): IColumnReorderOptions {
		return {
			frozenColumnCountFromStart: 0,
			frozenColumnCountFromEnd: 0,
			handleColumnReorder: this._handleColumnReorder,
		};
	}

	private _getDragDropEvents(): IDragDropEvents {
		return {
			canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
				return true;
			},
			canDrag: (item?: any) => {
				return true;
			},
			onDragEnter: (item?: any, event?: DragEvent) => {
				// return string is the css classes that will be added to the entering element.
				return dragEnterClass;
			},
			onDragLeave: (item?: any, event?: DragEvent) => {
				return;
			},
			onDrop: (item?: any, event?: DragEvent) => {
				if (this._draggedItem) {
					this._dropSelectionBeforeItem(item);
				}
			},
			onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
				this._draggedItem = item;
				this._draggedIndex = itemIndex!;
			},
			onDragEnd: (item?: any, event?: DragEvent) => {
				this._draggedItem = undefined;
				this._draggedIndex = -1;
			},
		};
	}

	private _onItemInvoked = (item: CallstackItem): void => {
		alert(`Item invoked: ${item.functionName}`);
	};

	private _onRenderItemColumn = (item: CallstackItem, index?: number, column?: IColumn): JSX.Element | string => {
		if (!column)
			return '';

		const key = column.key as keyof CallstackItem;
		if (key === 'functionName') {
			return <Link data-selection-invoke={true}>{item[key]}</Link>;
		}

		return String(item[key]);
	};

	private _dropSelectionBeforeItem(item: CallstackItem): void {
		const draggedItems = this._selection.isIndexSelected(this._draggedIndex)
			? (this._selection.getSelection() as CallstackItem[])
			: [this._draggedItem!];

		const insertIndex = this.state.items.indexOf(item);
		const items = this.state.items.filter(itm => draggedItems.indexOf(itm) === -1);

		items.splice(insertIndex, 0, ...draggedItems);

		this.setState({ items });
	}
}
