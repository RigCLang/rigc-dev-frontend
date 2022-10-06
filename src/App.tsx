import logo from './logo.svg';
import styles from './App.module.scss';
import React from 'react';
import { CallstackItem, CallstackWindow } from './components/Callstack';

import Splitter, { SplitDirection } from '@devbookhq/splitter';

import {
	PrimaryButton,
	ThemeProvider,
	Toggle,
	List,
	TextField,
	ITextField,
	Stack as Stacker,
	IStackTokens,
	Pivot,
	PivotItem,
	Icon,
	IRefObject,
} from '@fluentui/react';

import lightTheme from './themes/light';
import darkTheme from './themes/dark';
import { Stack, StackFrame, StackAllocation } from './components/Stack/Watch';
import StackWindow from './components/Stack/Window';
import LogWindow, { ILogEntry } from './components/Log/Window';

import LogData, { logMockupData } from './components/Log/Context';
import StackData from './components/Stack/Context';

enum ConnectionState {
	Disconnected,
	Connecting,
	Connected,
}

function toString(state: ConnectionState) {
	switch (state) {
		case ConnectionState.Disconnected:
			return 'Disconnected';
		case ConnectionState.Connecting:
			return 'Connecting';
		case ConnectionState.Connected:
			return 'Connected';
	}
}


const stackWithVerticalGap: IStackTokens = {
	childrenGap: 10,
	padding: "10px 0",
};


const defaultAddress = 'ws://localhost:9002';

class MainControlsProps {
	connected: ConnectionState = ConnectionState.Disconnected;
	addressRef?: IRefObject<ITextField>;
	onReconnect: () => void = () => { };
}

function MainControls(props: MainControlsProps) {
	return (
		<Stacker className={styles.splitterPanel}>
			<p>Connection status: <span>{toString(props.connected)}</span></p>
			<TextField componentRef={props.addressRef} label="VM Address" required defaultValue={defaultAddress} placeholder="example: ws://localhost:9002" />
			<Stacker.Item align="start" tokens={stackWithVerticalGap}>
				<PrimaryButton text="Reconnect" onClick={props.onReconnect} />
			</Stacker.Item>
		</Stacker>
	);
}

class ThemeSettingsProps {
	onToggledDarkTheme: (isDarkTheme: boolean) => void = () => { };
	defaultTheme: 'dark' | 'light' = 'dark';
};

function ThemeSettings(props: ThemeSettingsProps) {
	const [useDarkTheme, setDarkTheme] = React.useState(props.defaultTheme === 'dark');

	return (
		<Stacker className={styles.splitterPanel}>
			<Toggle label="Use dark mode" defaultChecked onText="On" offText="Off"
				onChange={(e) => {
					props.onToggledDarkTheme?.(!useDarkTheme);
					setDarkTheme(!useDarkTheme);
				}}
			/>
		</Stacker>
	);
}

type AppPanes = {
	rootHorizontal: [number, number];
	mainVertical: [number, number];
	mainTopHorizontal: [number, number];
}

type AppState = {
	connected: ConnectionState;
	useDarkTheme: boolean;
	highlightedAddresses?: [number, number];
	callStack: CallstackItem[];
	stack: any[];
	memory: Int8Array;
}

export function LeftPanel({connected, reconnect, setUseDarkTheme, serverAddressRef}: any) {
	return (
		<Pivot aria-label="Basic Pivot Example">
			<PivotItem
				headerText="Main controls"
				headerButtonProps={{
					'data-order': 1,
					'data-title': 'Main controls',
				}}
				itemIcon="FabricMDL2Icons"
			>
				<MainControls connected={connected} onReconnect={reconnect} addressRef={serverAddressRef} />
			</PivotItem>
			<PivotItem
				headerText="Theme"
				headerButtonProps={{
					'data-order': 2,
					'data-title': 'Theme',
				}}
			>
				<ThemeSettings onToggledDarkTheme={(isDarkTheme) => setUseDarkTheme(isDarkTheme)} defaultTheme='dark' />
			</PivotItem>
		</Pivot>
	);
}

export interface SizedSplitPaneProps {
	children: React.ReactNode;
	initialSize: [number, number];
	minimalSize: [number, number];
	direction: SplitDirection;
}

export interface SplitPaneProps {
	children: React.ReactNode;
}

export function SizedSplitPane({children, initialSize, minimalSize, direction}: SizedSplitPaneProps) {
	const [sizes, setSizes] = React.useState<[number, number]>(initialSize);
	return (
		<Splitter direction={direction}
				initialSizes={sizes}
				onResizeFinished={(_, s) => setSizes(s as [number, number])}
				{...(direction === SplitDirection.Horizontal
					?
					{ minWidths: minimalSize }
					:
					{ minHeights: minimalSize }
				)}
			>
			{children}
		</Splitter>
	);
}

export function RootSplit({children}: SplitPaneProps) {
	return (
		<SizedSplitPane
				initialSize={[20, 80]}
				minimalSize={[150, 600]}
				direction={SplitDirection.Horizontal}>
			{children}
		</SizedSplitPane>
	);
}

