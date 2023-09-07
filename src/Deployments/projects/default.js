const localObjectURI = {
    description: {
        name: '♾️Mint Project', // Will appear in the Navbar and Footer
        token: 'Token', // The name of the token
        tokenSymbol: '♾️', // The name of the token
        tokenPlural: 'Tokens', // The plural name of the token
        authors: [
            // Any authors
            {
                name: 'Llydia Cross',
                role: 'Developer',
                url: '',
                twitter: 'lydmas',
            },
            {
                Name: 'Joshua Z Herhandez',
                role: 'Developer & Operations',
                url: '',
                twitter: 'lydmas',
            },
        ],
    },
    modules: {
        controller: 'RaritySVG',
        random: 'SeededRandom',
        minter: 'DefaultMinter',
        royalty: 'SplitRoyalty',
    },
    names: [],
    // Setting specific variables for each path Id
    paths: {
        default: {
            fileName: null,
            name: 'Unknown Token',
            paths: {
                data: '<PQCw2gbglgpg7gIwPYA8AkAGApAJg9vANgGYB2AOnyoI2IFYAOS6jAHwGcAXAQwCdOAugDIA5mE69uAO3YAzJLwC2aCdPYAbbpxgAKDM2oAaekxYYAlLgzsAxt3W79ARhaGAtM5bnWUACZoAKg4efmEABzB-AFkaJ1IAThp1Gjc4xKsAFkIaGiycq1iE-Lw0lLyCqzdyvGKMVKKAL1ZVGXklQOCATwdA8Mi0KLoMukL0vGTK0szsirxq-FmMKZqrZbr5spmV7brSppa5BWUgrm6YXqEI6OJ4oatiDLGMGzdSQknSSZwMyrfKnCcPzwbhwJEmGWI-3iDH+S0qhDo72BAKRu2IZC+lToTic9yBdXi8UhJRwxLRGHxxBSLk+eDo8Q+dFWj0qD3xpHxqRuq0IMOBTiJVm+DP5EKsdzw6KsDCZeA5q3oq1Isow8XxApwzJVEM1JXiutVcJKfKWpBNTnNGBwIoWJLwrNxkoevxN2WpGLl8uBDEdVoyvvqBrZ-x99wBDSsilRbmxqJsMt+BsBKpBDFiDFpdUILLwOANqUFuZTDGz4smGDoKYynP90ac9uBCIDeZThFulQymZBKQTyPLmZGHZo+sqGfuGDrLkyTzc3MledZNpcANWCq2VpNpJt8V9GVDJWIBuxNClubJ+6WS7ikyc+0krSOHVOPQCfWiLkHJSKVgm-IRJ9JRZD3xGhESsUhfToTNSANQoyUKTlvgNfNvjJeDxSnHZjyFJwVRVAE8MWOIVQQ1kVRtF4BTLfknFRet-lwnkf1SNMrFRXJhkWat8NPWghUPIUiK9W1TTJGNoOjRhwOjYh6JKB10J2VJ-zvNQ2mOLoXzfAYLXXNZf12JtxUzMkwMlTJ2VyMk20WQgwR2Oy0JtGgbCyRYGEQzMcQDBJMjE3tVS7ehUQI-sQpTXD8T3EMTWxKFM05Riv0mE1SDEi0f15IiVQg1YcvzM1phNF4SwwutnTlDJqUKvAGEVcYQRtezaDJUErBsD0NysNVVgXEoqL1E0bRwTM2pKCd7nNZUhViOSrSTZrALmEagNy-lYqcfybVIESuXuMTZOlfN-VWVVKmGmTfVLYFotqsSoLY1tXRNWdAXA311BBJaKUWZS6BwCM8EUR4rwevAbH+-5UT+floTYl7Oy7aMiH+fMqWjBFFzKfyUzS8tqTh-kRM+lwQK4p5cieTaTRchhnK1LEeQDTbVIfdoTk4M4LiuAYRqpJUngMv7QLJ8HIaw9U2KDA11RNE1g3G8Dvt9YhWNzNj4lRMkdta1Yl0-JY6N8m6-NZGgbKJ9UcQdfE+t2TbMhTUkj2bTG9RvA0LyqOnTpSbJLXhfC6ziyUIpHcZr2BaaiHp8HCEzc2lzY22Dt6jtfVJLsApGMpbeuuoxzpB3gU18VK3+Lz6oLtDDqJm1VZQsk3ORKKbTcVFy7mdV1R+8bYk6gUmrondpXluzR-Ao0RP9F66G1s7RTlu2qjwsTCYnA7eOaz7zJ2akVMjCFZs754dtZOjMN2Bgk0j9Yxom9a28Q0vgVVoc2+IOtl-F8l-jFfl+YNUBLHB+LViqyxypkUBCVBaxB-ptEi7VlxEX-usHkEU6Cs0OOzTS5xXyXH6FEYYc0HhWnaixWEHZZ6cnjr8fEn0q6zgTpMEYotdgjBVOPKOV1oxrQrCA+kiwaBpRVDYYR99hFVwbBgERQpEFED9pmBgL04ixDblww0HYqq9QDCQFUjCARy05CMA0M5Yz3HLNMDsmYX7Vx-D7RsqIso7A6swog8t4bgXcozOYPZKYqJEoQS+qQcwYDqohUBaouwrTpGJGJFYyQDRkfXX0GU8DthJF5FcuYZHinNHVd6Qp158LsrBPWkk8TpSbsE60Qpl41VoDDXY2i5i8RjDLNuhcKwplkgOFUO9L4BjaWQQGGBFCyWjFkTMNgmnt0SaAr6+JCRYiSlmf4c8K6slCW4Gc-ouxpLqNI2cKRvo7Lbt9T6DTaiPGuU8C2IkIYgOElUbq5zMHNHvNgjSz48HCDEDAKQvhhDgABUCoAA>',
            },
            uploadColours: false,
            startOffset: 1,
            spaceDecrease: 1,
            textPathVerticalOffset: '1%',
            hideSecondBorder: false,
            textPathFontSize: 32,
            deadZoneMax: 0,
            outerPadding: '2.5%', // Anything below 10% is weird
            padding: '2.5%',
            borderThickness: '16px',
            deadZoneMin: 0,
            wordPadding: 16,
            pathId: null,
        },
    },
};

export default localObjectURI;
