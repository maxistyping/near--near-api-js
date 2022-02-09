//TODO: update this description
/**
 * The classes in this module are used in conjunction with the {@link BrowserLocalStorageKeyStore}. This module exposes two classes:
 * * {@link WalletConnectionRedirect} which redirects users to {@link https://docs.near.org/docs/tools/near-wallet | NEAR Wallet} for key management.
 * * {@link ConnectedWalletAccountRedirect} is an {@link Account} implementation that uses {@link WalletConnectionWithKeyManagement} to get keys
 * 
 * @module walletAccount
 */
import { Account } from '../account';
import { Near } from '../near';
import { Transaction, Action } from '../transaction';
import { PublicKey } from '../utils';
import { Connection } from '../connection';
import { KeyStore } from '../key_stores';
import { InMemorySigner } from '../signer';

const MULTISIG_HAS_METHOD = 'add_request_and_confirm';
const LOCAL_STORAGE_KEY_SUFFIX = '_wallet_auth_key';

export interface SignInOptions {
    contractId?: string;
    methodNames?: string[];
    // TODO: Replace following with single callbackUrl
    successUrl?: string;
    failureUrl?: string;
}

/**
 * Information to send NEAR wallet for signing transactions and redirecting the browser back to the calling application
 */
export interface RequestSignTransactionsOptions {
    /** list of transactions to sign */
    transactions: Transaction[];
    /** url NEAR Wallet will redirect to after transaction signing is complete */
    callbackUrl?: string;
    /** meta information NEAR Wallet will send back to the application. `meta` will be attached to the `callbackUrl` as a url search param */
    meta?: string;
}

export abstract class WalletConnectionBase implements TransactionsSigner, SignInProvider, AcocuntProvider {
    /** @hidden */
    _near: Near;

    /**
    * @param {Near} near Near object
    * @param {string} appKeyPrefix application identifier
    */
    constructor(near: Near, appKeyPrefix: string | null) {
        this._near = near;
        appKeyPrefix = appKeyPrefix || near.config.contractName || 'default';
    }

    abstract requestSignTransactions({ transactions, meta, callbackUrl }: RequestSignTransactionsOptions): Promise<void>;
    abstract requestSignIn({ contractId, methodNames, successUrl, failureUrl }: SignInOptions);
    abstract isSignedIn(): boolean;
    abstract getAccountId(): string;
    abstract signOut(): void;
    abstract account(): Account;
}

export abstract class WalletConnectionWithKeyManagement extends WalletConnectionBase {
    /** @hidden */
    _authDataKey: string;

    /** @hidden */
    _keyStore: KeyStore;

    /** @hidden */
    _authData: any;

    /** @hidden */
    _networkId: string;

    /** @hidden */
    _connectedAccount: ConnectedWalletAccount;

    /**
     * @param {Near} near Near object
     * @param {string} appKeyPrefix application identifier
     */
    constructor(near: Near, appKeyPrefix: string | null) {
        const authDataKey = appKeyPrefix + LOCAL_STORAGE_KEY_SUFFIX;
        super(near, appKeyPrefix); // NOTE: super called here for backward compatability
        const authData = JSON.parse(window.localStorage.getItem(authDataKey));
        this._networkId = near.config.networkId;
        this._keyStore = (near.connection.signer as InMemorySigner).keyStore;
        this._authData = authData || { allKeys: [] };
        this._authDataKey = authDataKey;
    }

    abstract requestSignTransactions({ transactions, meta, callbackUrl }: RequestSignTransactionsOptions): Promise<void>;

    abstract requestSignIn({ contractId, methodNames, successUrl, failureUrl }: SignInOptions);

    /**
     * Returns true, if this WalletConnectionRedirect is authorized with the wallet.
     * @example
     * ```js
     * const walletConnection = new WalletConnectionRedirect(near, 'my-app', walletBaseUrl);
     * walletConnection.isSignedIn();
     * ```
     */
    isSignedIn(): boolean {
        return !!this._authData.accountId;
    }

