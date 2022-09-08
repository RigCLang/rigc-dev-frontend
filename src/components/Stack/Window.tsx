import React from 'react';
import styles from '../../App.module.scss';

import Splitter, { SplitDirection } from '@devbookhq/splitter';

import StackMemoryView	from './MemoryView';
import StackWatchWindow, { Stack }	from './Watch';

interface StackWindowProps {
  stackValues: Stack;
}

export default function StackWindow(props: StackWindowProps) {

	const [highlightedAddresses, setHighlightedAddresses] = React.useState<[number, number]>();
	const [sizes, setSizes] = React.useState<[number, number]>([70, 30]);

	return (
		<Splitter direction={SplitDirection.Horizontal}
				initialSizes={sizes}
				minWidths={[100, 100]}
				onResizeFinished={(idx, s) => {setSizes([ s[0], s[1] ])}}
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
		</Splitter>
	);
}
