import React from 'react';
import logo from './logo.svg';
import styles from './App.module.scss';
import { CallstackItem, CallstackWindow } from './components/Callstack';

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
import { SplitPane } from './components';
import { ConnectionState } from './Connection';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';


export interface SplitPaneProps {
	children: React.ReactNode;
}


export function RootSplit({children}: SplitPaneProps) {
	return (
		<SplitPane
				initialSize={[20, 80]}
				minimalSize={[150, 600]}
				direction="x"
				cookieName="SplitPaneSize_RootHorizontal"
			>
			{children}
		</SplitPane>
	);
}

export function MainVerticalSplit({children}: SplitPaneProps) {
	return (
		<SplitPane
				initialSize={[70, 30]}
				minimalSize={[150, 150]}
				direction="y"
				cookieName="SplitPaneSize_MainVertical"
			>
			{children}
		</SplitPane>
	);
}

export function MainTopHorizontalSplit({children}: SplitPaneProps) {
	return (
		<SplitPane
				initialSize={[70, 30]}
				minimalSize={[150, 150]}
				direction="x"
				cookieName="SplitPaneSize_MainTopHorizontal"
			>
			{children}
		</SplitPane>
	);
}


export default function App() {


	let logEntries: ILogEntry[] = [];

	const [ws, setWebSocket] = React.useState<WebSocket | null>(null);
	let serverAddressRef = React.createRef<ITextField>();
	let logList = React.createRef<List>();

	const [stack, setStack]			= React.useState<any[]>([]);
	const [callStack, setCallStack]	= React.useState<CallstackItem[]>([]);
	const [autoReconnect, setAutoReconnect]	= React.useState(true);
	const [memory, setMemory]		= React.useState(new Int8Array([
			53, 0, 0, 0,
			12, 237, 0, 255,
			0, 11, 40, 0,
			19, 0, 8, 0,
		]));
	const [highlightedAddresses, setHighlightedAddresses] = React.useState<[number, number] | null>(null);

	const [connected, setConnected] = React.useState(ConnectionState.Disconnected);
	const [useDarkTheme, setUseDarkTheme] = React.useState(true);

	React.useEffect(() => {
		if (connected === ConnectionState.Connected) {
			setStack([]);
		}
	}, [connected]);

	const pushToLog = React.useCallback((entry: ILogEntry) => {
		logEntries.push(entry);
		logList.current?.forceUpdate();
	}, [logEntries, logList]);

	const handleStackRequest = (json: any) => {
		if (json.action === 'pushFrame') {
			const data = {
				kind: 'frame',
				...(json.data as StackFrame)
			}
			setStack(s => [...s, data]);
		}
		else if (json.action === 'popFrame') {

			// FIXME: seems like this doesnt work
			const isStackFrame = (item: any) => item.action === 'pushFrame';
			setStack(s => {
				const lastStackFrameIndex = s.slice().reverse().findIndex(isStackFrame);
				return s.slice(0, lastStackFrameIndex)
			});
		}
		else if (json.action === 'allocate') {
			const data = {
				kind: 'allocation',
				...(json.data as StackAllocation)
			}
			setStack(s => [...s, data]);
		}
	}

	const reconnect = React.useCallback(() => {

		if (ws) {
			ws.close();
			setWebSocket(null);
		}

		setConnected(ConnectionState.Connecting);

		const tryConnect = () => {
			if (!serverAddressRef.current)
				return false;

			const addr = serverAddressRef.current.value || "";
			if (addr === "")
				return false;

			let ws = new WebSocket(addr);

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
			setWebSocket(ws);

			return true;
		};


		if (!tryConnect()) {
			setConnected(ConnectionState.Disconnected);
		}
	}, [callStack, pushToLog, serverAddressRef, ws]);

	React.useEffect(() => {
		if (autoReconnect && connected === ConnectionState.Disconnected) {
			reconnect();
		}
	}, [reconnect, connected, autoReconnect, ws]);

	return (
		<ThemeProvider theme={useDarkTheme ? darkTheme : lightTheme}>
			<div style={{ height: "100vh" }}>
				<RootSplit>
					<SettingsPanel
						connected={connected}
						reconnect={reconnect}
						setUseDarkTheme={setUseDarkTheme}
						serverAddressRef={serverAddressRef}
						onAutoReconnectChanged={(ar: boolean) => setAutoReconnect(ar)}
					/>
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
