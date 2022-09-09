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

import lightTheme	from './themes/light';
import darkTheme	from './themes/dark';
import StackWindow	from './components/Stack/Window';
import LogWindow, { ILogEntry }	from './components/Log/Window';

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


type AppState = {
	connected: ConnectionState;
	useDarkTheme: boolean;
	highlightedAddresses?: [number, number];
  callStack: CallstackItem[];
	memory: Int8Array;
}

const stackWithVerticalGap : IStackTokens = {
	childrenGap: 10,
	padding: "10px 0",
};


const defaultAddress = 'ws://localhost:9002';

class MainControlsProps {
	connected: ConnectionState = ConnectionState.Disconnected;
	addressRef?: IRefObject<ITextField>;
	onReconnect: () => void = () => {};
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
	onToggledDarkTheme: (isDarkTheme: boolean) => void = () => {};
	defaultTheme: 'dark' | 'light' = 'dark';
};

function ThemeSettings(props: ThemeSettingsProps) {
	const [useDarkTheme, setDarkTheme] = React.useState(props.defaultTheme === 'dark');

	return (
		<Stacker className={styles.splitterPanel}>
			<Toggle label="Use dark mode" defaultChecked onText="On" offText="Off"
					onChange={(e) => {
						props.onToggledDarkTheme?.(!useDarkTheme);
						setDarkTheme( !useDarkTheme );
					} } 
				/>
		</Stacker>
	);
}

export default class App extends React.Component<any, AppState> {

	ws: WebSocket | null;
	serverAddressRef: React.RefObject<ITextField>;
	
	logList: React.RefObject<List>;
	logEntries: ILogEntry[] = [];

	constructor(props: any) {
		super(props);
		
		this.ws = null;
		this.serverAddressRef	= React.createRef<ITextField>();
		this.logList			= React.createRef<List>();

		this.reconnect = this.reconnect.bind(this);

		this.state = {
			callStack: [],
			memory: new Int8Array([
				53, 0, 0, 0,
				12, 237, 0, 255,
				0, 11, 40, 0,
				19, 0, 8, 0, 

			]),
			connected: ConnectionState.Disconnected,
			useDarkTheme: true,
		}
	}

	setHoveredAddress(address?: [number, number]) {
		this.setState({
			highlightedAddresses: address
		});
	}

	pushToLog(entry: ILogEntry) {
		this.logEntries.push(entry);
		this.logList.current?.forceUpdate();
	}

	reconnect() {

		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.close();
		}

		this.setState({
			connected: ConnectionState.Connecting
		});

		const tryConnect = () => {
			if (!this.serverAddressRef.current)
				return false;
	
			const addr = this.serverAddressRef.current.value || "";
			if (addr === "")
				return false;
				
		
			this.ws = new WebSocket(addr);
			
			this.ws.onopen = () => {
				this.setState({
					connected: ConnectionState.Connected
				});
			}

			this.ws.onclose = () => {
				this.setState({
					connected: ConnectionState.Disconnected
				});
			}
			this.ws.onmessage = (event: MessageEvent) => {
				const json = JSON.parse(event.data);
				if (json.type === 'callstack') {
					if (json.action === 'push') {
            this.setState(prev => {
              return { ...prev, callStack: [ ...prev.callStack, json.data as CallstackItem ] }
            })
					}
					else if (json.action === 'pop') {
            this.setState(prev => {
              return { ...prev, callStack: prev.callStack.slice(0, -1) }
            })
					}
				}
				else if (json.type === 'log') {
					this.pushToLog(json.data as ILogEntry);

				}
			}
			return true;
		};


		if (!tryConnect()) {
			this.setState({
				connected: ConnectionState.Disconnected
			});
		}
	}

	render() {
		return (
			<ThemeProvider theme={this.state.useDarkTheme ? darkTheme : lightTheme}>
				<div style={{height: "100vh"}}>
					<Splitter direction={SplitDirection.Horizontal}
							initialSizes={[20, 80]}
							minWidths={[150, 600]}
						>
						{this.leftPanel()}
						<Splitter direction={SplitDirection.Vertical}
								initialSizes={[70, 30]}
								minHeights={[150, 150]}
							>
							<Splitter direction={SplitDirection.Horizontal}
									initialSizes={[70, 30]}
									minWidths={[150, 150]}
								>
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
								<StackData.Provider value={{ memory: this.state.memory }}>
									<StackWindow />
								</StackData.Provider>
							</Splitter>
							<Pivot aria-label="Bottom panel" className={styles.fullHeightPivot}>
								<PivotItem
									headerText="Output log"
									headerButtonProps={{
										'data-order': 1,
										'data-title': 'Output log',
									}}
									
									style={{height: '100%'}}
								>
									<LogData.Provider value={ { entries: this.logEntries } }>
										<LogWindow ref={this.logList} className={styles.splitterPanel}/>
									</LogData.Provider>
								</PivotItem>
								<PivotItem
									headerText="Callstack"
									headerButtonProps={{
										'data-order': 2,
										'data-title': 'Callstack',
									}}
								>
									<CallstackWindow callStack={this.state.callStack} className={styles.splitterPanel} />
								</PivotItem>
							</Pivot>
							
							{/* <Callstack ref={this.callStack}/> */}
						</Splitter>
					</Splitter>
				</div>
			</ThemeProvider>
		);
	}

	private leftPanel() {
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
					<MainControls connected={this.state.connected} onReconnect={() => this.reconnect()} addressRef={this.serverAddressRef}/>
				</PivotItem>
				<PivotItem
					headerText="Theme"
					headerButtonProps={{
						'data-order': 2,
						'data-title': 'Theme',
					}}
				>
					<ThemeSettings onToggledDarkTheme={(isDarkTheme) => this.setState({useDarkTheme: isDarkTheme})} defaultTheme='dark'/>
				</PivotItem>
			</Pivot>
		);
	}
}
