/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.0
 */

YAHOO.widget.LogMsg = function(oConfigs) {
	if (typeof oConfigs == "object") {
		for ( var param in oConfigs) {
			this[param] = oConfigs[param];
		}
	}
};
YAHOO.widget.LogMsg.prototype.msg = null;
YAHOO.widget.LogMsg.prototype.time = null;
YAHOO.widget.LogMsg.prototype.category = null;
YAHOO.widget.LogMsg.prototype.source = null;
YAHOO.widget.LogMsg.prototype.sourceDetail = null;
YAHOO.widget.LogWriter = function(sSource) {
	if (!sSource) {
		YAHOO.log("Could not instantiate LogWriter due to invalid source.",
				"error", "LogWriter");
		return;
	}
	this._source = sSource;
};
YAHOO.widget.LogWriter.prototype.toString = function() {
	return "LogWriter " + this._sSource;
};
YAHOO.widget.LogWriter.prototype.log = function(sMsg, sCategory) {
	YAHOO.widget.Logger.log(sMsg, sCategory, this._source);
};
YAHOO.widget.LogWriter.prototype.getSource = function() {
	return this._sSource;
};
YAHOO.widget.LogWriter.prototype.setSource = function(sSource) {
	if (!sSource) {
		YAHOO.log("Could not set source due to invalid source.", "error", this
				.toString());
		return;
	} else {
		this._sSource = sSource;
	}
};
YAHOO.widget.LogWriter.prototype._source = null;
YAHOO.widget.LogReader = function(elContainer, oConfigs) {
	var oSelf = this;
	this._sName = YAHOO.widget.LogReader._index;
	YAHOO.widget.LogReader._index++;
	if (typeof oConfigs == "object") {
		for ( var param in oConfigs) {
			this[param] = oConfigs[param];
		}
	}
	if (elContainer) {
		if (typeof elContainer == "string") {
			this._elContainer = document.getElementById(elContainer);
		} else if (elContainer.tagName) {
			this._elContainer = elContainer;
		}
		this._elContainer.className = "yui-log";
	}
	if (!this._elContainer) {
		if (YAHOO.widget.LogReader._elDefaultContainer) {
			this._elContainer = YAHOO.widget.LogReader._elDefaultContainer;
		} else {
			this._elContainer = document.body.appendChild(document
					.createElement("div"));
			this._elContainer.id = "yui-log";
			this._elContainer.className = "yui-log";
			YAHOO.widget.LogReader._elDefaultContainer = this._elContainer;
		}
		var containerStyle = this._elContainer.style;
		if (this.width) {
			containerStyle.width = this.width;
		}
		if (this.right) {
			containerStyle.right = this.right;
		}
		if (this.top) {
			containerStyle.top = this.top;
		}
		if (this.left) {
			containerStyle.left = this.left;
			containerStyle.right = "auto";
		}
		if (this.bottom) {
			containerStyle.bottom = this.bottom;
			containerStyle.top = "auto";
		}
		if (this.fontSize) {
			containerStyle.fontSize = this.fontSize;
		}
		if (navigator.userAgent.toLowerCase().indexOf("opera") != -1) {
			document.body.style += '';
		}
	}
	if (this._elContainer) {
		if (!this._elHd) {
			this._elHd = this._elContainer.appendChild(document
					.createElement("div"));
			this._elHd.id = "yui-log-hd" + this._sName;
			this._elHd.className = "yui-log-hd";
			this._elCollapse = this._elHd.appendChild(document
					.createElement("div"));
			this._elCollapse.className = "yui-log-btns";
			this._btnCollapse = document.createElement("input");
			this._btnCollapse.type = "button";
			this._btnCollapse.style.fontSize = YAHOO.util.Dom.getStyle(
					this._elContainer, "fontSize");
			this._btnCollapse.className = "yui-log-button";
			this._btnCollapse.value = "Collapse";
			this._btnCollapse = this._elCollapse.appendChild(this._btnCollapse);
			YAHOO.util.Event.addListener(oSelf._btnCollapse, 'click',
					oSelf._onClickCollapseBtn, oSelf);
			this._title = this._elHd.appendChild(document.createElement("h4"));
			this._title.innerHTML = "Logger Console";
			if (YAHOO.util.DD
					&& (YAHOO.widget.LogReader._elDefaultContainer == this._elContainer)) {
				var ylog_dd = new YAHOO.util.DD(this._elContainer.id);
				ylog_dd.setHandleElId(this._elHd.id);
				this._elHd.style.cursor = "move";
			}
		}
		if (!this._elConsole) {
			this._elConsole = this._elContainer.appendChild(document
					.createElement("div"));
			this._elConsole.className = "yui-log-bd";
			if (this.height) {
				this._elConsole.style.height = this.height;
			}
		}
		if (!this._elFt && this.footerEnabled) {
			this._elFt = this._elContainer.appendChild(document
					.createElement("div"));
			this._elFt.className = "yui-log-ft";
			this._elBtns = this._elFt
					.appendChild(document.createElement("div"));
			this._elBtns.className = "yui-log-btns";
			this._btnPause = document.createElement("input");
			this._btnPause.type = "button";
			this._btnPause.style.fontSize = YAHOO.util.Dom.getStyle(
					this._elContainer, "fontSize");
			this._btnPause.className = "yui-log-button";
			this._btnPause.value = "Pause";
			this._btnPause = this._elBtns.appendChild(this._btnPause);
			YAHOO.util.Event.addListener(oSelf._btnPause, 'click',
					oSelf._onClickPauseBtn, oSelf);
			this._btnClear = document.createElement("input");
			this._btnClear.type = "button";
			this._btnClear.style.fontSize = YAHOO.util.Dom.getStyle(
					this._elContainer, "fontSize");
			this._btnClear.className = "yui-log-button";
			this._btnClear.value = "Clear";
			this._btnClear = this._elBtns.appendChild(this._btnClear);
			YAHOO.util.Event.addListener(oSelf._btnClear, 'click',
					oSelf._onClickClearBtn, oSelf);
			this._elCategoryFilters = this._elFt.appendChild(document
					.createElement("div"));
			this._elCategoryFilters.className = "yui-log-categoryfilters";
			this._elSourceFilters = this._elFt.appendChild(document
					.createElement("div"));
			this._elSourceFilters.className = "yui-log-sourcefilters";
		}
	}
	if (!this._buffer) {
		this._buffer = [];
	}
	this._lastTime = YAHOO.widget.Logger.getStartTime();
	YAHOO.widget.Logger.newLogEvent.subscribe(this._onNewLog, this);
	YAHOO.widget.Logger.logResetEvent.subscribe(this._onReset, this);
	this._categoryFilters = [];
	var catsLen = YAHOO.widget.Logger.categories.length;
	if (this._elCategoryFilters) {
		for ( var i = 0; i < catsLen; i++) {
			this._createCategoryCheckbox(YAHOO.widget.Logger.categories[i]);
		}
	}
	this._sourceFilters = [];
	var sourcesLen = YAHOO.widget.Logger.sources.length;
	if (this._elSourceFilters) {
		for ( var j = 0; j < sourcesLen; j++) {
			this._createSourceCheckbox(YAHOO.widget.Logger.sources[j]);
		}
	}
	YAHOO.widget.Logger.categoryCreateEvent.subscribe(this._onCategoryCreate,
			this);
	YAHOO.widget.Logger.sourceCreateEvent.subscribe(this._onSourceCreate, this);
	this._filterLogs();
	YAHOO.log("LogReader initialized", null, this.toString());
};
YAHOO.widget.LogReader.prototype.logReaderEnabled = true;
YAHOO.widget.LogReader.prototype.width = null;
YAHOO.widget.LogReader.prototype.height = null;
YAHOO.widget.LogReader.prototype.top = null;
YAHOO.widget.LogReader.prototype.left = null;
YAHOO.widget.LogReader.prototype.right = null;
YAHOO.widget.LogReader.prototype.bottom = null;
YAHOO.widget.LogReader.prototype.fontSize = null;
YAHOO.widget.LogReader.prototype.footerEnabled = true;
YAHOO.widget.LogReader.prototype.verboseOutput = true;
YAHOO.widget.LogReader.prototype.newestOnTop = true;
YAHOO.widget.LogReader.prototype.thresholdMax = 500;
YAHOO.widget.LogReader.prototype.thresholdMin = 100;
YAHOO.widget.LogReader.prototype.isCollapsed = false;
YAHOO.widget.LogReader.prototype.toString = function() {
	return "LogReader instance" + this._sName;
};
YAHOO.widget.LogReader.prototype.pause = function() {
	this._timeout = null;
	this.logReaderEnabled = false;
};
YAHOO.widget.LogReader.prototype.resume = function() {
	this.logReaderEnabled = true;
	this._printBuffer();
};
YAHOO.widget.LogReader.prototype.hide = function() {
	this._elContainer.style.display = "none";
};
YAHOO.widget.LogReader.prototype.show = function() {
	this._elContainer.style.display = "block";
};
YAHOO.widget.LogReader.prototype.collapse = function() {
	this._elConsole.style.display = "none";
	if (this._elFt) {
		this._elFt.style.display = "none";
	}
	this._btnCollapse.value = "Expand";
	this.isCollapsed = true;
};
YAHOO.widget.LogReader.prototype.expand = function() {
	this._elConsole.style.display = "block";
	if (this._elFt) {
		this._elFt.style.display = "block";
	}
	this._btnCollapse.value = "Collapse";
	this.isCollapsed = false;
};
YAHOO.widget.LogReader.prototype.setTitle = function(sTitle) {
	this._title.innerHTML = this.html2Text(sTitle);
};
YAHOO.widget.LogReader.prototype.getLastTime = function() {
	return this._lastTime;
};
YAHOO.widget.LogReader.prototype.formatMsg = function(oLogMsg) {
	var category = oLogMsg.category;
	var label = category.substring(0, 4).toUpperCase();
	var time = oLogMsg.time;
	if (time.toLocaleTimeString) {
		var localTime = time.toLocaleTimeString();
	} else {
		localTime = time.toString();
	}
	var msecs = time.getTime();
	var startTime = YAHOO.widget.Logger.getStartTime();
	var totalTime = msecs - startTime;
	var elapsedTime = msecs - this.getLastTime();
	var source = oLogMsg.source;
	var sourceDetail = oLogMsg.sourceDetail;
	var sourceAndDetail = (sourceDetail) ? source + " " + sourceDetail : source;
	var msg = this.html2Text(oLogMsg.msg);
	var output = (this.verboseOutput) ? [ "<p><span class='", category, "'>",
			label, "</span> ", totalTime, "ms (+", elapsedTime, ") ",
			localTime, ": ", "</p><p>", sourceAndDetail, ": </p><p>", msg,
			"</p>" ] : [ "<p><span class='", category, "'>", label, "</span> ",
			totalTime, "ms (+", elapsedTime, ") ", localTime, ": ",
			sourceAndDetail, ": ", msg, "</p>" ];
	return output.join("");
};
YAHOO.widget.LogReader.prototype.html2Text = function(sHtml) {
	if (sHtml) {
		sHtml += "";
		return sHtml.replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(
				/>/g, "&#62;");
	}
	return "";
};
YAHOO.widget.LogReader._index = 0;
YAHOO.widget.LogReader.prototype._sName = null;
YAHOO.widget.LogReader._elDefaultContainer = null;
YAHOO.widget.LogReader.prototype._buffer = null;
YAHOO.widget.LogReader.prototype._consoleMsgCount = 0;
YAHOO.widget.LogReader.prototype._lastTime = null;
YAHOO.widget.LogReader.prototype._timeout = null;
YAHOO.widget.LogReader.prototype._categoryFilters = null;
YAHOO.widget.LogReader.prototype._sourceFilters = null;
YAHOO.widget.LogReader.prototype._elContainer = null;
YAHOO.widget.LogReader.prototype._elHd = null;
YAHOO.widget.LogReader.prototype._elCollapse = null;
YAHOO.widget.LogReader.prototype._btnCollapse = null;
YAHOO.widget.LogReader.prototype._title = null;
YAHOO.widget.LogReader.prototype._elConsole = null;
YAHOO.widget.LogReader.prototype._elFt = null;
YAHOO.widget.LogReader.prototype._elBtns = null;
YAHOO.widget.LogReader.prototype._elCategoryFilters = null;
YAHOO.widget.LogReader.prototype._elSourceFilters = null;
YAHOO.widget.LogReader.prototype._btnPause = null;
YAHOO.widget.LogReader.prototype._btnClear = null;
YAHOO.widget.LogReader.prototype._createCategoryCheckbox = function(sCategory) {
	var oSelf = this;
	if (this._elFt) {
		var elParent = this._elCategoryFilters;
		var filters = this._categoryFilters;
		var elFilter = elParent.appendChild(document.createElement("span"));
		elFilter.className = "yui-log-filtergrp";
		var chkCategory = document.createElement("input");
		chkCategory.id = "yui-log-filter-" + sCategory + this._sName;
		chkCategory.className = "yui-log-filter-" + sCategory;
		chkCategory.type = "checkbox";
		chkCategory.category = sCategory;
		chkCategory = elFilter.appendChild(chkCategory);
		chkCategory.checked = true;
		filters.push(sCategory);
		YAHOO.util.Event.addListener(chkCategory, 'click',
				oSelf._onCheckCategory, oSelf);
		var lblCategory = elFilter.appendChild(document.createElement("label"));
		lblCategory.htmlFor = chkCategory.id;
		lblCategory.className = sCategory;
		lblCategory.innerHTML = sCategory;
	}
};
YAHOO.widget.LogReader.prototype._createSourceCheckbox = function(sSource) {
	var oSelf = this;
	if (this._elFt) {
		var elParent = this._elSourceFilters;
		var filters = this._sourceFilters;
		var elFilter = elParent.appendChild(document.createElement("span"));
		elFilter.className = "yui-log-filtergrp";
		var chkSource = document.createElement("input");
		chkSource.id = "yui-log-filter" + sSource + this._sName;
		chkSource.className = "yui-log-filter" + sSource;
		chkSource.type = "checkbox";
		chkSource.source = sSource;
		chkSource = elFilter.appendChild(chkSource);
		chkSource.checked = true;
		filters.push(sSource);
		YAHOO.util.Event.addListener(chkSource, 'click', oSelf._onCheckSource,
				oSelf);
		var lblSource = elFilter.appendChild(document.createElement("label"));
		lblSource.htmlFor = chkSource.id;
		lblSource.className = sSource;
		lblSource.innerHTML = sSource;
	}
};
YAHOO.widget.LogReader.prototype._filterLogs = function() {
	if (this._elConsole !== null) {
		this._clearConsole();
		this._printToConsole(YAHOO.widget.Logger.getStack());
	}
};
YAHOO.widget.LogReader.prototype._clearConsole = function() {
	this._timeout = null;
	this._buffer = [];
	this._consoleMsgCount = 0;
	this._lastTime = YAHOO.widget.Logger.getStartTime();
	var elConsole = this._elConsole;
	while (elConsole.hasChildNodes()) {
		elConsole.removeChild(elConsole.firstChild);
	}
};
YAHOO.widget.LogReader.prototype._printBuffer = function() {
	this._timeout = null;
	if (this._elConsole !== null) {
		var thresholdMax = this.thresholdMax;
		thresholdMax = (thresholdMax && !isNaN(thresholdMax)) ? thresholdMax
				: 500;
		if (this._consoleMsgCount < thresholdMax) {
			var entries = [];
			for ( var i = 0; i < this._buffer.length; i++) {
				entries[i] = this._buffer[i];
			}
			this._buffer = [];
			this._printToConsole(entries);
		} else {
			this._filterLogs();
		}
		if (!this.newestOnTop) {
			this._elConsole.scrollTop = this._elConsole.scrollHeight;
		}
	}
};
YAHOO.widget.LogReader.prototype._printToConsole = function(aEntries) {
	var entriesLen = aEntries.length;
	var thresholdMin = this.thresholdMin;
	if (isNaN(thresholdMin) || (thresholdMin > this.thresholdMax)) {
		thresholdMin = 0;
	}
	var entriesStartIndex = (entriesLen > thresholdMin) ? (entriesLen - thresholdMin)
			: 0;
	var sourceFiltersLen = this._sourceFilters.length;
	var categoryFiltersLen = this._categoryFilters.length;
	for ( var i = entriesStartIndex; i < entriesLen; i++) {
		var okToPrint = false;
		var okToFilterCats = false;
		var entry = aEntries[i];
		var source = entry.source;
		var category = entry.category;
		for ( var j = 0; j < sourceFiltersLen; j++) {
			if (source == this._sourceFilters[j]) {
				okToFilterCats = true;
				break;
			}
		}
		if (okToFilterCats) {
			for ( var k = 0; k < categoryFiltersLen; k++) {
				if (category == this._categoryFilters[k]) {
					okToPrint = true;
					break;
				}
			}
		}
		if (okToPrint) {
			var output = this.formatMsg(entry);
			var container = (this.verboseOutput) ? "CODE" : "PRE";
			var oNewElement = (this.newestOnTop) ? this._elConsole
					.insertBefore(document.createElement(container),
							this._elConsole.firstChild) : this._elConsole
					.appendChild(document.createElement(container));
			oNewElement.innerHTML = output;
			this._consoleMsgCount++;
			this._lastTime = entry.time.getTime();
		}
	}
};
YAHOO.widget.LogReader.prototype._onCategoryCreate = function(sType, aArgs,
		oSelf) {
	var category = aArgs[0];
	if (oSelf._elFt) {
		oSelf._createCategoryCheckbox(category);
	}
};
YAHOO.widget.LogReader.prototype._onSourceCreate = function(sType, aArgs, oSelf) {
	var source = aArgs[0];
	if (oSelf._elFt) {
		oSelf._createSourceCheckbox(source);
	}
};
YAHOO.widget.LogReader.prototype._onCheckCategory = function(v, oSelf) {
	var newFilter = this.category;
	var filtersArray = oSelf._categoryFilters;
	if (!this.checked) {
		for ( var i = 0; i < filtersArray.length; i++) {
			if (newFilter == filtersArray[i]) {
				filtersArray.splice(i, 1);
				break;
			}
		}
	} else {
		filtersArray.push(newFilter);
	}
	oSelf._filterLogs();
};
YAHOO.widget.LogReader.prototype._onCheckSource = function(v, oSelf) {
	var newFilter = this.source;
	var filtersArray = oSelf._sourceFilters;
	if (!this.checked) {
		for ( var i = 0; i < filtersArray.length; i++) {
			if (newFilter == filtersArray[i]) {
				filtersArray.splice(i, 1);
				break;
			}
		}
	} else {
		filtersArray.push(newFilter);
	}
	oSelf._filterLogs();
};
YAHOO.widget.LogReader.prototype._onClickCollapseBtn = function(v, oSelf) {
	if (!oSelf.isCollapsed) {
		oSelf.collapse();
	} else {
		oSelf.expand();
	}
};
YAHOO.widget.LogReader.prototype._onClickPauseBtn = function(v, oSelf) {
	var btn = oSelf._btnPause;
	if (btn.value == "Resume") {
		oSelf.resume();
		btn.value = "Pause";
	} else {
		oSelf.pause();
		btn.value = "Resume";
	}
};
YAHOO.widget.LogReader.prototype._onClickClearBtn = function(v, oSelf) {
	oSelf._clearConsole();
};
YAHOO.widget.LogReader.prototype._onNewLog = function(sType, aArgs, oSelf) {
	var logEntry = aArgs[0];
	oSelf._buffer.push(logEntry);
	if (oSelf.logReaderEnabled === true && oSelf._timeout === null) {
		oSelf._timeout = setTimeout(function() {
			oSelf._printBuffer();
		}, 100);
	}
};
YAHOO.widget.LogReader.prototype._onReset = function(sType, aArgs, oSelf) {
	oSelf._filterLogs();
};
YAHOO.widget.Logger = {
	loggerEnabled : true,
	_browserConsoleEnabled : false,
	categories : [ "info", "warn", "error", "time", "window" ],
	sources : [ "global" ],
	_stack : [],
	maxStackEntries : 2500,
	_startTime : new Date().getTime(),
	_lastTime : null
};
YAHOO.widget.Logger.log = function(sMsg, sCategory, sSource) {
	if (this.loggerEnabled) {
		if (!sCategory) {
			sCategory = "info";
		} else {
			sCategory = sCategory.toLocaleLowerCase();
			if (this._isNewCategory(sCategory)) {
				this._createNewCategory(sCategory);
			}
		}
		var sClass = "global";
		var sDetail = null;
		if (sSource) {
			var spaceIndex = sSource.indexOf(" ");
			if (spaceIndex > 0) {
				sClass = sSource.substring(0, spaceIndex);
				sDetail = sSource.substring(spaceIndex, sSource.length);
			} else {
				sClass = sSource;
			}
			if (this._isNewSource(sClass)) {
				this._createNewSource(sClass);
			}
		}
		var timestamp = new Date();
		var logEntry = new YAHOO.widget.LogMsg({
			msg : sMsg,
			time : timestamp,
			category : sCategory,
			source : sClass,
			sourceDetail : sDetail
		});
		var stack = this._stack;
		var maxStackEntries = this.maxStackEntries;
		if (maxStackEntries && !isNaN(maxStackEntries)
				&& (stack.length >= maxStackEntries)) {
			stack.shift();
		}
		stack.push(logEntry);
		this.newLogEvent.fire(logEntry);
		if (this._browserConsoleEnabled) {
			this._printToBrowserConsole(logEntry);
		}
		return true;
	} else {
		return false;
	}
};
YAHOO.widget.Logger.reset = function() {
	this._stack = [];
	this._startTime = new Date().getTime();
	this.loggerEnabled = true;
	this.log("Logger reset");
	this.logResetEvent.fire();
};
YAHOO.widget.Logger.getStack = function() {
	return this._stack;
};
YAHOO.widget.Logger.getStartTime = function() {
	return this._startTime;
};
YAHOO.widget.Logger.disableBrowserConsole = function() {
	YAHOO.log("Logger output to the function console.log() has been disabled.");
	this._browserConsoleEnabled = false;
};
YAHOO.widget.Logger.enableBrowserConsole = function() {
	this._browserConsoleEnabled = true;
	YAHOO.log("Logger output to the function console.log() has been enabled.");
};
YAHOO.widget.Logger.categoryCreateEvent = new YAHOO.util.CustomEvent(
		"categoryCreate", this, true);
