/* eslint-disable */

/**
 * Generated by Verge3D Puzzles v.4.9.2
 * Tue, 22 Apr 2025 20:11:32 GMT
 * Prefer not editing this file as your changes may get overridden once Puzzles are saved.
 * Check out https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for the information on how to add your own JavaScript to Verge3D apps.
 */
function createPL(v3d = window.v3d) {

// global variables used in the init tab
const _initGlob = {
    percentage: 0,
    output: {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        },
    },
};


// global variables/constants used by puzzles' functions
var _pGlob = {};

_pGlob.objCache = new Map();
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.openedFileMeta = {};
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};
_pGlob.customEvents = new v3d.EventDispatcher();
_pGlob.eventListeners = [];
_pGlob.htmlElements = new Set();
_pGlob.materialsCache = new Map();

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster(); // always check visibility

const createPzLib = ({ v3d=null, appInstance=null }) => {
    function getMaterialEditableColors(matName) {
        const mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
        if (!mat) {
            return [];
        }
    
        if (mat.isMeshNodeMaterial) {
            return Object.keys(mat.nodeRGBMap);
        } else if (mat.isMeshStandardMaterial) {
            return ['color', 'emissive'];
        } else if (mat.isMeshLineMaterial) {
            return ['color'];
        } else {
            return [];
        }
    }
        
    function transformCoordsSpace(coords, spaceFrom, spaceTo, noSignChange=false) {
    
        if (spaceFrom === spaceTo) {
            return coords;
        }
    
        const y = coords.y;
        const z = coords.z;
    
        if (spaceFrom === 'Z_UP_RIGHT' && spaceTo === 'Y_UP_RIGHT') {
            coords.y = z;
            coords.z = noSignChange ? y : -y;
        } else if (spaceFrom === 'Y_UP_RIGHT' && spaceTo === 'Z_UP_RIGHT') {
            coords.y = noSignChange ? z : -z;
            coords.z = y;
        } else {
            console.error('transformCoordsSpace: Unsupported coordinate space');
        }
    
        return coords;
    }
        
    function getSceneCoordSystem() {
        const scene = appInstance.scene;
        if (scene && 'coordSystem' in scene.userData) {
            return scene.userData.coordSystem;
        }
    
        return 'Y_UP_RIGHT';
    }
        
    function isObjectWorthProcessing(obj) {
        return obj.name !== '' &&
                !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
                !obj.isAuxClippingMesh;
    }
        
    function getObjectByName(objName) {
        let objFound = null;
    
        const pGlobAvailable = _pGlob !== undefined;
        if (pGlobAvailable)
            objFound = _pGlob.objCache.get(objName);
    
        if (objFound && objFound.name === objName)
            return objFound;
    
        function findValidByName(obj, objName) {
            if (obj.name === objName && isObjectWorthProcessing(obj))
                return obj;
    
            for (let i = 0; i < obj.children.length; i++) {
                const child = obj.children[i];
                const object = findValidByName(child, objName);
                if (object !== null)
                    return object;
            }
    
            return null;
        }
    
        if (appInstance.scene) {
            objFound = findValidByName(appInstance.scene, objName);
            if (objFound && pGlobAvailable)
                _pGlob.objCache.set(objName, objFound);
        }
    
        return objFound;
    }
        
    function areListenersSame(target0, type0, listener0, optionsOrUseCapture0,
            target1, type1, listener1, optionsOrUseCapture1) {
        const capture0 = Boolean(optionsOrUseCapture0 instanceof Object
                ? optionsOrUseCapture0.capture : optionsOrUseCapture0);
        const capture1 = Boolean(optionsOrUseCapture1 instanceof Object
                ? optionsOrUseCapture1.capture : optionsOrUseCapture1);
        return target0 === target1 && type0 === type1 && listener0 === listener1
                && capture0 === capture1;
    }
        
    function bindListener(target, type, listener, optionsOrUseCapture) {
        const alreadyExists = _pGlob.eventListeners.some(elem => {
            return areListenersSame(elem.target, elem.type, elem.listener,
                    elem.optionsOrUseCapture, target, type, listener,
                    optionsOrUseCapture);
        });
    
        if (!alreadyExists) {
            target.addEventListener(type, listener, optionsOrUseCapture);
            _pGlob.eventListeners.push({ target, type, listener,
                    optionsOrUseCapture });
        }
    }
        
    function getSceneAnimFrameRate(scene) {
        if (scene && 'animFrameRate' in scene.userData) {
            return scene.userData.animFrameRate;
        }
        return 24;
    }
        
    function getSceneByAction(action) {
        const root = action.getRoot();
        let scene = root.type === 'Scene' ? root : null;
        root.traverseAncestors(ancObj => {
            if (ancObj.type === 'Scene') {
                scene = ancObj;
            }
        });
        return scene;
    }
        
    function getObjectName(obj) {
        // auto-generated from a multi-material object, use parent name instead
        if (obj.isMesh && obj.isMaterialGeneratedMesh && obj.parent) {
            return obj.parent.name;
        } else {
            return obj.name;
        }
    }
        
    function initObjectPicking(callback, eventType, mouseDownUseTouchStart=false,
            allowedMouseButtons=null) {
    
        const elem = appInstance.renderer.domElement;
        bindListener(elem, eventType, pickListener);
    
        if (eventType === 'mousedown') {
    
            const touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
            bindListener(elem, touchEventName, pickListener);
    
        } else if (eventType === 'dblclick') {
    
            let prevTapTime = 0;
    
            function doubleTapCallback(event) {
                const now = new Date().getTime();
                const timesince = now - prevTapTime;
    
                if (timesince < 600 && timesince > 0) {
                    pickListener(event);
                    prevTapTime = 0;
                    return;
                }
    
                prevTapTime = new Date().getTime();
            }
    
            const touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
            bindListener(elem, touchEventName, doubleTapCallback);
        }
    
        const raycaster = new v3d.Raycaster();
    
        function pickListener(event) {
    
            // to handle unload in loadScene puzzle
            if (!appInstance.getCamera()) {
                return;
            }
    
            event.preventDefault();
    
            let xNorm = 0;
            let yNorm = 0;
            if (event instanceof MouseEvent) {
                if (allowedMouseButtons !== null && allowedMouseButtons.indexOf(event.button) === -1) {
                    return;
                }
                xNorm = event.offsetX / elem.clientWidth;
                yNorm = event.offsetY / elem.clientHeight;
            } else if (event instanceof TouchEvent) {
                const rect = elem.getBoundingClientRect();
                xNorm = (event.changedTouches[0].clientX - rect.left) / rect.width;
                yNorm = (event.changedTouches[0].clientY - rect.top) / rect.height;
            }
    
            _pGlob.screenCoords.x = xNorm * 2 - 1;
            _pGlob.screenCoords.y = -yNorm * 2 + 1;
            raycaster.setFromCamera(_pGlob.screenCoords, appInstance.getCamera(true));
    
            const objList = [];
            appInstance.scene.traverse(obj => objList.push(obj));
    
            const intersects = raycaster.intersectObjects(objList, false);
            callback(intersects, event);
        }
    }
        
    function isObjectAmongObjects(objNameToCheck, objNames) {
        if (!objNameToCheck) {
            return false;
        }
    
        for (let i = 0; i < objNames.length; i++) {
            if (objNameToCheck === objNames[i]) {
                return true;
            } else {
                // also check children which are auto-generated for multi-material objects
                const obj = getObjectByName(objNames[i]);
                if (obj && obj.type === 'Group') {
                    for (let j = 0; j < obj.children.length; j++) {
                        if (objNameToCheck === obj.children[j].name) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
        
    function getObjectNamesByGroupName(groupName) {
        const objNameList = [];
        appInstance.scene.traverse(obj => {
            if (isObjectWorthProcessing(obj)) {
                const objGroupNames = obj.groupNames;
                if (!objGroupNames) {
                    return;
                }
    
                for (let i = 0; i < objGroupNames.length; i++) {
                    const objGroupName = objGroupNames[i];
                    if (objGroupName === groupName) {
                        objNameList.push(obj.name);
                    }
                }
            }
        });
        return objNameList;
    }
        
    function getAllObjectNames() {
        const objNameList = [];
        appInstance.scene.traverse(obj => {
            if (isObjectWorthProcessing(obj)) {
                objNameList.push(obj.name);
            }
        });
        return objNameList;
    }
        
    function retrieveObjectNamesAccum(currObjNames, namesAccum) {
        if (typeof currObjNames === 'string') {
            namesAccum.push(currObjNames);
        } else if (Array.isArray(currObjNames) && currObjNames[0] === 'GROUP') {
            const newObjNames = getObjectNamesByGroupName(currObjNames[1]);
            for (let i = 0; i < newObjNames.length; i++) {
                namesAccum.push(newObjNames[i]);
            }
        } else if (Array.isArray(currObjNames) && currObjNames[0] === 'ALL_OBJECTS') {
            const newObjNames = getAllObjectNames();
            for (let i = 0; i < newObjNames.length; i++) {
                namesAccum.push(newObjNames[i]);
            }
        } else if (Array.isArray(currObjNames)) {
            for (let i = 0; i < currObjNames.length; i++) {
                retrieveObjectNamesAccum(currObjNames[i], namesAccum);
            }
        }
    }
        
    function retrieveObjectNames(objNames) {
        const accum = [];
        retrieveObjectNamesAccum(objNames, accum);
        return accum.filter(name => name !== '');
    }

    return {
        getMaterialEditableColors, transformCoordsSpace, getSceneCoordSystem, getObjectByName,
        bindListener, getSceneAnimFrameRate, getSceneByAction, getObjectName,
        initObjectPicking, isObjectAmongObjects, retrieveObjectNames,
    };
};

var PL = {};



// backward compatibility
if (v3d[Symbol.toStringTag] !== 'Module') {
    v3d.PL = v3d.puzzles = PL;
}

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    const PzLib = createPzLib({ v3d });

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    
    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

const PzLib = createPzLib({ v3d, appInstance });

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}



// toFixedPoint puzzle
function toFixedPoint(num, prec) {
    prec = Math.pow(10, prec);
    return Math.round(num * prec)/prec;
}

// getMaterialColor puzzle
function getMaterialColor(matName, colName, coord) {

    var colors = PzLib.getMaterialEditableColors(matName);
    if (colors.indexOf(colName) < 0)
        return;

    var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);

    if (mats.length) {

        var mat = mats[0];
        var color = _pGlob.colorTmp;

        if (mat.isMeshNodeMaterial) {
            var rgbIdx = mat.nodeRGBMap[colName];

            color.r = mat.nodeRGB[rgbIdx].x;
            color.g = mat.nodeRGB[rgbIdx].y;
            color.b = mat.nodeRGB[rgbIdx].z;

        } else {

            color.copy(mat[colName]);

        }

        switch (coord) {
            case 'R':
            case 'G':
            case 'B':
                return color[coord.toLowerCase()];
                break;
            case 'RGB':
                return color.toArray();
                break;
            case 'CSS_HEX':
            case 'CSS_RGB':
                if (coord == 'CSS_HEX')
                    return '#' + color.getHexString();
                else
                    return color.getStyle();
                break;
        }
    }

}

// getColorFromValues puzzle
function getColorFromValues(r, g, b, a) {
    const color = _pGlob.colorTmp.setRGB(r, g, b);
    let colorStyle = color.getStyle();

    if (a != 1) {
        colorStyle = colorStyle.replace('rgb', 'rgba');
        colorStyle = colorStyle.replace(')', ',' + a + ')');
    }

    return colorStyle;
}

// setMaterialColor puzzle
function setMaterialColor(matName, colName, r, g, b, cssCode) {

    var colors = PzLib.getMaterialEditableColors(matName);

    if (colors.indexOf(colName) < 0)
        return;

    if (cssCode) {
        var color = new v3d.Color(cssCode);
        r = color.r;
        g = color.g;
        b = color.b;
    }

    var mats = v3d.SceneUtils.getMaterialsByName(appInstance, matName);

    for (var i = 0; i < mats.length; i++) {
        var mat = mats[i];

        if (mat.isMeshNodeMaterial) {
            var rgbIdx = mat.nodeRGBMap[colName];
            mat.nodeRGB[rgbIdx].x = r;
            mat.nodeRGB[rgbIdx].y = g;
            mat.nodeRGB[rgbIdx].z = b;
        } else {
            mat[colName].r = r;
            mat[colName].g = g;
            mat[colName].b = b;
        }

        // COMPAT: <4.9.0
        if (v3d.engineVersionCmp('4.9.0', v3d.REVISION) < 0)
            mat.needsUpdate = true;

        if (appInstance.scene !== null) {
            if (mat === appInstance.scene.worldMaterial) {
                appInstance.updateEnvironment(mat);
            }
        }
    }
}

// tweenCamera puzzle
function tweenCamera(posOrObj, targetOrObj, duration, doSlot, movementType) {
    var camera = appInstance.getCamera();

    if (Array.isArray(posOrObj)) {
        var worldPos = _pGlob.vec3Tmp.fromArray(posOrObj);
        worldPos = PzLib.transformCoordsSpace(worldPos,
                PzLib.getSceneCoordSystem(), 'Y_UP_RIGHT');
    } else if (posOrObj) {
        var posObj = PzLib.getObjectByName(posOrObj);
        if (!posObj) return;
        var worldPos = posObj.getWorldPosition(_pGlob.vec3Tmp);
    } else {
        // empty input means: don't change the position
        var worldPos = camera.getWorldPosition(_pGlob.vec3Tmp);
    }

    if (Array.isArray(targetOrObj)) {
        var worldTarget = _pGlob.vec3Tmp2.fromArray(targetOrObj);
        worldTarget = PzLib.transformCoordsSpace(worldTarget,
                PzLib.getSceneCoordSystem(), 'Y_UP_RIGHT');
    } else {
        var targObj = PzLib.getObjectByName(targetOrObj);
        if (!targObj) return;
        var worldTarget = targObj.getWorldPosition(_pGlob.vec3Tmp2);
    }

    duration = Math.max(0, duration);

    if (appInstance.controls && appInstance.controls.tween) {
        // orbit and flying cameras
        if (!appInstance.controls.inTween) {
            appInstance.controls.tween(worldPos, worldTarget, duration, doSlot,
                    movementType);
        }
    } else {
        // TODO: static camera, just position it for now
        if (camera.parent) {
            camera.parent.worldToLocal(worldPos);
        }
        camera.position.copy(worldPos);
        camera.lookAt(worldTarget);
        doSlot();
    }
}

// isAnimationPlaying puzzle
function isAnimationPlaying(animations) {
    if (!animations)
        return;
    // input can be either single obj or array of objects
    if (typeof animations == "string")
        animations = [animations];
    for (let i = 0; i < animations.length; i++) {
        const animName = animations[i];
        if (!animName)
            continue;
        const action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (action && action.isRunning())
            return true;
    }
    return false;
}

_pGlob.animMixerCallbacks = [];

var initAnimationMixer = function() {

    function onMixerFinished(e) {
        var cb = _pGlob.animMixerCallbacks;
        var found = [];
        for (var i = 0; i < cb.length; i++) {
            if (cb[i][0] == e.action) {
                cb[i][0] = null; // desactivate
                found.push(cb[i][1]);
            }
        }
        for (var i = 0; i < found.length; i++) {
            found[i]();
        }
    }

    return function initAnimationMixer() {
        if (appInstance.mixer && !appInstance.mixer.hasEventListener('finished', onMixerFinished)) {
            PzLib.bindListener(appInstance.mixer, 'finished', onMixerFinished);
        }
    };

}();

// animation puzzles
function operateAnimation(operation, animations, from, to, loop, speed, callback, rev) {
    if (!animations)
        return;
    // input can be either single obj or array of objects
    if (typeof animations == "string")
        animations = [animations];

    function processAnimation(animName) {
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (!action)
            return;
        switch (operation) {
        case 'PLAY':
            if (!action.isRunning()) {
                action.reset();
                if (loop && (loop != "AUTO"))
                    action.loop = v3d[loop];
                var scene = PzLib.getSceneByAction(action);
                var frameRate = PzLib.getSceneAnimFrameRate(scene);

                action.repetitions = Infinity;

                var timeScale = Math.abs(parseFloat(speed));
                if (rev)
                    timeScale *= -1;

                action.timeScale = timeScale;
                action.timeStart = from !== null ? from/frameRate : 0;
                if (to !== null) {
                    action.getClip().duration = to/frameRate;
                } else {
                    action.getClip().resetDuration();
                }
                action.time = timeScale >= 0 ? action.timeStart : action.getClip().duration;

                action.paused = false;
                action.play();

                // push unique callbacks only
                var callbacks = _pGlob.animMixerCallbacks;
                var found = false;

                for (var j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == action && callbacks[j][1] == callback)
                        found = true;

                if (!found)
                    _pGlob.animMixerCallbacks.push([action, callback]);
            }
            break;
        case 'STOP':
            action.stop();

            // remove callbacks
            var callbacks = _pGlob.animMixerCallbacks;
            for (var j = 0; j < callbacks.length; j++)
                if (callbacks[j][0] == action) {
                    callbacks.splice(j, 1);
                    j--
                }

            break;
        case 'PAUSE':
            action.paused = true;
            break;
        case 'RESUME':
            action.paused = false;
            break;
        case 'SET_FRAME':
            var scene = PzLib.getSceneByAction(action);
            var frameRate = PzLib.getSceneAnimFrameRate(scene);
            action.time = from ? from/frameRate : 0;
            action.play();
            action.paused = true;
            break;
        case 'SET_SPEED':
            var timeScale = parseFloat(speed);
            action.timeScale = rev ? -timeScale : timeScale;
            break;
        }
    }

    for (var i = 0; i < animations.length; i++) {
        var animName = animations[i];
        if (animName)
            processAnimation(animName);
    }

    initAnimationMixer();
}

// whenClicked puzzle
function registerOnClick(objSelector, xRay, doubleClick, mouseButtons, cbDo, cbIfMissedDo) {

    // for AR/VR
    _pGlob.objClickInfo = _pGlob.objClickInfo || [];

    _pGlob.objClickInfo.push({
        objSelector: objSelector,
        callbacks: [cbDo, cbIfMissedDo]
    });

    PzLib.initObjectPicking(function(intersects, event) {

        var isPicked = false;

        var maxIntersects = xRay ? intersects.length : Math.min(1, intersects.length);

        for (var i = 0; i < maxIntersects; i++) {
            var obj = intersects[i].object;
            var objName = PzLib.getObjectName(obj);
            var objNames = PzLib.retrieveObjectNames(objSelector);

            if (PzLib.isObjectAmongObjects(objName, objNames)) {
                // save the object for the pickedObject block
                _pGlob.pickedObject = objName;
                isPicked = true;
                cbDo(event);
            }
        }

        if (!isPicked) {
            _pGlob.pickedObject = '';
            cbIfMissedDo(event);
        }

    }, doubleClick ? 'dblclick' : 'mousedown', false, mouseButtons);
}


toFixedPoint('', 0.1);

window.prompt('');

false ? null : null;

registerOnClick('Cube.025', false, false, [0,1,2], function() {
  console.log(String(getMaterialColor('Material.008', 'Principled BSDF Color', 'CSS_HEX')) + '');
  if (getMaterialColor('Material.008', 'Principled BSDF Color', 'CSS_RGB') <= getColorFromValues(0.9, 0.9, 0.9, 1)) {
    setMaterialColor('Material.008', 'Principled BSDF Color', 0, 0, 0, getColorFromValues(1, 1, 1, 1));
    tweenCamera('', 'Cube', 1, function() {}, 0);
  } else {
    setMaterialColor('Material.008', 'Principled BSDF Color', 0, 0, 0, getColorFromValues(0.8, 0, 0, 1));
    tweenCamera('', 'Cube.025', 1, function() {}, 0);
  }
  if (isAnimationPlaying('Cube')) {

    operateAnimation('PAUSE', 'Cube', null, null, 'AUTO', 1,
            function() {}, false);

        } else {

    operateAnimation('RESUME', 'Cube', null, null, 'AUTO', 1,
            function() {}, false);

        }
}, function() {});



} // end of PL.init function

PL.disposeListeners = function() {
    if (_pGlob) {
        _pGlob.eventListeners.forEach(({ target, type, listener, optionsOrUseCapture }) => {
            target.removeEventListener(type, listener, optionsOrUseCapture);
        });
        _pGlob.eventListeners.length = 0;
    }
}

PL.disposeHTMLElements = function() {
    if (_pGlob) {
        _pGlob.htmlElements.forEach(elem => {
            elem.remove();
        });
        _pGlob.htmlElements.clear();
    }
}

PL.disposeMaterialsCache = function() {
    if (_pGlob) {
        for (const mat of _pGlob.materialsCache.values()) {
            mat.dispose();
        }
        _pGlob.materialsCache.clear();
    }
}

PL.dispose = function() {
    PL.disposeListeners();
    PL.disposeHTMLElements();
    PL.disposeMaterialsCache();
    _pGlob = null;
    // backward compatibility
    if (v3d[Symbol.toStringTag] !== 'Module') {
        delete v3d.PL;
        delete v3d.puzzles;
    }
}



return PL;

}

export { createPL };
