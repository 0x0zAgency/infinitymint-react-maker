import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    Button,
    ListGroup,
} from 'react-bootstrap';
import TempProjectModal from '../../Modals/TempProjectModal';
import controller from 'infinitymint-client/dist/src/classic/controller';
import { call, send } from '../../helpers';
import Loading from '../../Components/Loading';
import UpdateProjectModal from '../../Modals/UpdateProjectModal';
import ipfsController from 'infinitymint-client/dist/src/classic/ipfs/web3Storage';
import storageController from 'infinitymint-client/dist/src/classic/storageController';

function UpdateProject() {
    const [project, setProject] = useState(controller.getProject());
    const [showCurrentProjects, setShowCurrentProjects] = useState(true);
    const [showUpdateProjectModal, setShowUpdateProjectModal] = useState(false);
    const [hasPrivilages, setHasPrivilages] = useState(false);
    const [versions, setVersions] = useState({});
    const [loading, setLoading] = useState(false);

    const getBlockchainVersions = async () => {
        setLoading(true);
        let result = await call('InfinityMintProject', 'getUpdates');
        let currentVersion = await call(
            'InfinityMintProject',
            'getCurrentVersion'
        );
        let currentTag = await call('InfinityMintProject', 'getCurrentTag');

        setVersions({
            currentVersion: parseInt(currentVersion.toString()),
            currentTag: controller.web3.utils.toAscii(currentTag),
            versions: result.map((version) =>
                controller.web3.eth.abi.decodeParameters(
                    ['address', 'uint256', 'uint256', 'uint256'],
                    version
                )
            ),
        });
        setLoading(false);
    };

    useEffect(() => {
        getBlockchainVersions();
        (async () => {
            setHasPrivilages(
                await call('InfinityMintProject', 'isAuthenticated', [
                    controller.accounts[0],
                ])
            );
        })();
    }, []);

    return (
        <>
            {loading ? (
                <Container>
                    <Loading />
                </Container>
            ) : (
                <Container>
                    <h1 className="mt-4 text-center display-5 force-white">💎 Update Project</h1>
                    <Alert variant="success">
                        Here you can view all of your temporary projects and
                        update the current project/app. Please note that updates
                        might take a while to show up on the website.
                    </Alert>
                    <Row>
                        <Col>
                            <Card body>
                                <div className="d-grid gap-2">
                                    <Alert
                                        variant="danger"
                                        hidden={hasPrivilages}
                                    >
                                        You are approved with the InfinityMint
                                        project contract and there for cannot
                                        update the project.
                                    </Alert>
                                    <Button
                                        variant={
                                            showCurrentProjects
                                                ? 'success'
                                                : 'secondary'
                                        }
                                        onClick={() => {
                                            setShowUpdateProjectModal(false);
                                            setShowCurrentProjects(true);
                                        }}
                                    >
                                        Current InfinityMint Projects
                                    </Button>
                                    <Button
                                        disabled={!hasPrivilages}
                                        variant={
                                            showUpdateProjectModal
                                                ? 'success'
                                                : 'warning'
                                        }
                                        onClick={() => {
                                            setShowCurrentProjects(false);
                                            setShowUpdateProjectModal(true);
                                        }}
                                    >
                                        Update Project
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        {showCurrentProjects ? (
                            <Col lg={8}>
                                <Card body>
                                    <Row>
                                        <Col>
                                            <ListGroup>
                                                {(versions?.versions || []).map(
                                                    (version, index) => (
                                                        <ListGroup.Item
                                                            key={index}
                                                            variant={
                                                                index ===
                                                                versions?.currentVersion
                                                                    ? 'success'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            <p className="fs-4">
                                                                <b>
                                                                    Version{' '}
                                                                    {index}{' '}
                                                                </b>
                                                                <span
                                                                    className="badge bg-dark text-white"
                                                                    style={{
                                                                        float: 'right',
                                                                        fontSize:
                                                                            '1rem',
                                                                    }}
                                                                >
                                                                    {new Date(
                                                                        version[1] *
                                                                            1000
                                                                    ).toString()}
                                                                </span>
                                                                <br />
                                                                <span className="fs-5">
                                                                    
                                                                    <span className="badge bg-success fs-6">
                                                                        Updated By {version[0]}{' '}
                                                                    </span>
                                                                </span>
                                                            </p>
                                                            <Alert
                                                                variant="success"
                                                                hidden={
                                                                    index !==
                                                                    versions?.currentVersion
                                                                }
                                                                className="text-black"
                                                            >
                                                                This is the
                                                                current project!
                                                            </Alert>
                                                            <Button
                                                                variant="warning"
                                                                disabled={
                                                                    index ===
                                                                        versions?.currentVersion ||
                                                                    !hasPrivilages
                                                                }
                                                                onClick={() => {}}
                                                            >
                                                                Use This Project
                                                            </Button>
                                                        </ListGroup.Item>
                                                    )
                                                )}
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ) : (
                            <Col lg={8}>
                                <Card body>
                                    <Alert>
                                        InfinityMint is currently in beta and is
                                        a work in progress. Please be aware that
                                        this feature is experimental and may not
                                        work as expected.
                                    </Alert>
                                    <img
                                        src={controller
                                            .getConfig()
                                            .getImage('noImage')}
                                        alt="No"
                                        className="img-fluid"
                                    />
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Container>
            )}
            <UpdateProjectModal
                show={showUpdateProjectModal}
                setCurrentProject={async (projectKey, tempProject) => {
                    let newVersion = versions?.currentVersion + 1;
                    let newTag =
                        'version_' + parseInt(versions?.currentVersion) + 1;

                    ipfsController.createInstance(
                        storageController.getGlobalPreference(
                            'web3StorageApiKey'
                        )
                    );

                    tempProject.updated = Date.now();
                    tempProject.version = newVersion;
                    tempProject.tag = newTag;

                    let cid = await ipfsController.uploadFile(
                        'project.json',
                        JSON.stringify(tempProject)
                    );
                    //set it on chain
                    await send('InfinityMintProject', 'updateProject', [
                        controller.web3.utils.fromAscii(
                            'https://w3s.link/ipfs/' + cid + '/project.json'
                        ),
                        controller.web3.utils.fromAscii(newTag),
                        true,
                    ]);
                    setVersions({
                        currentVersion: newVersion,
                        currentTag: newTag,
                        versions: [
                            ...versions.versions,
                            [
                                controller.accounts[0],
                                Math.floor(Date.now() / 1000),
                                newVersion,
                                newTag,
                            ],
                        ],
                    });
                    setShowUpdateProjectModal(false);
                }}
                onHide={() => {
                    setShowUpdateProjectModal(false);
                }}
            />
            <br />
            <br />
            <br />
        </>
    );
}

UpdateProject.url = '/admin/update';
UpdateProject.id = 'UpdateProject';
UpdateProject.settings = {
    requireAdmin: true,
    dropdown: {
        admin: '$.UI.Navbar.AdminUpdate',
    },
};

export default UpdateProject;
