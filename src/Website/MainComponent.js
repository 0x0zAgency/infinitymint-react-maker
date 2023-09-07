import React, { Component, Fragment } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Web3 from 'web3';
import OnBoard from 'bnc-onboard';

//InfinityMint stuff
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import pageController from 'infinitymint-client/dist/src/classic/pageController.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';

// Helpers
import { waitSetState } from '../helpers.js';

// Default components
import WebsiteNavbar from '../Components/WebsiteNavbar.js';

// Default modals
import LoadingModal from '../Modals/LoadingModal.js';
import UpdateModal from '../Modals/UpdateModal.js';

// Components
import Loading from '../Components/Loading.js';

// Fake pages
import RequireWallet from '../Pages/Routeless/RequireWallet.js';
import SuggestWallet from '../Pages/Routeless/SuggestWallet.js';
import NotFound from '../Pages/NotFound.js';

let isFirstRun = false;
class MainComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lastUpdated: Date.now(),
            loaded: false,
            mounted: 0,
            walletValid: false,
            web3Valid: false,
            hasAccepted: false,
            dropdown: {
                user: [],
                stickers: [],
                utilities: [],
                admin: [],
            },
            pages: [],
            navbar: [],
            navbarStart: [],
            navbarEnd: [],
            loadingInterval: null,
            showLoadingModal: false,
            showUpdateModal: false,
            loadingStatusText: 'Loading Wizardry...',
            loadingPercentage: 0,
        };

        this.willUnmount = false;
    }

    async startUpdateCheckInterval() {
        const interval = setInterval(() => {
            if (this.willUnmount) {
                clearInterval(interval);
            }

            if (
                storageController.getGlobalPreference('needsPathReset') &&
                this.state.showUpdateModal !== true
            ) {
                this.setState({
                    showUpdateModal: true,
                });
            }
        }, 2000);
        this.setState({
            updateInterval: interval,
        });
    }

    async updateLoadingText(text, percentage) {
        controller.log(text, 'main component');
        await waitSetState(this, {
            loadingStatusText: text,
            loadingPercentage: percentage,
        });
    }

    async componentDidMount() {
        this.willUnmount = false;
        let Config = controller.getConfig();
        clearInterval(this.state.updateInterval);
        // Set default background image
        // cap minimum width to 312
        document.querySelectorAll('body')[0].style.minWidth = '312px';
        document.querySelectorAll(
            'body'
        )[0].style.backgroundImage = `url(${Config.getBackground('./')})`;

        // Save last deploy info and rest if deploy info Is different
        if (
            storageController.getGlobalPreference('lastDeployInfo') !==
                undefined &&
            storageController.getGlobalPreference('lastDeployInfo') !==
                (Config.deployInfo.id || 0)
        ) {
            controller.log(
                'new project detected, wiping old things...',
                'web3'
            );
            storageController.values.paths = {};
            storageController.values.preload = {};
            storageController.values.tokens = {};
            storageController.values.tokenURI = {};
            storageController.values.deployments = {};
            storageController.values.previews = {};
            storageController.values.requests = {};
            storageController.setGlobalPreference('lastTag', undefined);
            storageController.setGlobalPreference('previousTag', undefined);
            storageController.setGlobalPreference('lastVersion', undefined);
            storageController.setGlobalPreference('previousVersion', undefined);
            storageController.saveData();
        }

        // Save last deploy info
        storageController.setGlobalPreference(
            'lastDeployInfo',
            Config.deployInfo.id || 0
        );

        // Now lets load project file
        await this.updateLoadingText('Loading Project File...', 10);
        if (controller.getConfig().settings.useLocalProjectURI)
            await controller.loadObjectURI(
                controller.getConfig().settings.localProject
            );
        else await controller.loadObjectURI();

        controller.onboard = OnBoard({
            dappId: controller.config.default.onboardApiKey,
            networkId: controller.config.default.requiredChainId,
            subscriptions: {
                wallet: async (wallet) => {
                    // Instantiate web3 when the user has selected a wallet
                    this.web3 = new Web3(wallet.provider);
                    this.web3.eth.transactionConfirmationBlocks = 50;
                },
                ens: async (ens) => {
                    // Instantiate web3 when the user has selected a wallet
                    controller.ens = ens;
                }
            },
        });

        // Now lets check wallet
        await this.updateLoadingText('Connecting Web3...', 20);

        if (
            Config.settings.requireWallet ||
            storageController.getGlobalPreference('forceWallet') === true ||
            storageController.getGlobalPreference('requireWallet') === true
        ) {
            storageController.setGlobalPreference('forceWallet', false);
            storageController.getGlobalPreference('requireWallet', false);
            await controller.tryWallet(); // Now lets load our controller
        } else {
            controller.walletError = new Error('Please connect wallet');
        }

        if (controller.isWalletValid) {
            controller.log(
                '[✔️] Wallet Access (primary account is ' +
                    controller.accounts[0] +
                    ')'
            );

            await waitSetState(this, {
                primaryWallet: controller.accounts[0],
                walletValid: true,
                wallets: controller.accounts,
                web3Valid: controller.isWeb3Valid,
            });
        } else {
            controller.log('[❌] Wallet Access');
            storageController.setGlobalPreference('requireWallet', false);
        }

        // Just reload the page for now when you change accounts

        if (!isFirstRun) {
            this.startUpdateCheckInterval();
        }

        if (!isFirstRun && window.ethereum !== undefined) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                try {
                    controller.accounts =
                        await controller.web3.eth.getAccounts();

                    this.setState({
                        primaryWallet: accounts[0],
                        wallets: controller.accounts,
                        web3Valid: controller.isWeb3Valid,
                        walletValid: true,
                    });

                    const lastResult = controller.isAdmin;
                    await this.checkIsAdmin();

                    if (lastResult !== controller.isAdmin) {
                        window.location.reload();
                    }
                } catch (error) {
                    controller.log(error);
                }
            });
        }

        isFirstRun = true;

        this.updateLoadingText('Loading Gas Prices', 40);
        Config.loadGasPrices();

        this.updateLoadingText('Mapping Window Events', 45);
        controller.mapWindowMethods(); // Map window methods for tokenMethod rendering

        this.updateLoadingText('Loading Initial Path Groups...', 50);
        await controller.loadPathGroups(false); // Does not check the checksums initially

        this.updateLoadingText('Loading Mods', 55);

        // Now lets check wallet
        await this.updateLoadingText('Initializing Web3...', 60);
        // Initialize core contracts
        try {
            controller.initializeContracts();
            controller.setupEvents();
            controller.isWeb3Valid = true;
            controller.log('[✔️] Web3 Initialization');
        } catch (error) {
            controller.log('[❌] Web3 Initialization');
            controller.log(error);
            controller.isWeb3Valid = false;
        }

        // Get vars from the smart contract
        if (controller.isWalletValid && controller.isWeb3Valid) {
            if (
                storageController.getGlobalPreference('gasSetting') ===
                    undefined ||
                storageController.getGlobalPreference('gasSetting') === null ||
                storageController.getGlobalPreference('gasSetting').length === 1
            ) {
                storageController.setGlobalPreference('gasSetting', 'medium');
            }

            if (controller.isWeb3Valid && controller.isWalletValid) {
                // Check if admin
                this.updateLoadingText('Checking if admin...', 82);
                await this.checkIsAdmin();
            }

            this.updateLoadingText('Initializing Preload Variables...', 65);
            controller.initializePreload();

            this.updateLoadingText('Loading Contact Variables...', 70);
            await controller.preloadContractVariables();

            this.updateLoadingText('Starting preload interval...', 75);
            controller.startPreloadInterval(); // Then start the preload interval

            // now lets load project file
            await this.updateLoadingText('Reloading Project File...', 80);
            await controller.loadObjectURI();

            // Reload path groups
            this.updateLoadingText('Reloading Path Groups...', 84);
            await controller.loadPathGroups(true); // With checksum check now performed

            storageController.setGlobalPreference('web3Check', false);
        }

        this.updateLoadingText('Firing Gem Initializers', 88);

        try {
            await modController.initializeMods();
        } catch (error) {
            console.log(error);
            console.warn('bad gems no gems will be loaded');
        }

        await this.updateLoadingText('Loading Pages...', 90);
        // TODO: Turn into a method that adds mod pages + overlaps any mods
        await waitSetState(this, {
            mounted: Date.now(),
            web3Valid: controller.isWeb3Valid,
            pages:
                Config.settings.production &&
                controller.isAdmin &&
                !Config.settings.hideUtilitiesForAdmins
                    ? pageController.getPages(false)
                    : pageController.getPages(Config.settings.production),
        });

        this.updateLoadingText('Repoking Resources', 90);
        await resources.load();

        // Load our pages
        this.updateLoadingText('Processing Pages...', 95);
        await this.processPages();

        this.updateLoadingText('Loading complete!', 100);
        this.setState({
            loaded: true,
        });
    }

    async getPages() {}

    async checkIsAdmin() {
        try {
            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMint',
                'isAuthenticated',
                [controller.accounts[0]]
            );
            if (!result) {
                controller.setAdmin(false);
                console.log('[❌] Admin');
            } else {
                controller.setAdmin(true);
                console.log('[✔️] Admin');
            }
        } catch (error) {
            controller.log(error);
            console.log('[❌] Admin');
        }
    }

    async processPages() {
        let Config = controller.getConfig();
        const projectFile = controller.getProjectSettings();
        const pages = this.state.pages
            .filter((page) =>
                page.settings?.requireWallet === true
                    ? controller.isWalletValid
                    : true
            )
            .filter((page) =>
                page.settings?.requireWeb3 === true
                    ? controller.isWeb3Valid
                    : true
            )
            .filter((page) =>
                page.settings?.requireAdmin === true ? controller.isAdmin : true
            )
            .filter((page) =>
                projectFile.mods !== undefined && page.mod !== undefined
                    ? projectFile.mods[page.mod] === true
                    : true
            )
            .filter(
                (page) =>
                    [...Config.hiddenPages].filter((value) => value === page.id)
                        .length === 0
            );

        const dropdown = {
            user: [],
            stickers: [],
            utility: [],
            admin: [],
        };

        const navbar = [];
        const navbarStart = [];
        const navbarEnd = [];

        for (const page of pages) {
            if (page?.settings?.dropdown !== undefined) {
                for (const key of Object.keys(page.settings.dropdown)) {
                    if (dropdown[key] === undefined) {
                        dropdown[key] = [];
                    }

                    let value = page.settings.dropdown[key];

                    if (value.includes('$')) {
                        value = resources.get(value);
                    }

                    dropdown[key].push({ url: page.url, text: value });
                }
            }

            if (page?.settings?.navbar !== undefined) {
                let value = page.settings.navbar;
                if (value.includes('$')) {
                    value = resources.get(value);
                }

                navbar.push({
                    url: page.url,
                    text: value,
                });
            }

            if (page?.settings?.navbarStart !== undefined) {
                let value = page.settings.navbarStart;
                if (value.includes('$')) {
                    value = resources.get(value);
                }

                navbarStart.push({
                    url: page.url,
                    text: value,
                });
            }

            if (page?.settings?.navbarEnd !== undefined) {
                let value = page.settings.navbarEnd;
                if (value.includes('$')) {
                    value = resources.get(value);
                }

                navbarEnd.push({
                    url: page.url,
                    text: value,
                });
            }
        }

        // Remove empty keys
        for (const key of Object.keys(dropdown)) {
            if (dropdown[key].length === 0) {
                delete dropdown[key];
            }
        }

        await waitSetState(this, {
            pages,
            dropdown,
            navbar,
            navbarStart,
            navbarEnd,
        });
    }

    async componentWillUnmount() {
        this.willUnmount = true;

        if (this.loadingInterval !== null) {
            clearInterval(this.loadingInterval);
        }
    }

    render() {
        let Config = controller.getConfig();
        if (!this.state.loaded) {
            return (
                <Container>
                    <Loading
                        loadingReason={this.state.loadingStatusText}
                        showLoadingBar={true}
                        loadingPercentage={this.state.loadingPercentage}
                    />
                </Container>
            );
        }

        if (
            storageController.getGlobalPreference('web3Check') !== true &&
            (!controller.isWalletValid || !controller.isWeb3Valid) &&
            (Config.settings.requireWallet || Config.settings.suggestWallet)
        ) {
            return (
                <>
                    {Config.settings.requireWallet ? (
                        <RequireWallet />
                    ) : (
                        <SuggestWallet />
                    )}
                </>
            );
        }

        const alts = [];

        for (const Page of this.state.pages) {
            if (Page?.settings?.alternatives !== undefined) {
                for (const alt of Page?.settings?.alternatives) {
                    alts[alt] = Page;
                }
            }
        }

        const mapFunc = (Page, key) => {
            const props = {
                path: Page.url,
                exact: true,
            };

            if (Page.exact !== undefined) {
                props.exact = Page.exact;
            }

            const pageProps = {
                isWeb3Valid: controller.isWeb3Valid,
                isAdmin: controller.isAdmin,
                deployer: controller.accounts[0],
            };

            let host = window.location.host;
            host = !storageController.getLocationHref().includes('https://')
                ? 'http://' + host
                : 'https://' + host;

            host += Page.url;

            if (!host.endsWith('/')) {
                host += '/';
            }

            //
            storageController.setPagePreference(
                'hideNavbar',
                Page?.settings?.hide?.navbar === true,
                host
            );
            storageController.setPagePreference(
                'hideFooter',
                Page?.settings?.hide?.footer === true,
                host
            );

            try {
                storageController.setPagePreference(
                    'background',
                    Page?.settings?.background || Config.getBackground(),
                    host
                );
            } catch (error) {
                controller.log(error);
            }

            if (Page.settings?.title !== undefined) {
                storageController.setPagePreference(
                    'title',
                    Page.settings?.title
                );
            }

            // what did she mean by this
            // - Kae, <m@kae.si>
            /**
             * NOTE: THE BACKGROUND IS MANAGED FROM THE NAVBAR!
             */
            storageController.setPagePreference(
                'hideBackground',
                Page?.settings?.hide?.background === true,
                host
            );

            if (props.path.includes(':')) {
                props.exact = true;
                Page = withRouter(Page);
            }

            if (props.exact === false) {
                delete props.exact;
            }

            return (
                <Route {...props} key={key}>
                    <Page {...pageProps} />
                </Route>
            );
        };

        return (
            <>
                <Router>
                    {/* This is added to every page default */}
                    <WebsiteNavbar
                        dropdown={this.state.dropdown}
                        navbar={this.state.navbar}
                        navbarEnd={this.state.navbarEnd}
                        navbarStart={this.state.navbarStart}
                    />

                    <Switch>
                        {this.state.pages.map((Page, key) =>
                            mapFunc(Page, key)
                        )}
                        {Object.keys(alts).map((key, index) => {
                            const Page = alts[key];
                            Page.url = key;
                            return mapFunc(Page, index);
                        })}
                        <Route path="/404" exact>
                            <NotFound />
                        </Route>
                        <Route path="*">
                            <NotFound />
                        </Route>
                    </Switch>

                    {/** Global Modals */}
                </Router>
                <LoadingModal />
                <UpdateModal show={this.state.showUpdateModal} />
            </>
        );
    }
}

export default MainComponent;
