const readline = require('node:readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
const util = require('node:util');

const question = util.promisify(rl.question).bind(rl);
const fs = require('node:fs');

const checkBuildFolder = location => {
	if (
		!fs.existsSync(location)
        || !fs.existsSync(location + 'package.json')
	) {
		return false;
	}

	let result = fs.readFileSync(location + 'package.json');

	try {
		result = JSON.parse(result);

		if (
			result?.infinityMint?.allowImport !== true
		) {
			console.log('is not supported export: ' + result.name);
			return false;
		}
	} catch (error) {
		console.log(error);
		return false;
	}

	return true;
};

const getBuildToolsLocation = async () => {
	let buildLocation = '';
	let selectedLocation = process.cwd() + '/';
	let shouldBreak = false;
	let lastFile = '';
	let files = [];
	while (!shouldBreak) {
		console.log('\n\n');
		files = (
			await fs.promises.readdir(selectedLocation, {
				withFileTypes: true,
			})
		)
			.filter(file => file.isDirectory())
			.map(file => file.name);

		for (const [index, name] of files.entries()) {
			console.log(`[${index}] ${name}`);
		}

		console.log(`[${files.length}] <back>`);
		console.log(
			'\nPlease enter InfinityMint-BuildTools location. Use numbers to navigate folders.',

		);
		console.log(
			'Current Selected Directory: ' + selectedLocation,
		);
		console.log(
			'You can copy and paste a path. Commands: [r]eset [c]lone [e]xit (continue without UNRECOMMENDED)',

		);

		let result = await question('=> ');

		if (result === undefined || result === null || result === '') {
			continue;
		}

		if (!isNaN(result)) {
			result = Number.parseInt(result);
			selectedLocation
                = result >= files.length
                	? (lastFile === ''
						? selectedLocation + '../'
						: selectedLocation.replace(lastFile + '/', ''))
                	: selectedLocation + files[result] + '/';
			lastFile = result < files.length ? files[result] : '';

			if (checkBuildFolder(selectedLocation)) {
				console.log('');
				shouldBreak = true;
				buildLocation = selectedLocation;
				console.log(' ☻ Valid Location Detected! ☻');
				break;
			}
		} else {
			// Copy and pasted a link in
			if (result.length > 5) {
				if (
					result.slice(0, Math.max(0, result.length - 1)) !== '/'
                    && result.slice(0, Math.max(0, result.length - 1)) !== '\\'
				) {
					result += '/';
				}

				if (!fs.existsSync(result)) {
					console.log(
						'\nSorry!\n The entered path does not exist: '
                        + result,
					);
					await new Promise(resolve => {
						setTimeout(resolve, 2000);
					});
				} else if (checkBuildFolder(result)) {
					shouldBreak = true;
					buildLocation = result;
				} else {
					selectedLocation = result;
					console.log(
						'\nSorry!\n Something is wrong with that path. Make sure you select the root folder of the respository',

					);
					await new Promise(resolve => {
						setTimeout(resolve, 2000);
					});
				}
			} else {
				switch (result.toLowerCase()) {
					case 'reset':
					case 'r': {
						selectedLocation = process.cwd() + '/';
						break;
					}

					default:
					case 'yes':
					case 'y': {
						if (this.checkReactFolder(selectedLocation)) {
							shouldBreak = true;
							buildLocation = selectedLocation;
							console.log(' ☻ Valid Location Detected! ☻');
							break;
						}

						console.log(
							'\nSorry!\n Something is wrong with that path. Make sure you select the root folder of the respository',

						);
						await new Promise(resolve => {
							setTimeout(resolve, 2000);
						});
						break;
					}

					case 'exit':
					case 'e': {
						return '';
					}
				}
			}
		}
	}

	console.log('Build Location set to: ' + buildLocation);
	return buildLocation;
};

module.exports = {
	getBuildToolsLocation,
};
