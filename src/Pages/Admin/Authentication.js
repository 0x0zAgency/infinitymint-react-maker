import controller from 'infinitymint-client/dist/src/classic/controller';
import storageController from 'infinitymint-client/dist/src/classic/storageController';
import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    ListGroup,
    Alert,
} from 'react-bootstrap';
import { call, cutLongString, send } from '../../helpers';

function Authentication() {
    const project = controller.getProject();
    const [selected, setSelected] = useState(null);
    const [hasAuthentication, setHasAuthentication] = useState(false);
    const [checkedAddresses, setCheckedAddresses] = useState({});

    useEffect(() => {
        if (storageController.getGlobalPreference('checkedAddresses'))
            setCheckedAddresses(
                storageController.getGlobalPreference('checkedAddresses')
            );
    }, []);

    const approveAll = async () => {
        let multiApprove = Object.keys(checkedAddresses[selected]).filter(
            (key) => checkedAddresses[selected][key] === false
        );

        if (multiApprove.length === 0) return;

        await send(selected, 'multiApprove', [multiApprove]);
        let copy = { ...checkedAddresses };
        multiApprove.forEach((address) => {
            copy[selected][address] = true;
        });
        setCheckedAddresses(copy);
        storageController.setGlobalPreference('checkedAddresses', copy);
        storageController.saveData();
    };

    const revokeAll = async () => {
        let multiApprove = Object.keys(checkedAddresses[selected]).filter(
            (key) => checkedAddresses[selected][key] === true
        );

        if (multiApprove.length === 0) return;
        if (multiApprove.length === 1 && multiApprove[0] === project.deployer)
            return;

        let copy = { ...checkedAddresses };
        for (let i = 0; i < multiApprove.length; i++) {
            await send(selected, 'setPrivilages', [multiApprove[i], false]);
            copy[selected][multiApprove[i]] = false;
            setCheckedAddresses(copy);
        }
        setCheckedAddresses(copy);
        storageController.setGlobalPreference('checkedAddresses', copy);
        storageController.saveData();
    };

    const checkAll = async () => {
        console.log(selected);
        if (selected === null || !project?.contracts[selected]) return;
        let addresses = [...project.approved];

        let checks = {};
        for (let i = 0; i < addresses.length; i++) {
            let address = addresses[i];
            let result = await call(selected, 'isAuthenticated', [address]);

            checks[address] = result;
        }

        let newCheckedAddresses = {
            ...checkedAddresses,
            [selected]: checks,
        };
        setCheckedAddresses(newCheckedAddresses);
        storageController.setGlobalPreference(
            'checkedAddresses',
            newCheckedAddresses
        );
        storageController.saveData();
    };

    return (
        <>
            <Container>
            <Row>
            <Col className="text-center">
                <h1 className="mt-4 display-5 force-white">
                    🧑🏼‍✈️ The Authentication System
                </h1>
            </Col>
                <Alert variant="success">
                    The authentication system is a way to verify an address to
                    have admin privilages with the contract. Approved addresses
                    are able to execution methods on the smart contract that
                    normal users cannot. Be careful who you approve and who you
                    approve to what contract.
                </Alert>
                {controller.accounts[0] !== project.deployer && (
                    <>
                        <Alert variant="danger">
                            You are not the deployer of this project. You cannot
                            approve addresses.
                        </Alert>
                    </>
                )}
                </Row>
                <Row className="mt-2">
                    <Col>
                        <Card bg='black' body>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={selected === null}
                                    onClick={async () => {
                                        await checkAll();
                                    }}
                                >
                                    Check All
                                </Button>
                                <Button
                                    disabled={
                                        selected === null ||
                                        !project.contracts[selected] ||
                                        !checkedAddresses[selected] ||
                                        controller.accounts[0] !==
                                            project.deployer
                                    }
                                    variant="success"
                                    onClick={async () => {
                                        await approveAll();
                                    }}
                                >
                                    Approve All
                                </Button>
                                <Button
                                    disabled={
                                        selected === null ||
                                        !project.contracts[selected] ||
                                        !checkedAddresses[selected] ||
                                        controller.accounts[0] !==
                                            project.deployer
                                    }
                                    variant="danger"
                                    onClick={async () => {
                                        await revokeAll();
                                    }}
                                >
                                    Revoke All
                                </Button>
                            </div>
                        </Card>
                        <Card bg='black' body className="mt-2">
                            <div className="d-grid gap-2">
                                {Object.keys(project?.contracts || {}).map(
                                    (contract) => {
                                        return (
                                            <Button
                                                variant={
                                                    selected === contract
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                                onClick={async () => {
                                                    setSelected(contract);
                                                    try {
                                                        let result = await call(
                                                            contract,
                                                            'isAuthenticated',
                                                            [project.deployer]
                                                        );

                                                        if (result === null)
                                                            throw new Error(
                                                                'does not implement Authenticated'
                                                            );

                                                        setHasAuthentication(
                                                            true
                                                        );
                                                    } catch (error) {
                                                        console.error(error);
                                                        setHasAuthentication(
                                                            false
                                                        );
                                                    }
                                                }}
                                            >
                                                {contract} <br />
                                                <span className="badge bg-dark">
                                                    {cutLongString(
                                                        project.contracts[
                                                            contract
                                                        ],
                                                        18
                                                    )}
                                                </span>
                                                <br />
                                                {checkedAddresses[contract] ? (
                                                    <span className="text-success">
                                                        ✅
                                                    </span>
                                                ) : (
                                                    <span className="text-danger">
                                                        ❌
                                                    </span>
                                                )}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>
                        </Card>
                    </Col>
                    <Col xl={8}>
                        <Card bg='black' body>
                            <p className="display-5">
                                {selected === null
                                    ? 'Select a contract'
                                    : selected}
                            </p>
                            {hasAuthentication && selected !== null ? (
                                <>
                                    {selected === 'InfinityMintStorage' ||
                                    selected === 'InfinityMintLinker' ? (
                                        <Alert
                                            variant="danger"
                                            className="text-center"
                                        >
                                            <span className="display-2">
                                                ⚠️
                                            </span>
                                            <br />
                                            <u>{selected}</u> is a protected
                                            controller. It is the contract that
                                            could allow an attacker to take
                                            control of the InfinityMint project.
                                            It is recommended that you do not
                                            approve any addresses to this
                                            contract other than contracts which
                                            require it to function.
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                    <p>
                                        <b>Destination:</b>{' '}
                                        {project.contracts[selected]}
                                        <br />
                                        <b>Deployer:</b> {project.deployer}
                                    </p>
                                    <div className="d-grid mt-2 gap-2">
                                        <Button variant="secondary">
                                            Add Address
                                        </Button>
                                        <Button
                                            hidden={checkedAddresses[selected]}
                                            variant="success"
                                            disabled={selected === null}
                                            onClick={async () => {
                                                await checkAll();
                                            }}
                                        >
                                            Check All
                                        </Button>
                                    </div>
                                    <ListGroup className="mt-2">
                                        {[...(project.approved || [])].map(
                                            (address) => {
                                                return (
                                                    <ListGroup.Item>
                                                        {address}{' '}
                                                        {address ===
                                                        project.deployer ? (
                                                            <span className="badge bg-success">
                                                                Deployer
                                                            </span>
                                                        ) : (
                                                            ''
                                                        )}
                                                        {checkedAddresses[
                                                            selected
                                                        ] &&
                                                        checkedAddresses[
                                                            selected
                                                        ][address] ? (
                                                            <>
                                                                <br />
                                                                <Button
                                                                    className="mt-2"
                                                                    variant="danger"
                                                                    disabled={
                                                                        controller
                                                                            .accounts[0] !==
                                                                            project.deployer ||
                                                                        address ===
                                                                            project.deployer
                                                                    }
                                                                    onClick={async () => {
                                                                        await send(
                                                                            selected,
                                                                            'setPrivilages',
                                                                            [
                                                                                address,
                                                                                false,
                                                                            ]
                                                                        );

                                                                        let checkedAddress =
                                                                            {
                                                                                ...checkedAddresses[
                                                                                    selected
                                                                                ],
                                                                                [address]: false,
                                                                            };

                                                                        let newCheckedAddresses =
                                                                            {
                                                                                ...checkedAddresses,
                                                                                [selected]:
                                                                                    checkedAddress,
                                                                            };
                                                                        setCheckedAddresses(
                                                                            newCheckedAddresses
                                                                        );
                                                                        storageController.setGlobalPreference(
                                                                            'checkedAddresses',
                                                                            newCheckedAddresses
                                                                        );
                                                                        storageController.saveData();
                                                                    }}
                                                                >
                                                                    Revoke
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {checkedAddresses[
                                                                    selected
                                                                ] ===
                                                                    undefined ||
                                                                checkedAddresses[
                                                                    selected
                                                                ][address] ===
                                                                    undefined ? (
                                                                    <>
                                                                        <br />
                                                                        <Button
                                                                            className="mt-2"
                                                                            variant="success"
                                                                            onClick={async () => {
                                                                                let result =
                                                                                    await call(
                                                                                        selected,
                                                                                        'isAuthenticated',
                                                                                        [
                                                                                            address,
                                                                                        ]
                                                                                    );

                                                                                let checkedAddress =
                                                                                    {
                                                                                        ...checkedAddresses[
                                                                                            selected
                                                                                        ],
                                                                                        [address]:
                                                                                            result,
                                                                                    };
                                                                                setCheckedAddresses(
                                                                                    {
                                                                                        ...checkedAddresses,
                                                                                        [selected]:
                                                                                            checkedAddress,
                                                                                    }
                                                                                );
                                                                                storageController.setGlobalPreference(
                                                                                    'checkedAddresses',
                                                                                    checkedAddresses
                                                                                );
                                                                                storageController.saveData();
                                                                            }}
                                                                        >
                                                                            Check
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <br />
                                                                        <Button
                                                                            className="mt-2"
                                                                            variant="success"
                                                                            disabled={
                                                                                controller
                                                                                    .accounts[0] !==
                                                                                project.deployer
                                                                            }
                                                                            onClick={async () => {
                                                                                await send(
                                                                                    selected,
                                                                                    'setPrivilages',
                                                                                    [
                                                                                        address,
                                                                                        true,
                                                                                    ]
                                                                                );

                                                                                let checkedAddress =
                                                                                    {
                                                                                        ...checkedAddresses[
                                                                                            selected
                                                                                        ],
                                                                                        [address]: true,
                                                                                    };

                                                                                let newCheckedAddresses =
                                                                                    {
                                                                                        ...checkedAddresses,
                                                                                        [selected]:
                                                                                            checkedAddress,
                                                                                    };
                                                                                setCheckedAddresses(
                                                                                    newCheckedAddresses
                                                                                );
                                                                                storageController.setGlobalPreference(
                                                                                    'checkedAddresses',
                                                                                    newCheckedAddresses
                                                                                );
                                                                                storageController.saveData();
                                                                            }}
                                                                        >
                                                                            Approve
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </ListGroup.Item>
                                                );
                                            }
                                        )}
                                    </ListGroup>
                                </>
                            ) : (
                                <>
                                    {!hasAuthentication && selected !== null ? (
                                        <>
                                            <Alert variant="danger">
                                                The contract you have selected
                                                does not have the authentication
                                                system implemented. You can
                                                implement it by adding the
                                                following code to the contract:
                                            </Alert>
                                            <div className="d-grid p-2 bg-black text-white">
                                                <pre>
                                                    <code>
                                                        {`
import "https://raw.githubusercontent.com/0x0zAgency/infinitymint-beta/master/alpha/Authentication.sol";
            
contract ${selected} is Authentication {
    // ...
}`}
                                                    </code>
                                                </pre>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Alert variant="danger">
                                                Please select a contract
                                            </Alert>
                                        </>
                                    )}
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
            <br />
            <br />
            <br />
        </>
    );
}

Authentication.url = '/admin/authentication';
Authentication.id = 'AdminAuthentication';
Authentication.settings = {
    requireAdmin: true,
    dropdown: {
        admin: '$.UI.Navbar.AdminAuthentication',
    },
};

export default Authentication;
