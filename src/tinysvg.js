const { parse } = require('svg-parser');
const LZString = require('lz-string');

export class TinySVG {
    stack = []; // Used with groups (tags with children)
    stackPosition = 0;
    conversionData = [];
    parseData = {};

    // Wiped after every parse/conversion method call
    settings = {};

    /**
     * Here you can add your implentations for more tags
     * (the methods in here are called before using .bind(this) inside of this class)
     */

    conversionMethods = {
        text: (properties) => {
            const object = {
                tag: 't',
                properties: {
                    style: properties.style || '*',
                },
            };

            return this.insertIfPresent(object, properties, ['id']);
        },
        polygon: (properties) => {
            const colour = this.getHexFromStyle(properties);
            let object = {
                tag: 'poly',
                colour,
                properties: {
                    points: properties.points || '*',
                },
            };

            object = this.cleanFillAndStyle(colour, object, properties);

            return this.insertIfPresent(object, properties, [
                'id',
                'pathLength',
            ]);
        },
        textpath: (properties) => {
            const object = {
                tag: 'tp',
                properties: {
                    style: properties.style || '*',
                    href: properties.href || '*',
                },
            };

            return this.insertIfPresent(object, properties, [
                'id',
                'startOffset',
                'spacing',
                'textLength',
                'side',
                'method',
            ]);
        },
        // Svg tag
        svg: (properties) => {
            const object = {
                tag: 'h',
                properties: {
                    viewbox: properties.viewbox || '*',
                },
            };

            return this.insertIfPresent(object, properties, ['id']);
        },
        path: (properties) => {
            const colour = this.getHexFromStyle(properties);
            let object = {
                tag: 'p',
                colour,
                properties: {
                    d: properties.d || '*',
                    transform: properties.transform || '*',
                    style: properties.style || '*',
                },
            };

            object = this.insertIfPresent(object, properties, [
                'fill-rule',
                'stroke',
                'clip-rule',
                'id',
            ]);

            object = this.cleanFillAndStyle(colour, object, properties);

            return object;
        },
        circle: (properties) => {
            const colour = this.getHexFromStyle(properties);
            let object = {
                tag: 'c',
                colour,
                properties: {
                    cx: properties.cx || '*',
                    cy: properties.cy || '*',
                    r: properties.r || '*',
                },
            };

            object = this.cleanFillAndStyle(colour, object, properties);

            return this.insertIfPresent(object, properties, ['style', 'id']);
        },
        ellipse: (properties) => {
            const colour = this.getHexFromStyle(properties);
            let object = {
                tag: 'e',
                colour,
                properties: {
                    cx: properties.cx || '*',
                    cy: properties.cy || '*',
                    rx: properties.rx || '*',
                    ry: properties.ry || '*',
                },
            };

            object = this.cleanFillAndStyle(colour, object, properties);

            return this.insertIfPresent(object, properties, ['style', 'id']);
        },
        rect: (properties) => {
            const colour = this.getHexFromStyle(properties);
            let object = {
                tag: 'r',
                colour,
                properties: {
                    w: properties.w || '*',
                    h: properties.h || '*',
                    x: properties.x || '*',
                    y: properties.y || '*',
                },
            };

            object = this.cleanFillAndStyle(colour, object, properties);

            return this.insertIfPresent(object, properties, ['style', 'id']);
        },
        g: (properties) => {
            const object = {
                tag: 'g',
                colour: this.getHexFromStyle(properties),
                properties: {
                    transform: properties.transform || '*',
                    id: properties.id || '*',
                },
            };

            return this.insertIfPresent(object, properties, [
                'fill-rule',
                'stroke',
                'clip-path',
                'clip-rule',
                'stroke-miterlimit',
                'style',
            ]);
        },
        defs(properties) {
            return {
                tag: 'defs',
                properties: {
                    id: properties.id || '*',
                },
            };
        },
        lineargradient(properties) {
            const object = {
                tag: 'lg',
                properties: {
                    id: properties['id'] || '*',
                    gradientUnits: properties['gradientunits'] || '*',
                    x1: properties['x1'] || '*',
                    x2: properties['x2'] || '*',
                    y1: properties['y1'] || '*',
                    y2: properties['y2'] || '*',
                    'xlink:href': properties['xlink:href'] || '*',
                },
            };

            return object;
        },
        radialgradient(properties) {
            const object = {
                tag: 'rg',
                properties: {
                    id: properties['id'] || '*',
                    gradientUnits: properties['gradientunits'] || '*',
                    cy: properties['cy'] || '*',
                    cx: properties['cx'] || '*',
                    r: properties['r'] || '*',
                    gradientTransform: properties['gradientTransform'] || '*',
                    'xlink:href': properties['xlink:href'] || '*',
                },
            };

            return object;
        },
        stop: (properties) => {
            const object = {
                tag: 's',
                properties: {
                    offset: properties.offset || '*',
                    style: properties.style || '*',
                },
            };

            return this.insertIfPresent(object, properties, [
                'id',
                'stop-color',
                'stop-opacity',
            ]);
        },
        clippath: (properties) => {
            const object = {
                tag: 'cp',
                colour: this.getHexFromStyle(properties),
                properties: {
                    d: properties.d || '*',
                },
            };

            return this.insertIfPresent(object, properties, [
                'id',
                'clipPathUnits',
            ]);
        },
    };