    /**
     * Returns authorized Account ID.
     * @example
     * ```js
     * const walletConnection = new WalletConnection(near, 'my-app', walletBaseUrl);
     * walletConnection.getAccountId();
     * ```
     */
    getAccountId(): string {
        return this._authData.accountId || '';
    }

    /**
    * Sign out from the current account
    * @example
    * walletConnection.signOut();
    */
    signOut(): void {
        this._authData = {};
        window.localStorage.removeItem(this._authDataKey);
    }

    account(): Account {
        throw new Error('Method not implemented.');
    }
}

interface TransactionsSigner {
    requestSignTransactions({ transactions, meta, callbackUrl }: RequestSignTransactionsOptions): Promise<void>;
}

interface SignInProvider {
    requestSignIn({ contractId, methodNames, successUrl, failureUrl }: SignInOptions);
    isSignedIn(): boolean;
    getAccountId(): string;
    signOut(): void;
}

interface AcocuntProvider {
    account(): Account;
}

export abstract class ConnectedWalletAccount extends Account {
    walletConnection: WalletConnectionWithKeyManagement;

    constructor(walletConnection: WalletConnectionWithKeyManagement, connection: Connection, accountId: string) {
        super(connection, accountId);
        this.walletConnection = walletConnection;
    }

    /**
   * Check if given access key allows the function call or method attempted in transaction
   * @param accessKey Array of {access_key: AccessKey, public_key: PublicKey} items
   * @param receiverId The NEAR account attempting to have access
   * @param actions The action(s) needed to be checked for access
   */
    async accessKeyMatchesTransaction(accessKey, receiverId: string, actions: Action[]): Promise<boolean> {
        const { access_key: { permission } } = accessKey;
        if (permission === 'FullAccess') {
            return true;
        }

        if (permission.FunctionCall) {
            const { receiver_id: allowedReceiverId, method_names: allowedMethods } = permission.FunctionCall;
            /********************************
            Accept multisig access keys and let wallets attempt to signAndSendTransaction
            If an access key has itself as receiverId and method permission add_request_and_confirm, then it is being used in a wallet with multisig contract: https://github.com/near/core-contracts/blob/671c05f09abecabe7a7e58efe942550a35fc3292/multisig/src/lib.rs#L149-L153
            ********************************/
            if (allowedReceiverId === this.accountId && allowedMethods.includes(MULTISIG_HAS_METHOD)) {
                return true;
            }
            if (allowedReceiverId === receiverId) {
                if (actions.length !== 1) {
                    return false;
                }
                const [{ functionCall }] = actions;
                return functionCall &&
                    (!functionCall.deposit || functionCall.deposit.toString() === '0') && // TODO: Should support charging amount smaller than allowance?
                    (allowedMethods.length === 0 || allowedMethods.includes(functionCall.methodName));
                // TODO: Handle cases when allowance doesn't have enough to pay for gas
            }
        }
        // TODO: Support other permissions than FunctionCall

        return false;
    }

    /**
     * Helper function returning the access key (if it exists) to the receiver that grants the designated permission
     * @param receiverId The NEAR account seeking the access key for a transaction
     * @param actions The action(s) sought to gain access to
     * @param localKey A local public key provided to check for access
     * @returns Promise<any>
     */
    async accessKeyForTransaction(receiverId: string, actions: Action[], localKey?: PublicKey): Promise<any> {
        const accessKeys = await this.getAccessKeys();

        if (localKey) {
            const accessKey = accessKeys.find(key => key.public_key.toString() === localKey.toString());
            if (accessKey && await this.accessKeyMatchesTransaction(accessKey, receiverId, actions)) {
                return accessKey;
            }
        }

        const walletKeys = this.walletConnection._authData.allKeys;
        for (const accessKey of accessKeys) {
            if (walletKeys.indexOf(accessKey.public_key) !== -1 && await this.accessKeyMatchesTransaction(accessKey, receiverId, actions)) {
                return accessKey;
            }
        }

        return null;
    }
}