import { default as React } from 'react';
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}
export declare class BlockErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(_: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    render(): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;
}
export {};