    // Used when parsing tinySVG
    parseMethods = {
        // Tag
        h: (properties) => ['svg', this.collapseProperties(properties)],
        p: (properties) => ['path', this.collapseProperties(properties)],
        g: (properties) => ['g', this.collapseProperties(properties)],
        c: (properties) => ['circle', this.collapseProperties(properties)],
        rect: (properties) => ['rect', this.collapseProperties(properties)],
        poly: (properties) => ['polygon', this.collapseProperties(properties)],
        t: (properties) => ['text', this.collapseProperties(properties)],
        tp: (properties) => ['textPath', this.collapseProperties(properties)],
        defs: (properties) => ['defs', this.collapseProperties(properties)],
        cp: (properties) => ['clipPath', this.collapseProperties(properties)],
        s: (properties) => ['stop', this.collapseProperties(properties)],
        lg: (properties) => [
            'linearGradient',
            this.collapseProperties(properties),
        ],
        rg: (properties) => [
            'radialGradient',
            this.collapseProperties(properties),
        ],
        e: (properties) => ['ellipse', this.collapseProperties(properties)],
    };

    /**
     *
     * @param {object} properties
     * @returns
     */
    collapseProperties(properties) {
        if (properties === null) {
            return null;
        }

        let parameters = ' ';
        for (const [index, value] of Object.entries(properties)) {
            if (value === null) {
                continue;
            }

            parameters += `${this.tryDecodeURI(index)}="${
                this.tryDecodeURI(value) === ''
                    ? value
                    : this.tryDecodeURI(value)
            }" `;
        }

        return parameters;
    }

    cleanFillAndStyle(colour, object, properties) {
        // If the fill is set and undefined and for some reason the style has a fill none in it, remove it
        if (
            properties.fill !== undefined &&
            object.properties.style !== undefined &&
            !object.properties.style.includes('url(#')
        ) {
            if (object.properties.style !== undefined) {
                // Potential end of string css tag
                object.properties.style = object.properties.style.replace(
                    'fill:none',
                    ''
                );
            }

            if (
                properties.fill !== undefined &&
                object.properties.fill !== '*' &&
                Number.parseInt(properties.fill.slice(1)) === colour
            ) {
                delete object.properties.fill;
            }
        }

        const newObject = { ...object };
        for (const key of Object.keys(object.properties)) {
            if (object.properties[key] !== '*')
                newObject.properties[key] = object.properties[key];
        }

        return newObject;
    }

    /**
     *
     * @param {object} obj
     * @param {object} properties
     * @param {Array} values
     * @returns
     */
    insertIfPresent(object, properties, values) {
        if (object.properties === undefined) {
            object.properties = {};
        }

        for (const value of values) {
            if (
                properties[value.toLowerCase()] !== undefined &&
                properties[value.toLowerCase()] !== null &&
                properties[value.toLowerCase()] !== ''
            ) {
                object.properties[value] = properties[value.toLowerCase()];
            }
        }

        return object;
    }

