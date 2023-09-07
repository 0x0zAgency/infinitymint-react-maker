import { React, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import Config from '../config.js';

const AnimatedNumber = ({ reach, delay, className, slowness }) => {
    // eslint-disable-next-line
    const [flip, set] = useState(false);
    const { number } = useSpring({
        reset: false,
        reverse: flip,
        from: { number: 0 },
        number: reach || 1,
        config: {
            mass: 25,
            tension: 200,
            friction: (slowness || 5) * Config.settings.animationSpeed,
            clamp: true,
        },
        delay: delay || 10,
    });

    return (
        <animated.div className={className}>
            {number.to((n) => Math.floor(n))}
        </animated.div>
    );
};

AnimatedNumber.propTypes = {
    reach: PropTypes.number,
    delay: PropTypes.number,
};

export default AnimatedNumber;
