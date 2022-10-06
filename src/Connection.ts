export enum ConnectionState {
	Disconnected,
	Connecting,
	Connected,
}

export function toString(state: ConnectionState) {
	switch (state) {
		case ConnectionState.Disconnected:
			return 'Disconnected';
		case ConnectionState.Connecting:
			return 'Connecting';
		case ConnectionState.Connected:
			return 'Connected';
	}
}