    /**
     * Register's a new tinySVG tag, conversion method is what is put into tinySVG. parseMethod is what is read and turned into SVG.
     * First argument can either be an object or an array
     * 	["tag", (properties) => {return {} }]
     * 	{tag: (properties) => {return {} }}
     *
     * @param {object|Array} conversionMethod
     * @param {object|Array} parseMethod
     */
    registerTag(conversionMethod, parseMethod) {
        let key;
        let callable;

        if (Array.isArray(conversionMethod)) {
            key = conversionMethod[0];

            if (typeof conversionMethod[1] !== 'function') {
                throw new TypeError('Value must be callable');
            }

            callable = conversionMethod[1];
        } else if (typeof conversionMethod === 'object') {
            key = Object.keys(conversionMethod)[0];
            const vals = Object.values(conversionMethod);

            if (typeof vals[0] !== 'function') {
                throw new TypeError('Value must be callable');
            }

            callable = vals[0];
        } else {
            throw new TypeError(
                'bad type for parseMethod should be object or instance of Array'
            );
        }

        if (
            typeof key !== 'string' &&
            typeof key !== 'number' &&
            this.conversionMethods[key] !== undefined
        ) {
            throw new Error('bad key: ' + key);
        }

        this.conversionMethods[key] = callable;

        // Now do parseMethod

        if (Array.isArray(parseMethod)) {
            key = parseMethod[0];
            if (typeof parseMethod[1] !== 'function') {
                throw new TypeError('Value must be callable');
            }

            callable = parseMethod[1];
        } else if (typeof parseMethod === 'object') {
            key = Object.keys(parseMethod)[0];
            const vals = Object.values(parseMethod);

            if (typeof vals[0] !== 'function') {
                throw new TypeError('Value must be callable');
            }

            callable = vals[0];
        } else {
            throw new TypeError(
                'bad type for parseMethod should be object or instance of Array'
            );
        }

        if (
            typeof key !== 'string' &&
            typeof key !== 'number' &&
            this.parseMethods[key] !== undefined
        ) {
            throw new Error('bad key: ' + key);
        }

        this.parseMethods[key] = callable;
    }

    /**
     * Creates a new tinySVG element, this can then be fed into toSVG() to be parsed into valid SVG.
     * @param {string} tinySVGTagName
     * @param {object} properties
     * @param {bool} returnObject
     * @returns
     */
    createElement(
        tinySVGTagName,
        properties = {},
        content = '',
        returnObject = true
    ) {
        tinySVGTagName = tinySVGTagName.toLowerCase();
        if (this.parseMethods[tinySVGTagName] === undefined) {
            throw new Error('tinySVG tag is not defined: ' + tinySVGTagName);
        }

        const object = {
            tag: tinySVGTagName,
            colour: this.getHexFromStyle(properties),
            properties: { ...properties },
        };

        if (content !== '') {
            object.content = content;
        }

        if (returnObject) {
            return object;
        }

        return [object];
    }

