/**
 * @type {import('infinitymint/dist/app/interfaces').InfinityMintProject}
 */
const example = {
    name: 'example',
    price: '$1',
    modules: {
        random: 'SeededRandom',
        assets: 'SimpleSVG',
        minter: 'DefaultMinter',
        royalty: 'DefaultRoyalty',
    },
    information: {
        tokenSymbol: '†',
        tokenSingular: 'Example',
    },
    permissions: {
        all: [],
    },
    assets: [],
    paths: [
        {
            name: 'Example Token',
            fileName: '/imports/East Kazoo.svg',
        },
    ],
    events: {},
    newStandard: true,
};
module.exports = example;
