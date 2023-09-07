import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tinySVG from 'tinysvg-js';
import { Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { waitSetState } from '../../helpers.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

class ApperanceEditor extends Component {
    /**
     * Needs to take the code from Overview and put it into stickerEditor
     * Since most components will probably need the same things there
     * @returns
     */

    constructor(props) {
        super(props);

        this.state = {
            stickerMap: [],
            stickerGroups: [],
            mapSize: 0,
            validMap: false,
            error: '',
        };
    }

    /**
     * This effectively works out the sizes of all of the paths/groups individually so
     * you can see a detailed breakdown of sizes in kb of each element in the SVG
     */
    async componentDidMount() {
        if (this.props.isValid && this.props.validApperance) {
            try {
                const result = Object.values(
                    tinySVG.readTinySVG(this.props.sticker.paths)
                );
                if (result.length === 0) {
                    throw new Error('Stickermap is invalid');
                }

                // Count groups and put groups aside so we can edit/select groups and
                // keep track of groups
                let count = 0;
                let group = -1;
                const groups = [];
                let groupStack = -1;

                for (const [index, value] of result.entries()) {
                    if (tinySVG.isColourTag(value.tag)) {
                        result[index].colour =
                            count > this.props.sticker.colours.length
                                ? 'none'
                                : this.props.sticker.colours[count];
                        count++;
                    }

                    result[index].index = index;

                    if (value.tag === 'g' && value.startTag) {
                        groups[++group] = [];
                        result[index].group = group;
                        ++groupStack;
                        if (groupStack > 0) {
                            groups[groupStack - 1].push(value);
                        }
                    }

                    if (value.tag !== 'g' && group >= 0) {
                        groups[group].push(value);
                        result[index].group = group;
                    }

                    if (value.tag === 'g' && value.endTag) {
                        result[index].group = group;
                        groupStack--;
                    }

                    // Calculate the size of this group
                    result[index].size = (
                        new Blob([JSON.stringify(result[index])]).size / 1024
                    ).toFixed(2);
                }

                await waitSetState(this, {
                    stickerMap: result,
                    stickerGroups: groups,
                    mapSize: (
                        new Blob([JSON.stringify(result)]).size / 1024
                    ).toFixed(2),
                    validMap: true,
                });
            } catch (error) {
                this.setState({
                    error: error.message || error,
                    validMap: false,
                });
                controller.log('[😞] Apperance Error', 'error');
                controller.log(error);
            }
        }
    }

    getBorderFromTag(tag) {
        switch (tag) {
            case 'p': {
                return 'border border-dark';
            }

            case 'h': {
                return 'border border-success';
            }

            case 'g': {
                return 'border border-primary';
            }

            default: {
                return 'border';
            }
        }
    }

    render() {
        let tab = 0;
        let increaseNext = false;
        return (
            <>
                {this.props.isValid && this.props.validApperance ? (
                    <Row className="mt-4">
                        <Col lg={6}>
                            <Card body bg="black">
                                <p className="fs-2">
                                    🗺️ Map{' '}
                                    <span
                                        className="ms-1 badge bg-dark"
                                        style={{ fontSize: '1.25vh' }}
                                    >
                                        {this.state.stickerMap.length} members
                                    </span>{' '}
                                    <span
                                        className="badge bg-light"
                                        style={{ fontSize: '1.25vh' }}
                                    >
                                        {this.state.stickerGroups.length === 1
                                            ? '1 group'
                                            : `${this.state.stickerGroups.length} groups`}{' '}
                                    </span>{' '}
                                    <span
                                        className="badge bg-light"
                                        style={{ fontSize: '1.25vh' }}
                                    >
                                        {this.state.mapSize}kb uncompressed
                                    </span>
                                </p>
                                <hr />
                                {!this.state.validMap ? (
                                    <div className="d-grid">
                                        <Alert variant="danger">
                                            You are not using a vector so you
                                            cannot edit the map.
                                        </Alert>
                                    </div>
                                ) : (
                                    this.state.stickerMap.map(
                                        (value, index) => {
                                            if (increaseNext) {
                                                tab++;
                                                increaseNext = false;
                                            }

                                            if (value.startTag === true) {
                                                increaseNext = true;
                                            }

                                            if (value.endTag === true) {
                                                tab--;
                                            }

                                            return (
                                                <>
                                                    <Row className="gy-2">
                                                        <Col sm={9}>
                                                            <div
                                                                className={
                                                                    'd-grid mt-1 ps-1 pt-2 ' +
                                                                    this.getBorderFromTag(
                                                                        value.tag
                                                                    ) +
                                                                    ` map-group-${
                                                                        value.group ||
                                                                        'none'
                                                                    } tag-${value.tag.toLowerCase()}`
                                                                }
                                                                id={`mapPath${index}`}
                                                                style={{
                                                                    marginLeft:
                                                                        8 * tab,
                                                                }}
                                                            >
                                                                <p className="fs-6">
                                                                    {/** Index Badge */}
                                                                    <span className="badge">
                                                                        {index}
                                                                    </span>{' '}
                                                                    {/** Tag Name */}
                                                                    {value.tag}{' '}
                                                                    {/** Colour Print out */}
                                                                    <span className="badge">
                                                                        {value.colour ===
                                                                            'none' ||
                                                                        value.colour ===
                                                                            'random' ||
                                                                        value.colour ===
                                                                            undefined ||
                                                                        value.colour ===
                                                                            null
                                                                            ? value.colour ||
                                                                              ''
                                                                            : tinySVG.toHexFromDecimal(
                                                                                  value.colour
                                                                              )}
                                                                    </span>{' '}
                                                                    {/** Colour Visual */}
                                                                    <span
                                                                        className="badge"
                                                                        style={{
                                                                            backgroundColor:
                                                                                value.colour ===
                                                                                    'none' ||
                                                                                value.colour ===
                                                                                    'random'
                                                                                    ? ''
                                                                                    : tinySVG.toHexFromDecimal(
                                                                                          value.colour
                                                                                      ),
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                    </span>
                                                                    {/** Group Start Badge */}
                                                                    {value.startTag &&
                                                                    value.endTag !==
                                                                        true ? (
                                                                        <>
                                                                            <span className="ms-1 badge bg-success">
                                                                                Start
                                                                            </span>
                                                                            <span className="badge ms-1 bg-dark">
                                                                                {value.tag ===
                                                                                    'g' &&
                                                                                value.group !==
                                                                                    undefined &&
                                                                                this
                                                                                    .state
                                                                                    .stickerGroups[
                                                                                    value
                                                                                        .group
                                                                                ] !==
                                                                                    undefined
                                                                                    ? /** I'm so sorry about this my code prettier literally took a SHIT */
                                                                                      (
                                                                                          new Blob(
                                                                                              [
                                                                                                  JSON.stringify(
                                                                                                      this
                                                                                                          .state
                                                                                                          .stickerGroups[
                                                                                                          value
                                                                                                              .group
                                                                                                      ]
                                                                                                  ),
                                                                                              ]
                                                                                          )
                                                                                              .size /
                                                                                          1024
                                                                                      ).toFixed(
                                                                                          2
                                                                                      )
                                                                                    : '0'}
                                                                                {value.tag !==
                                                                                    'g' &&
                                                                                value.size !==
                                                                                    undefined
                                                                                    ? value.size
                                                                                    : '0'}
                                                                                kb
                                                                            </span>
                                                                            {value.tag ===
                                                                            'g' ? (
                                                                                <span
                                                                                    className="ms-1 badge bg-dark"
                                                                                    hidden={
                                                                                        value.group ===
                                                                                        undefined
                                                                                    }
                                                                                >
                                                                                    Group
                                                                                    #
                                                                                    {
                                                                                        value.group
                                                                                    }
                                                                                </span>
                                                                            ) : (
                                                                                ''
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    {/** End Badge */}
                                                                    {value.endTag &&
                                                                    value.startTag !==
                                                                        true ? (
                                                                        <>
                                                                            <span className="ms-1 badge bg-warning">
                                                                                End
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    {/** Self Closing Badge */}
                                                                    {value.endTag &&
                                                                    value.startTag ? (
                                                                        <span className="ms-1 badge bg-light">
                                                                            Self
                                                                            Closing
                                                                        </span>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    {/** Children Badge */}
                                                                    {value.tag !==
                                                                        'h' &&
                                                                    value.startTag ? (
                                                                        <span className="ms-1 badge bg-light">
                                                                            {value.group !==
                                                                                undefined &&
                                                                            this
                                                                                .state
                                                                                .stickerGroups[
                                                                                value
                                                                                    .group
                                                                            ] !==
                                                                                undefined
                                                                                ? this
                                                                                      .state
                                                                                      .stickerGroups[
                                                                                      value
                                                                                          .group
                                                                                  ]
                                                                                      .length ===
                                                                                  1
                                                                                    ? '1 Child'
                                                                                    : this
                                                                                          .state
                                                                                          .stickerGroups[
                                                                                          value
                                                                                              .group
                                                                                      ]
                                                                                          .length +
                                                                                      ' Children'
                                                                                : '0 Children'}{' '}
                                                                        </span>
                                                                    ) : (
                                                                        <> </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </Col>
                                                        <Col
                                                            sm={3}
                                                            className="p-2 pt-3"
                                                        >
                                                            <div className="d-grid gap-1 d-sm-flex justify-content-sm-start">
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    hidden={
                                                                        value.tag ===
                                                                            'h' ||
                                                                        value.endTag
                                                                    }
                                                                >
                                                                    {
                                                                        resources
                                                                            .$
                                                                            .UI
                                                                            .Symbols
                                                                            .Delete
                                                                    }
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    hidden={
                                                                        value.endTag
                                                                    }
                                                                >
                                                                    {
                                                                        resources
                                                                            .$
                                                                            .UI
                                                                            .Symbols
                                                                            .View
                                                                    }
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    hidden={
                                                                        !tinySVG.isColourTag(
                                                                            value.tag
                                                                        ) ||
                                                                        value.endTag
                                                                    }
                                                                >
                                                                    {
                                                                        resources
                                                                            .$
                                                                            .UI
                                                                            .Symbols
                                                                            .Colours
                                                                    }
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row className="gy-2">
                                                        <Col>
                                                            {value.endTag ? (
                                                                <>
                                                                    {value.tag ===
                                                                    'h' ? (
                                                                        <p className="mt-4 text-center">
                                                                            End
                                                                            Of
                                                                            Map
                                                                            <br />
                                                                            <span className="badge bg-success">
                                                                                Total
                                                                                Size
                                                                                After
                                                                                Compression:{' '}
                                                                                {this
                                                                                    .props
                                                                                    .assets
                                                                                    .svg !==
                                                                                    undefined &&
                                                                                this
                                                                                    .props
                                                                                    .assets
                                                                                    .svg
                                                                                    .length >
                                                                                    0
                                                                                    ? [
                                                                                          ...this
                                                                                              .props
                                                                                              .assets
                                                                                              .svg,
                                                                                      ].pop()
                                                                                    : 0}
                                                                                kb
                                                                            </span>
                                                                        </p>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    <hr
                                                                        className="p-0 m-2"
                                                                        style={{
                                                                            marginLeft:
                                                                                6 *
                                                                                tab,
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </>
                                            );
                                        }
                                    )
                                )}
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <Row className="mt-4">
                        <Col>
                            <div className="d-grid gap-2">
                                <Alert variant="danger" className="text-center">
                                    <p className="display-4">😀</p>
                                    <p>
                                        You need to set the apperance of your
                                        sticker if you would like to preview it!
                                    </p>
                                </Alert>
                                <Button
                                    variant="light"
                                    onClick={() => {
                                        this.props.setSection('overview');
                                    }}
                                >
                                    {resources.$.UI.Action.Overview}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}
            </>
        );
    }
}

ApperanceEditor.propTypes = {
    isValid: PropTypes.bool,
    validApperance: PropTypes.bool,
    sticker: PropTypes.object,
    assets: PropTypes.object,
    saveSticker: PropTypes.func,
    setInSticker: PropTypes.func,
    setError: PropTypes.func,
    setSection: PropTypes.func,
    processApperance: PropTypes.func,
    calculateStorageUsage: PropTypes.func,
};

export default ApperanceEditor;