    /**
     *
     * @param {string} svgCode
     * @param {bool} returnObject
     * @param {bool} writeColours
     * @returns
     */
    toTinySVG(
        svgCode,
        returnObject = false,
        writeColours = false,
        convertColoursToNumber = true
    ) {
        let hastObject;
        try {
            hastObject = parse(svgCode);
        } catch (error) {
            console.log(error);
            throw new Error('Invalid SVG');
        }

        this.settings = {
            convertToNumber: convertColoursToNumber,
        };

        this.stack = [];
        this.conversionData = [];

        const recursive = (children) => {
            for (const [index, value] of children.entries()) {
                if (
                    value === undefined ||
                    value === null ||
                    value.tagName === undefined
                ) {
                    continue;
                }

                // lower case all keys
                if (value.properties === undefined) {
                    value.properties = {};
                }

                for (const [propertyIndex, propertyValue] of Object.entries(
                    value.properties
                )) {
                    delete value.properties[propertyIndex];
                    value.properties[
                        typeof propertyIndex === 'string'
                            ? propertyIndex
                                  .toLowerCase()
                                  .replace(/~/g, ':') // not sure why i do this
                                  .replace(/|/g, '')
                            : propertyIndex
                    ] =
                        typeof propertyValue === 'string'
                            ? // not sure why i do this
                              propertyValue.replace(/~/g, ':')
                            : propertyValue;
                }

                // skip undefined tag
                if (
                    this.conversionMethods[value.tagName.toLowerCase()] ===
                    undefined || this.conversionMethods[value.tagName.toLowerCase()] === 'metadata'
                ) {
                    console.log(
                        'unsupported tag: ' + value.tagName.toLowerCase()
                    );
                    continue;
                }

                if (
                    value.children !== undefined &&
                    value.children.length !== 0
                ) {
                    const obj = {
                        ...this.conversionMethods[
                            value.tagName.toLowerCase()
                        ].bind(this, value.properties)(),
                    };
                    this.conversionData.push({ ...obj, startTag: true });
                    this.stack.push({
                        ...obj,
                        ...recursive(value.children),
                    });
                } else {
                    this.conversionData.push(
                        this.conversionMethods[
                            value.tagName.toLowerCase()
                        ].bind(this, value.properties)()
                    );
                }

                if (this.stack.length > 0) {
                    this.conversionData.push({
                        ...this.stack.pop(),
                        endTag: true,
                    });
                }
            }
        };

        // Will fill conversionData with attributes
        recursive(hastObject.children || hastObject);

        // Stack should be zero
        if (this.stack.length > 0) {
            console.log('WARNING: stack is not zeroed');
        }

        const result = {
            map: { ...this.conversionData },
        };

        result.pathSize = this.countPathTags(result.map);
        result.colours = this.selectColours(result.map);
        result.paths = this.buildMap(result.map);
        result.compressed = this.compress(result.paths);

        if (returnObject) {
            return { ...result };
        }

        return [
            result.paths,
            result.pathSize,
            result.colours,
            result.compressed,
            result.map,
        ];
    }

    /**
     *
     * @param {object} element
     * @param {Array|object} map
     * @param {bool} belowFirstElement
     */

    insertElement(element, map, belowFirstElement) {
        if (typeof element !== 'object' || Array.isArray(element)) {
            throw new TypeError('invalid parameter');
        }

        this.insertMap(element, map, belowFirstElement);
    }

    /**
     * Inserts a map into another map, can also insert an element! third argument specifies if to insert it below the first tag or after the first tag.
     * If you don't care about this you can just use JS syntax to unpack
     * eg: [...mapOne, ...mapTwo] or [...mapTwo, ...mapOne]
     * @param {*} values
     * @param {*} map
     * @param {*} belowFirstElement
     * @returns
     */

    insertMap(values, map, belowFirstElement = true) {
        if (Array.isArray(map) === false) {
            map = Object.values(map);
        }

        if (Array.isArray(values) === false) {
            values = Object.values(values);
        }

        const result = [...map.slice(0, -1), ...values, map[map.length - 1]];

        return result;
    }

    /**
     *
     * @param {string} value
     * @returns
     */
    tryDecodeURI(value) {
        try {
            return decodeURI(value);
        } catch {
            return ''; // Return no value
        }
    }

