import { Locales } from 'src/models/locales';
import { UIPreferences } from 'src/models/ui-preferences';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ActionConfiguration } from 'src/models/action-configuration';

export interface TonConnectUiOptions {
    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;

    /**
     * HTML element id to attach the wallet connect button. If not passed button won't appear.
     * @default null.
     */
    buttonRootId?: string | null;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language?: Locales;

    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsList?: WalletsListConfiguration;

    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;
}
