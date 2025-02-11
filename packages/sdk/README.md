# TON Connect SDK

Use it to connect your app to TON wallets via TonConnect protocol. 
You can find more details and the protocol specification in the [docs](https://github.com/ton-connect/docs).
See the example of sdk usage [here](https://github.com/ton-connect/demo-dapp).

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_sdk.html)

# Getting started
## Installation with cdn
Add the script to your HTML file:
```html
<script src="https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js"></script>
```

ℹ️ If you don't want auto-update the library, pass concrete version instead of `latest`, e.g. 
```html
<script src="https://unpkg.com/@tonconnect/sdk@0.0.34/dist/tonconnect-sdk.min.js"></script>
```

You can find `TonConnect` in global variable `TonConnectSDK`, e.g.
```html
<script>
    const connector = new TonConnectSDK.TonConnect();
</script>
```

## Installation with npm
`npm i @tonconnect/sdk`

# Usage
## Init connector and call restoreConnection. If user connected his wallet before, connector will restore the connection

```ts
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect();

connector.restoreConnection();
```

## Add the tonconnect-manifest
App needs to have its manifest to pass meta information to the wallet. Manifest is a JSON file named as `tonconnect-manifest.json` following format:

```json
{
  "url": "<app-url>",                        // required
  "name": "<app-name>",                      // required
  "iconUrl": "<app-icon-url>",               // required
  "termsOfUseUrl": "<terms-of-use-url>",     // optional
  "privacyPolicyUrl": "<privacy-policy-url>" // optional
}
```

Best practice is to place the manifest in the root of your app, e.g. `https://myapp.com/tonconnect-manifest.json`. It allows the wallet to handle your app better and improve the UX connected to your app.
Make sure that manifest is available to GET by its URL.

[See details](https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest)

If your manifest placed not in the root of your app, you can specify its path:
```ts
    const connector = new TonConnect({ manifestUrl: 'https://myApp.com/assets/tonconnect-manifest.json' });
```

## Subscribe to the connection status changes
```js
const unsubscribe = connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);

// call `unsubscribe()` later to save resources when you don't need to listen for updates anymore.
```

## Fetch wallets list

TonConnect is build to support different wallets. You can fetch all supported wallets list and show a custom wallet selection dialog for user.

```ts
const walletsList = await connector.getWallets();

/* walletsList is 
{
    name: string;
    imageUrl: string;
    tondns?: string;
    aboutUrl: string;
    universalLink?: string;
    deepLink?: string;
    bridgeUrl?: string;
    jsBridgeKey?: string;
    injected?: boolean; // true if this wallet is injected to the webpage
    embedded?: boolean; // true if the dapp is opened inside this wallet's browser
}[] 
 */
```

You also can get wallets list using `getWallets` static method:
```ts
const walletsList = await TonConnect.getWallets();
```

## Initialize a wallet connection when user clicks to 'connect' button in your app
### Initialize a remote wallet connection via universal link 

```ts
const walletConnectionSource = {
    universalLink: 'https://app.mycooltonwallet.com',
    bridgeUrl: 'https://bridge.mycooltonwallet.com'
}

const universalLink = connector.connect(walletConnectionSource);
```

Then you have to show this link to user as QR code, or use it as a deeplink. You will receive an update in `connector.onStatusChange` when user approves connection in the wallet.

### Initialize injected wallet connection
```ts
const walletConnectionSource = {
    jsBridgeKey: 'tonkeeper'
}

connector.connect(walletConnectionSource);
```

You will receive an update in `connector.onStatusChange` when user approves connection in the wallet.

### Detect embedded wallet
It is recommended not to show a QR code modal if the app is opened inside a wallet's browser. 
You should detect working environment of the app and show appropriate UI.
Check `embedded` property in elements of the wallets list to detect if the app is opened inside a wallet.

```ts
import { isWalletInfoInjected, WalletInfoInjected } from '@tonconnect/sdk';

// "connect button" click handler.
// Execute this before show wallet selection modal.

const walletsList = await connector.getWallets(); // or use `walletsList` fetched before  

const embeddedWallet = walletsList.find(
    wallet => isWalletInfoInjected(wallet) && wallet.embedded
) as WalletInfoInjected;

if (embeddedWallet) {
    connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    return;
}

// else show modal and ask user to select a wallet
```

## Send transaction
```ts
if (!connector.connected) {
    alert('Please connect wallet to send the transaction!');
}

const transaction = {
    validUntil: 1658253458,
    messages: [
        {
            address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
            amount: "20000000",
            stateInit: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
        },
        {
            address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
            amount: "60000000",
            payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
        }
    ]
}

try {
    const result = await connector.sendTransaction(transaction);
    
    // you can use signed boc to find the transaction 
    const someTxData = await myAppExplorerService.getTransaction(result.boc);
    alert('Transaction was sent successfully', someTxData);
} catch (e) {
    if (e instanceof UserRejectedError) {
        alert('You rejected the transaction. Please confirm it to send to the blockchain');
    } else {
        alert('Unknown error happened', e);
    }
}
```

# Utils

## Convert address to user-friendly format
Use `toUserFriendlyAddress` function to convert raw-address to the user-friendly format. You can pass `true` as a second
parameter to make it 'testnet only' (disabled by default).


```ts
import { toUserFriendlyAddress } from '@tonconnect/sdk';

const rawAddress = connector.wallet.account.address; // like '0:abcdef123456789...'
const bouncableUserFriendlyAddress = toUserFriendlyAddress(rawAddress);
const testnetOnlyBouncableUserFriendlyAddress = toUserFriendlyAddress(rawAddress, true);
```

# Backend authorization
To authorize user in your backend with TonConnect you can use following schema:
1. Fetch auth payload from your backend. It might be any random value. Backend must save information that this payload was sent to the client to check payload correctness later.
2. Connect to the wallet when user clicks to the connection button:
```ts
    connector.connect(walletConnectionSource, { tonProof: "<your-fetched-payload>" });
```
Note that you can use `tonProof` only with `connector.connect()` method. This feature is not available in `connector.restoreConnection()`.

3. Read a signed result after user approves connection:
```ts
connector.onStatusChange(wallet => {
			if (!wallet) {
				return;
			}

			const tonProof = wallet.connectItems?.tonProof;

			if (tonProof) {
				if ('proof' in tonProof) {
                    // send proof to your backend
					// e.g. myBackendCheckProof(tonProof.proof, wallet.account);
					return;
				}

				console.error(tonProof.error);
			}
		});
```
4. Send proof and user's account data to your backend. Backend should check the proof correctness and check that payload inside the proof was generated before. After all checks backend should return an auth token to the client. Notice that `Account` contains the `walletStateInit` property which can be helpful for your backend to get user's public key if user's wallet contract doesn't support corresponding get method.
5. Client saves the auth token in the `localStorage` and use it to access to auth-required endpoints. Client should delete the token when user disconnects the wallet.

[See an example of a dapp using backend authorization](https://github.com/ton-connect/demo-dapp-with-backend). 

[See an example of the dapp backend](https://github.com/ton-connect/demo-dapp-backend). 


# Use with NodeJS
You can use the SDK in frontend apps and in backend apps created with NodeJS. 

## Installation
`npm i @tonconnect/sdk`

## Init connector
When you use the SDK in backend, you have to pass `manifestUrl` and `IStorage` implementation to the TonConnect constructor.

[See more about the manifest](##add-the-tonconnect-manifest).

```ts
import TonConnect from '@tonconnect/sdk';

const storage: IStorage = <your implementation of the IStorage>

const connector = new TonConnect({ manifestUrl, storage });
```

Your storage should implement following interface:
```ts
export interface IStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
}
```

[See details about IStorage in the API documentation](https://ton-connect.github.io/sdk/interfaces/_tonconnect_sdk.IStorage.html).

Other steps are the same as for browser apps.
