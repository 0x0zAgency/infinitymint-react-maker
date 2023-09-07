import React, { useEffect, useState, useRef } from 'react';
import {
    Button,
    Card,
    Container,
    Stack,
    Row,
    Col,
    Alert,
} from 'react-bootstrap';
import modController from 'infinitymint-client/dist/src/classic/modController';
import storageController from 'infinitymint-client/dist/src/classic/storageController';
import TempProjectModal from '../../Modals/TempProjectModal';
import GemInfoModal from '../../Modals/GemInfoModal';
import { createNewTempProject } from '../../helpers';
import Loading from '../../Components/Loading';
import controller from 'infinitymint-client/dist/src/classic/controller';

function Gems() {
    const [showTempProjectModal, setShowTempProjectModal] = useState(false);
    const [hasTempProject, setHasTempProject] = useState({});
    const [tempProject, setTempProject] = useState({});
    const [loading, setLoading] = useState(false);
    const saveData = (_tempProject) => {
        setLoading(true);
        storageController.setGlobalPreference('_projects', {
            ...(storageController.getGlobalPreference('_projects') || {}),
            [storageController.getGlobalPreference('tempProject')]: {
                ..._tempProject,
            },
        });
        storageController.saveData();
        setLoading(false);
    };

    useEffect(() => {
        if (storageController.getGlobalPreference('tempProject')) {
            setHasTempProject(true);
            setTempProject(
                storageController.getGlobalPreference('_projects')[
                    storageController.getGlobalPreference('tempProject')
                ]
            );
        } else {
            setHasTempProject(false);
        }
    }, []);

    const [showGemInfoModal, setShowGemInfoModal] = useState(false);
    const mod = useRef({});
    const project = controller.getProjectSettings();

    return (
        <>
            {loading ? (
                <Container>
                    <Loading />
                </Container>
            ) : (
                <Container>
                    <h1 className="mt-4 text-center display-5 force-white">💎 Gems</h1>
                    <Alert variant="success">
                        Gems are how you can upgrade your tokens and project. You can add gems
                        to your project by clicking the "Add Gem" button below.
                        You can also remove gems from your project by clicking
                        the "Remove Gem" button below.
                    </Alert>
                    <Row>
                        <Col>
                            <Card body>
                                <Alert
                                    variant={
                                        hasTempProject ? 'success' : 'danger'
                                    }
                                >
                                    {hasTempProject ? (
                                        <>
                                            <Alert.Heading>
                                                {storageController.getGlobalPreference(
                                                    'tempProject'
                                                )}
                                            </Alert.Heading>
                                            <p>
                                                Changes are being made to your
                                                temporary project. When you are
                                                done, you can save it as a new
                                                project{' '}
                                                <a href="/admin/project/">
                                                    here!
                                                </a>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Alert.Heading>
                                                No Temp Project
                                            </Alert.Heading>
                                            <p>
                                                You do not have a temp project
                                                set. You will need to set one in
                                                order to make changes.
                                            </p>
                                        </>
                                    )}
                                </Alert>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant={
                                            hasTempProject
                                                ? 'secondary'
                                                : 'success'
                                        }
                                        onClick={() => {
                                            setShowTempProjectModal(true);
                                        }}
                                    >
                                        Set Temp Project
                                    </Button>
                                    <Button
                                        variant="danger"
                                        hidden={!hasTempProject}
                                        onClick={() => {
                                            storageController.setGlobalPreference(
                                                'tempProject',
                                                null
                                            );
                                            storageController.saveData();
                                            window.location.reload();
                                        }}
                                    >
                                        Clear Temp Project
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        <Col lg={8}>
                            {Object.keys(
                                modController?.modManifest?.mods || {}
                            ).map((key, index) => {
                                let value =
                                    modController.modManifest?.mods[key];

                                return (
                                    <Card
                                        body
                                        className={index !== 0 ? 'mt-2' : ''}
                                        key={index}
                                    >
                                        <h2 className='text-primary'>
                                            {key}{' '}
                                            <span className="badge bg-dark fs-6">
                                                {typeof value?.manifest?.author === 'object'
                                                    ? Object.values(
                                                          value?.manifest
                                                              ?.author
                                                      ).join(', ')
                                                    : value?.manifest?.author ||
                                                      'Unknown'}
                                            </span>
                                        </h2>
                                        <hr/>
                                        <p className='text-white'>
                                            {value.manifest?.description ||
                                                'No description available...'}
                                        </p>
                                        <div className="d-grid gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    mod.current = {
                                                        ...value,
                                                        ...project.deployedMods[
                                                            key
                                                        ],
                                                        pages: modController
                                                            .modPages[key],
                                                    };
                                                    setShowGemInfoModal(
                                                        !showGemInfoModal
                                                    );
                                                }}
                                            >
                                                Inspect
                                            </Button>
                                            <Button
                                                hidden={modController.isModEnabled(
                                                    key
                                                )}
                                                disabled={!hasTempProject}
                                                variant="success"
                                                onClick={() => {}}
                                            >
                                                Enable
                                            </Button>
                                            <Button
                                                hidden={
                                                    !modController.isModEnabled(
                                                        key
                                                    )
                                                }
                                                variant="danger"
                                                disabled={!hasTempProject}
                                                onClick={() => {}}
                                            >
                                                Disable
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </Col>
                    </Row>
                </Container>
            )}
            <br />
            <br />
            <br />
            <TempProjectModal
                show={showTempProjectModal}
                onHide={() => {
                    setShowTempProjectModal(!showTempProjectModal);
                }}
                onSetTempProject={(projectName) => {
                    let temp = createNewTempProject(projectName);
                    setTempProject(temp);
                    saveData(temp);
                    setHasTempProject(true);
                    setShowTempProjectModal(false);
                }}
            />
            <GemInfoModal
                show={showGemInfoModal}
                onHide={() => {
                    setShowGemInfoModal(!showGemInfoModal);
                }}
                mod={mod.current}
            />
        </>
    );
}

Gems.url = '/admin/gems';
Gems.id = 'Gems';
Gems.settings = {
    requireAdmin: true,
    dropdown: {
        admin: '$.UI.Navbar.AdminGems',
    },
};

export default Gems;
