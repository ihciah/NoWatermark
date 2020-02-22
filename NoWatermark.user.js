// ==UserScript==
// @name         No watermark
// @namespace    https://github.com/ihciah/
// @version      0.1.0
// @description  Remove the watermark for Bytedancer
// @author       ihciah
// @match        https://*.bytedance.net/*
// @match        https://*.feishu.cn/*
// @grant        none
// ==/UserScript==

function traverseByDFS(domRoot) {
    var child = domRoot.firstElementChild;
    while(child) {
        setNodeTransparent(child);
		traverseByDFS(child);
        child = child.nextElementSibling;
    }
}

function setNodeTransparent(node) {
    if (validateNode(node)) {
        //node.background = '';
        let classes = node.className.split(" ")
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].length == 0) {continue;}
            let sheet = new CSSStyleSheet();
            sheet.replaceSync(`.${classes[i]} {opacity: 0}`);
            document.adoptedStyleSheets = [sheet];
            console.log(`[NoWatermark] Element .${classes[i]} has been set transparent!`);
        }
    }
}


function validateNode(node) {
    let ret = false;
    // Only process nodes with className.
    if (!node || typeof(node.className) != 'string'){
        return false;
    }

    // Do not process avatar and icon nodes.
    const whiteList = ['avatar', 'icon', 'lode-more', 'suite-body', 'flex', 'layout-column', 'banner'];
    for (let i = 0; i < whiteList.length; i++) {
        if (node.className.includes(whiteList[i])) {return false;}
    }

    // Images start with 'url("data:image/png' or 'url("data:image/svg+xml' is treated as watermark.
    let bgImg = getComputedStyle(node).backgroundImage;
    if (typeof(bgImg) === 'string' && bgImg.startsWith('url("data:image/png') || bgImg.startsWith('url("data:image/svg+xml')) {
        ret = true;
    }

    // Images with repeat property is treated as watermark.
    let bg = getComputedStyle(node).background;
    if (typeof(bg) === 'string' && bg.includes('repeat') && !bg.includes('none repeat') && !bg.includes('banner')) {
        ret = true;
    }
    return ret;
}

(function() {
    'use strict';

    const callback = function(mutationsList, observer) {
        traverseByDFS(document.body);
    }
    const observer = new MutationObserver(callback);

    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(document.body, config);
})();