export function MainVerticalSplit({children}: SplitPaneProps) {
	return (
		<SizedSplitPane
				initialSize={[70, 30]}
				minimalSize={[150, 150]}
				direction={SplitDirection.Vertical}>
			{children}
		</SizedSplitPane>
	);
}

export function MainTopHorizontalSplit({children}: SplitPaneProps) {
	return (
		<SizedSplitPane
				initialSize={[70, 30]}
				minimalSize={[150, 150]}
				direction={SplitDirection.Horizontal}>
			{children}
		</SizedSplitPane>
	);
}


export default function App() {


	let logEntries: ILogEntry[] = [];

	let ws: WebSocket | null = null;
	let serverAddressRef = React.createRef<ITextField>();
	let logList = React.createRef<List>();

	const [stack, setStack]			= React.useState<any[]>([]);
	const [callStack, setCallStack]	= React.useState<CallstackItem[]>([]);
	const [memory, setMemory]		= React.useState(new Int8Array([
			53, 0, 0, 0,
			12, 237, 0, 255,
			0, 11, 40, 0,
			19, 0, 8, 0,
		]));
	const [highlightedAddresses, setHighlightedAddresses] = React.useState<[number, number] | null>(null);

	const [connected, setConnected] = React.useState(ConnectionState.Disconnected);
	const [useDarkTheme, setUseDarkTheme] = React.useState(true);

	const pushToLog = (entry: ILogEntry) => {
		logEntries.push(entry);
		logList.current?.forceUpdate();
	}

	const handleStackRequest = (json: any) => {
		if (json.action === 'pushFrame') {
			const data = {
				kind: 'frame',
				...(json.data as StackFrame)
			}
			setStack([...stack, data]);
		}
		else if (json.action === 'popFrame') {

			// FIXME: seems like this doesnt work
			const isStackFrame = (item: any) => item.action === 'pushFrame';
			const lastStackFrameIndex = stack.slice().reverse().findIndex(isStackFrame);
			setStack(stack.slice(0, lastStackFrameIndex));
		}
		else if (json.action === 'allocate') {
			const data = {
				kind: 'allocation',
				...(json.data as StackAllocation)
			}
			setStack([...stack, data]);
		}
	}

	const reconnect = () => {

		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.close();
		}

		setConnected(ConnectionState.Connecting);

		const tryConnect = () => {
			if (!serverAddressRef.current)
				return false;

			const addr = serverAddressRef.current.value || "";
			if (addr === "")
				return false;


			ws = new WebSocket(addr);

			ws.onopen = () => { setConnected(ConnectionState.Connected); }
			ws.onclose = () => { setConnected(ConnectionState.Disconnected); }

			ws.onmessage = (event: MessageEvent) => {
				const json = JSON.parse(event.data);
				if (json.type === 'callstack') {
					if (json.action === 'push') {
						setCallStack([...callStack, json.data as CallstackItem]);
					}
					else if (json.action === 'pop') {
						setCallStack(callStack.slice(0, -1));
					}
				}
				else if (json.type === 'stack') {
					handleStackRequest(json);
				}
				else if (json.type === 'log') {
					pushToLog(json.data as ILogEntry);
				}
			}
			return true;
		};


		if (!tryConnect()) {
			setConnected(ConnectionState.Disconnected);
		}
	}

	return (
		<ThemeProvider theme={useDarkTheme ? darkTheme : lightTheme}>
			<div style={{ height: "100vh" }}>
				<RootSplit>
					<LeftPanel connected={connected} reconnect={reconnect} setUseDarkTheme={setUseDarkTheme} serverAddressRef={serverAddressRef}/>
					<MainVerticalSplit>
						<MainTopHorizontalSplit>	
							<div className={styles.splitterPanel}>
								<img src={logo} className={styles.appLogo} alt="logo" />
								<p>
									Edit <code>src/App.js</code> and save to reload.
								</p>
								<a
									className={styles.appLink}
									href="https://reactjs.org"
									target="_blank"
									rel="noopener noreferrer"
								>
									Learn React
								</a>
							</div>
							<StackData.Provider value={{ memory: memory }}>
								<StackWindow stackValues={stack} />
							</StackData.Provider>
						</MainTopHorizontalSplit>
						<Pivot aria-label="Bottom panel" className={styles.fullHeightPivot}>
							<PivotItem
								headerText="Output log"
								headerButtonProps={{
									'data-order': 1,
									'data-title': 'Output log',
								}}

								style={{ height: '100%' }}
							>
								<LogData.Provider value={{ entries: logEntries }}>
									<LogWindow ref={logList} className={styles.splitterPanel} />
								</LogData.Provider>
							</PivotItem>
							<PivotItem
								headerText="Callstack"
								headerButtonProps={{
									'data-order': 2,
									'data-title': 'Callstack',
								}}
							>
								<CallstackWindow callStack={callStack} className={styles.splitterPanel} />
							</PivotItem>
						</Pivot>
					</MainVerticalSplit>
				</RootSplit>
			</div>
		</ThemeProvider>
	);
}