    /**
     * Turns tinySVG into SVG code. Use parseMap to return the map instead. Colours must be passed as third argument.
     * @param {object|Array|string} tinySVG
     * @param {bool} headerHasProperties
     * @param {Array} svgColours
     * @param {bool} skipSVGTag
     * @param {bool} noneToBlack
     * @param {bool} forceColours
     * @returns
     */
    toSVG(
        tinySVG,
        headerHasProperties = true,
        colours = [],
        skipSVGTag = false,
        noneToBlack = false,
        forceColours = true
    ) {
        let map;
        let pathCount = 0;
        const svgColours = [...colours].reverse();

        if (Array.isArray(tinySVG) === true) {
            map = tinySVG;
        } else if (typeof tinySVG === 'object') {
            map = tinySVG.paths || tinySVG.map || tinySVG;
        }
        // Convert from string to map
        else if (typeof tinySVG === 'string') {
            map = this.readTinySVG(tinySVG);
        }

        let result = '';
        const reversedMap = Object.values(map).reverse();

        while (reversedMap.length > 0) {
            const task = reversedMap.pop();
            let string;
            let contents;
            let tag = task.tag;

            if (this.parseMethods[task.tag] === undefined) {
                string = '';
            } else {
                // Get the tag
                [tag] = this.parseMethods[task.tag].bind(this, null)();

                for (const key of Object.keys(task.properties)) {
                    if (task.properties[key] === '*') {
                        delete task.properties[key];
                    }
                }

                if (
                    this.isColourTag(tag) &&
                    (forceColours ||
                        task.properties.fill === undefined ||
                        task.properties.fill === null) &&
                    svgColours.length > 0 &&
                    !(task.properties?.style || '').includes('fill:url(#')
                ) {
                    let result = svgColours.pop();
                    if (typeof result === 'number' || !isNaN(result)) {
                        result = this.toHexFromDecimal(result);
                    }

                    task.properties.fill = result;
                }

                if (this.isPathTag(tag)) {
                    pathCount++;
                }

                // If we are turning none to black
                if (
                    this.isColourTag(tag) &&
                    (task.properties.fill === undefined ||
                        task.properties.fill === 'none' ||
                        task.properties.fill === null) &&
                    noneToBlack
                ) {
                    task.properties.fill = 'black';
                }


                try {

                    

                    if (
                        this.isColourTag(tag) &&
                        task.properties.fill !== undefined &&
                        task.properties.style !== undefined
                    ) {
                        
                        console.warn('Properties.Style: ' + task.properties.style);
                        console.warn('Properties.Fill: ' + task.properties.fill);
                        
                    }
                } catch (error) {
                    console.error(error);
                }

                if ((tag === 'svg' || task === 'h') && !headerHasProperties) {
                    task.properties = {};
                }

                if ((tag === 'svg' || task === 'h') && skipSVGTag) {
                    continue;
                }

                const parseResult = this.parseMethods[task.tag].bind(
                    this,
                    task.properties
                )();
                [tag, string, contents] = parseResult;
            }

            if (task.endTag) {
                result += `</${tag}>`;
            } else if (
                (task.contents !== undefined && task.contents !== null) ||
                (contents !== undefined && contents !== null)
            ) {
                result +=
                    `<${tag}${string}>${task.contents}${contents}` +
                    (task.startTag === true ? '' : `</${tag}>`);
            } else {
                result += `<${tag}${string}${
                    task.startTag === true ? '' : '/'
                }>`;
            }
        }

        return [result, pathCount, svgColours, Object.values(map)];
    }

    /**
     *
     * @param {string} potentialMap
     * @returns
     */
    readTinySVG(potentialMap) {
        if (potentialMap.includes('<svg')) {
            throw new Error('Please enter tiny SVG');
        }

        if (potentialMap.slice(0, 1) === '<') {
            potentialMap = this.decompress(potentialMap);
        }

        if (potentialMap.slice(0, 1) !== '/') {
            throw new Error('Please enter tiny SVG');
        }

        potentialMap = potentialMap.slice(1);
        const keys = potentialMap.split('&');
        const map = [];

        for (const key of keys) {
            let properties = key.match(/\[(.*?)]/);
            const object = {};
            if (
                properties === null &&
                (!key.includes('[') || !key.includes(']'))
            ) {
                object.tag = key.replace(/\[/g, '').replace(/]/g, '');
            } else {
                object.tag = key.slice(0, Math.max(0, key.indexOf('[')));
            }

            object.properties = {};

            properties = properties[1].split('|');
            for (const property of properties) {
                if (property === 'end') {
                    object.endTag = true;
                    continue;
                }
                if (property === 'start') {
                    object.startTag = true;
                    continue;
                }
                if (property.indexOf('$') === -1)
                    object.properties[Object.keys(object.properties).length] =
                        property;
                else {
                    let splitProperty = property.split('$');
                    let val = splitProperty[1] || null;
                    if (val !== null) val = val.replace(/~/g, ':');
                    if (val === '*' || val.length === 0) val = null;
                    object.properties[
                        (splitProperty[0] || '').replace(/~/g, ':')
                    ] = val;
                }
            }

            map.push(object);
        }

        return { ...map };
    }

    /**
     *
     * @param {string} paths
     * @returns
     */
    decompress(paths) {
        return LZString.decompressFromEncodedURIComponent(
            paths.match(/<(.*?)>/)[1]
        );
    }

