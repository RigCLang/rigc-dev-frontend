import React from 'react';

export type CallstackItem = {
	functionName: string;
	file: string;
	line: number;
}

export type CallstackProps = {
	content: CallstackItem[];
}

interface ICallstackWindowProps {
	className?: string;
	callStack: CallstackItem[];
}

export class CallstackWindow extends React.Component<ICallstackWindowProps> {
	public render(): JSX.Element {
		const { className, callStack } = this.props;

		return (
			<div className={className}>
				<ul>
					{
						callStack.map(item => ( 
							<li style={{ listStyleType: 'none' }}>
								<span>{ item.functionName + ' ' }</span>
								<span>{ item.file + ' ' }</span>
								<span>{ item.line + ' ' }</span>
							</li>
						))
					}
				</ul>
			</div>
		);
	}
}
