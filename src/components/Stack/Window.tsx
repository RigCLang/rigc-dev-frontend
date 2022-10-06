import React from 'react';
import { SplitPane } from '../../components';
import styles from '../../App.module.scss';

import StackMemoryView	from './MemoryView';
import StackWatchWindow, { Stack }	from './Watch';

interface StackWindowProps {
  stackValues: Stack;
}

export default function StackWindow(props: StackWindowProps) {

	const [highlightedAddresses, setHighlightedAddresses] = React.useState<[number, number]>();

	return (
		<SplitPane direction="x"
				cookieName="SplitPaneSize_StackWindow"
				initialSize={[50, 50]}
				minimalSize={[100, 100]}
			>
			<div className={styles.splitterPanel}>
				{<StackMemoryView highlightRange={highlightedAddresses}/>}
			</div>
			<div className={styles.splitterPanel}>
				<StackWatchWindow
						values={props.stackValues}
						onValueHovered={(_, addr) => setHighlightedAddresses([addr.address, addr.size])}
						onValueUnhovered={() => setHighlightedAddresses(undefined)}
					/>
			</div>
		</SplitPane>
	);
}
