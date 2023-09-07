import React from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

const AnimatedTitle = ({ text, fontSize, delay }) => {
    const props = useSpring({
        to: { opacity: 1 },
        from: { opacity: 0 },
        delay: delay || 0,
    });
    return (
        <animated.div
            style={props}
            className={fontSize !== undefined ? 'fs-' + fontSize : 'fs-2'}
        >
            {text || ''}
        </animated.div>
    );
};

AnimatedTitle.propTypes = {
    text: PropTypes.string,
    fontSize: PropTypes.number,
};

export default AnimatedTitle;
