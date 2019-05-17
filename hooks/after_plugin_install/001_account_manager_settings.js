#!/usr/bin/env node
'use strict';

var fs = require('fs');

function directoryExists(path) {
	try {
		return fs.statSync(path).isDirectory();
	} catch (e) {
		return false;
	}
}

module.exports = function (context) {
	var cordova_util = context.requireCordovaModule('cordova-lib/src/cordova/util'),
		projectRoot = cordova_util.isCordova(),
		xml = cordova_util.projectConfig(projectRoot),
		ConfigParser,
		newStructure = directoryExists('platforms/android/app/src/main/res/xml'),
		basePath = newStructure ? 'platforms/android/app/src/main/res' : 'platforms/android/res';

	try {
		ConfigParser = context.requireCordovaModule('cordova-common/src/ConfigParser/ConfigParser');
	} catch (e) {
		ConfigParser = context.requireCordovaModule('cordova-lib/src/configparser/ConfigParser')
	}

	var cfg = new ConfigParser(xml),
		label = cfg.getPreference('AccountManagerLabel'),
		iconUrl = cfg.getPreference('AccountManagerIconUrl'),
		accountType = cfg.getPreference('AccountManagerType');

	fs.writeFileSync('platforms/android/res/drawable/acm_icon.png', fs.readFileSync(iconUrl));

	var authenticatorFile = fs.readFileSync(basePath + '/xml/authenticator.xml', 'utf8');
	authenticatorFile = authenticatorFile.replace(/android:icon="[ \S]*"/i, 'android:icon="@drawable/acm_icon"');
	authenticatorFile = authenticatorFile.replace(/android:smallIcon="[ \S]*"/i, 'android:smallIcon="@drawable/acm_icon"');
	authenticatorFile = authenticatorFile.replace(/android:accountType="[ \S]*"/i, 'android:accountType="' + accountType + '"');
	fs.writeFileSync(basePath + '/xml/authenticator.xml', authenticatorFile);

	var stringFile = fs.readFileSync(basePath + '/values/strings.xml', 'utf8');
	if (stringFile.indexOf('<string name="authLabel">') > -1) {
		stringFile = stringFile.replace(/\<string name\=\"authLabel\"\>[ \S]*\<\/string\>/i, '<string name="authLabel">' + label + '</string>');
	}
	else {
		stringFile = stringFile.replace('</resources>', '<string name="authLabel">' + label + '</string></resources>');
	}

	fs.writeFileSync(basePath + '/values/strings.xml', stringFile);
};
