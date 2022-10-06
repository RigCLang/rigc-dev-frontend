import React from 'react';

import {
	PrimaryButton,
	Toggle,
	TextField,
	ITextField,
	Stack as Stacker,
	IStackTokens,
	Pivot,
	PivotItem,
	IRefObject,
} from '@fluentui/react';
import { ConnectionState, toString } from '../../Connection';

import styles from "./SettingsPanel.module.scss";

const stackWithVerticalGap: IStackTokens = {
	childrenGap: 10,
	padding: "10px 0",
};


const defaultAddress = 'ws://localhost:9002';

class MainControlsProps {
	connected: ConnectionState = ConnectionState.Disconnected;
	addressRef?: IRefObject<ITextField>;
	onReconnect: () => void = () => { };
	onAutoReconnectChanged: (autoReconnect: boolean) => void = () => { };
}

function MainControls(props: MainControlsProps) {

	const [autoReconnect, setAutoReconnect] = React.useState(true);

	return (
		<Stacker className="app-window">
			<p>Connection status: <span>{toString(props.connected)}</span></p>
			<Toggle label="Auto reconnect" defaultChecked onText="On" offText="Off"
				onChange={(e) => {
					props.onAutoReconnectChanged(!autoReconnect);
					setAutoReconnect(!autoReconnect);
				}}
			/>
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

export function SettingsPanel({connected, reconnect, setUseDarkTheme, serverAddressRef, onAutoReconnectChanged}: any) {
	return (
		<Pivot aria-label="Settings panel">
			<PivotItem
				headerText="Main controls"
				headerButtonProps={{
					'data-order': 1,
					'data-title': 'Main controls',
				}}
				itemIcon="FabricMDL2Icons"
			>
				<MainControls
						connected={connected}
						onReconnect={reconnect}
						addressRef={serverAddressRef}
						onAutoReconnectChanged={onAutoReconnectChanged}
					/>
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