    /**
     *
     * @param {string|object} object
     * @returns
     */
    compress(object) {
        let paths;
        if (typeof object === 'object') {
            paths =
                object.paths ||
                this.buildMap(object.map) ||
                this.buildMap(object);
        } else {
            paths = object;
        }

        return `<${LZString.compressToEncodedURIComponent(paths)}>`;
    }

    /**
     *
     * @param {*} tag
     * @param {*} keys
     * @returns
     */
    isColourTag(
        tag,
        keys = [
            'path',
            'circle',
            'rect',
            'p',
            'c',
            'r',
            'ellipse',
            'poly',
            'polygon',
            'e',
        ]
    ) {
        return keys.includes(tag);
    }

    /**
     *
     * @param {*} tag
     * @param {*} keys
     * @returns
     */
    isPathTag(
        tag,
        keys = [
            'path',
            'circle',
            'rect',
            'p',
            'c',
            'r',
            'ellipse',
            'poly',
            'polygon',
            'e',
        ]
    ) {
        return keys.includes(tag);
    }

    /**
     *
     * @param {*} map
     * @returns
     */
    selectColours(map) {
        const colours = [];
        for (const [index, value] of Object.entries(map)) {
            if (this.isColourTag(value.tag)) {
                colours.push(value.colour || 'none');
            }
        }

        return colours;
    }

    /**
     * Produces a perfect CSS colour code each time
     * @param {number} decimal
     * @returns
     */

    toHexFromDecimal(decimal) {
        decimal = Number.parseInt(decimal).toString(16);

        if (
            decimal.length % 3 !== 0 &&
            decimal.length < 6 &&
            decimal.length !== 4
        ) {
            decimal = '0' + decimal;
        }

        decimal = decimal.slice(0, 6);

        return '#' + decimal;
    }

    /**
     *
     * @param {*} map
     * @returns
     */
    buildMap(map) {
        let string_ = '/';
        for (const [index, value] of Object.entries(map)) {
            string_ +=
                (value.tag || 'u') +
                `[${
                    value.endTag !== true
                        ? this.buildProperties(value.properties || {})
                        : 'end'
                }${value.startTag === true ? '|start' : ''}]&`;
        }

        return string_.slice(0, Math.max(0, string_.length - 1));
    }

    /**
     *
     * @param {*} properties
     * @returns
     */
    buildProperties(properties) {
        let result = '';
        for (const [name, value] of Object.entries(properties)) {
            result += `${encodeURI(
                typeof name === 'string'
                    ? name.replace(/["'/\\<>`]/g, '')
                    : name
            )}$${encodeURI(
                typeof value === 'string'
                    ? value.replace(/["'/\\<>`]/g, '')
                    : value
            )}|`;
        }

        return result.slice(0, Math.max(0, result.length - 1));
    }

    /**
     * Gets the colour of an SVG element from its style or fill tag
     * @param {object} properties
     * @param {bool} convertToNumber
     * @returns
     */
    getHexFromStyle(properties, convertToNumber = false) {
        const potentialHex = properties.fill || properties.style;

        if (potentialHex === undefined) {
            return 'none';
        }

        let result;
        // Is already a hex
        if (potentialHex.slice(0, 1) === '#') {
            result =
                convertToNumber || this.settings.convertToNumber
                    ? Number.parseInt(properties.fill.slice(1, 7), 16)
                    : potentialHex;
        } else {
            if (!potentialHex.includes('fill:')) {
                return 'none';
            }

            let split = potentialHex.split('fill:')[1];

            if (split.includes(';')) {
                split = split.split(';')[0];
            }

            if (split.length > 7 || !split.includes('#')) {
                return 'none';
            }
            result =
                convertToNumber || this.settings.convertToNumber
                    ? Number.parseInt(split.slice(1, 7), 16)
                    : split;
        }

        return result;
    }

    /**
     *
     * @param {*} map
     * @returns
     */
    countPathTags(map) {
        let count = 0;
        for (const [index, value] of Object.entries(map)) {
            if (this.isPathTag(value.tag)) {
                count++;
            }
        }

        return count;
    }
}

/**
 * Written by Llydia
 */
const tinySVG = new TinySVG();
export default tinySVG;
