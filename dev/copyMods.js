const fs = require('node:fs');
const {getBuildToolsLocation} = require('./util/helpers.js');

async function main() {
	let settings = {};
	if (fs.existsSync('./.settings')) {
		settings = JSON.parse(fs.readFileSync('./.settings'));
	}

	if (settings.buildLocation === undefined) {
		settings.buildLocation = await getBuildToolsLocation();
	}

	console.log('\n> Copying our mods to build tools\n'.blue);

	console.log('- writing .settings');
	fs.writeFileSync('./.settings', JSON.stringify(settings));

	const modManifest = await require('./../src/Deployments/mods/modManifest.json');
	for (const modname of Object.keys(modManifest.mods)) {
		const mod = modManifest.mods[modname];
		mod.modname = modname;
		console.log('- reading mod manifest');
		const folderRoot = 'src/Deployments/mods/' + mod.modname + '/';
		let manifest = require('./../' + folderRoot + mod.modname + '.json');
		manifest = manifest.default || manifest;
		const path = settings.buildLocation + 'mods/' + mod.modname + '/';
		console.log('- updating mod manifest at ' + path + mod.modname + '.json');
		fs.writeFileSync(path + mod.modname + '.json', JSON.stringify(manifest.manifest, null, 2));

		if (fs.existsSync(folderRoot + '/main.js')) {
			console.log('- updating main.js for ' + mod.name);
			fs.copyFileSync(folderRoot + '/main.js', path + 'main.js');
		}

		const folders = [
			'Pages',
			'Components',
			'Styles',
			'Images',
			'Modals',
		];

		for (const folder of folders) {
			if (fs.existsSync('./' + folderRoot + folder + '/')) {
				console.log(('\n> Copying ' + folder.toLowerCase() + ' files for ' + mod.modname + '\n').blue);
				for (const file of fs.readdirSync('./' + folderRoot + folder + '/', {
					withFileTypes: true,
				})) {
					if (!fs.existsSync(path + folder + '/')) {
						fs.mkdirSync(path + folder + '/');
					}

					console.log('- updating ' + folder.toLowerCase() + ' file at ' + path + folder + '/' + file.name);
					fs.copyFileSync('./' + folderRoot + folder + '/' + file.name, path + (folder.toLowerCase()) + '/' + file.name);
				}
			}
		}
	}
}

main().then(() => {
	process.exit(0);
}).catch(error => {
	console.error(error);
	process.exit(1);
});
