import { createContext, FunctionComponent, memo } from 'react';
import {
    ActionConfiguration,
    Locales,
    TonConnectUI,
    UIPreferences,
    WalletsListConfiguration
} from '@tonconnect/ui';
import type { ConnectAdditionalRequest, ITonConnect } from '@tonconnect/sdk';
import { isClientSide } from '../utils/web';

export const TonConnectUIContext = createContext<TonConnectUI | null>(null);

export type TonConnectUIProviderProps = {
    children: JSX.Element;
} & Partial<TonConnectUIProviderPropsBase> &
    Partial<TonConnectUIProviderPropsWithManifest | TonConnectUIProviderPropsWithConnector>;

export interface TonConnectUIProviderPropsWithManifest {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl: string;
}

export interface TonConnectUIProviderPropsWithConnector {
    /**
     * TonConnect instance. Can be helpful if you use custom ITonConnect implementation, or use both of @tonconnect/sdk and @tonconnect/ui in your app.
     */
    connector: ITonConnect;
}

export interface TonConnectUIProviderPropsBase {
    /**
     * Try to restore existing session and reconnect to the corresponding wallet.
     * @default true.
     */
    restoreConnection: boolean;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language: Locales;

    /**
     * HTML element id to attach the modal window element. If not passed, `div#tc-widget-root` in the end of the <body> will be added and used.
     * @default `div#tc-widget-root`.
     */
    widgetRootId: string;

    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;

    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsList?: WalletsListConfiguration;

    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Redefine wallets list source URL. Must be a link to a json file with [following structure]{@link https://github.com/ton-connect/wallets-list}
     * @default https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json
     * @
     */
    walletsListSource?: string;

    /**
     * Use it to customize ConnectRequest and add `tonProof` payload.
     * The function will be called after wallets modal opens, and wallets selection will be blocked until it's resolved.
     * If you have to make a http-request to your backend, it is better to do it after app initialization (if possible) and return (probably completed) promise to reduce loading time for the user.
     */
    getConnectParameters?: () => Promise<ConnectAdditionalRequest>;
}

let tonConnectUI: TonConnectUI | null = null;

/**
 * Add TonConnectUIProvider to the root of the app. You can specify UI options using props.
 * All TonConnect UI hooks calls and `<TonConnectButton />` component must be placed inside `<TonConnectUIProvider>`.
 * @param children JSX to insert.
 * @param [options] additional options.
 * @constructor
 */
const TonConnectUIProvider: FunctionComponent<TonConnectUIProviderProps> = ({
    children,
    ...options
}) => {
    if (isClientSide() && !tonConnectUI) {
        tonConnectUI = new TonConnectUI(options);
    }

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>{children}</TonConnectUIContext.Provider>
    );
};

export default memo(TonConnectUIProvider);
