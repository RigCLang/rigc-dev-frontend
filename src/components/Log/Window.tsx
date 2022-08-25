import React from 'react';
import styles from './Window.module.scss';
import { List } from '@fluentui/react';
import LogData from './Context';

export interface ILogEntry {
	message: string;
	kind: 'info' | 'error';
}

export default function LogWindow(props: { className?: string, ref?: React.RefObject<List> }) {

	const ctx = React.useContext(LogData);

	const onRenderCell = React.useCallback((item?: ILogEntry, index?: number) => {
		const itemClassName = (item && item.kind === 'error') ? styles.logEntryError : styles.logEntryInfo;
		const itemKindText = (item && item.kind === 'error') ? 'Error' : 'Info';
		return (
			<span className={styles.logEntry + ' ' + itemClassName}>
				<span className={styles.logEntryKind}>
					[{itemKindText}]: 
				</span>
				<span className={styles.logEntryContent}>
					{item ? item.message : ""}
				</span>
			</span>
		);
	}, []);

	return (
		<div className={props.className + ' ' + styles.logWindow}>
			<List
				ref={props.ref}
				className={styles.logList}
				items={ctx.entries}
				onRenderCell={onRenderCell}
				/>
		</div>
	)
}