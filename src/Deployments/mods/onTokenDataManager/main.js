import controller from 'infinitymint-client/dist/src/classic/controller';

const ContentLinks = {
    onLink: async (link) => {},
     /**
     *
     * @param {Controller} param0
     */
     initialize: async () => {
        let deployment = controller.getConfig().getDeployment('onTokenDataManager');
        controller.initializeContract(deployment.address, 'onTokenDataManager', true);
    },
};

export default ContentLinks;