YAHOO.widget.Logger.sourceCreateEvent = new YAHOO.util.CustomEvent(
		"sourceCreate", this, true);
YAHOO.widget.Logger.newLogEvent = new YAHOO.util.CustomEvent("newLog", this,
		true);
YAHOO.widget.Logger.logResetEvent = new YAHOO.util.CustomEvent("logReset",
		this, true);
YAHOO.widget.Logger._createNewCategory = function(sCategory) {
	this.categories.push(sCategory);
	this.categoryCreateEvent.fire(sCategory);
};
YAHOO.widget.Logger._isNewCategory = function(sCategory) {
	for ( var i = 0; i < this.categories.length; i++) {
		if (sCategory == this.categories[i]) {
			return false;
		}
	}
	return true;
};
YAHOO.widget.Logger._createNewSource = function(sSource) {
	this.sources.push(sSource);
	this.sourceCreateEvent.fire(sSource);
};
YAHOO.widget.Logger._isNewSource = function(sSource) {
	if (sSource) {
		for ( var i = 0; i < this.sources.length; i++) {
			if (sSource == this.sources[i]) {
				return false;
			}
		}
		return true;
	}
};
YAHOO.widget.Logger._printToBrowserConsole = function(oEntry) {
	if (window.console && console.log) {
		var category = oEntry.category;
		var label = oEntry.category.substring(0, 4).toUpperCase();
		var time = oEntry.time;
		if (time.toLocaleTimeString) {
			var localTime = time.toLocaleTimeString();
		} else {
			localTime = time.toString();
		}
		var msecs = time.getTime();
		var elapsedTime = (YAHOO.widget.Logger._lastTime) ? (msecs - YAHOO.widget.Logger._lastTime)
				: 0;
		YAHOO.widget.Logger._lastTime = msecs;
		var output = localTime + " (" + elapsedTime + "ms): " + oEntry.source
				+ ": " + oEntry.msg;
		console.log(output);
	}
};
YAHOO.widget.Logger._onWindowError = function(sMsg, sUrl, sLine) {
	try {
		YAHOO.widget.Logger.log(sMsg + ' (' + sUrl + ', line ' + sLine + ')',
				"window");
		if (YAHOO.widget.Logger._origOnWindowError) {
			YAHOO.widget.Logger._origOnWindowError();
		}
	} catch (e) {
		return false;
	}
};
if (window.onerror) {
	YAHOO.widget.Logger._origOnWindowError = window.onerror;
}
window.onerror = YAHOO.widget.Logger._onWindowError;
YAHOO.widget.Logger.log("Logger initialized");
YAHOO.register("logger", YAHOO.widget.Logger, {
	version : "2.2.0",
	build : "127"
});