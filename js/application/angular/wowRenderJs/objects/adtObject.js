import mathHelper from './../math/mathHelper.js';

class ADTObject {
    constructor(sceneApi, wdtFile) {
        this.sceneApi = sceneApi;
        this.drawChunk = new Array(256);
        this.aabbs = [];
        this.m2Array = null;
        this.wmoArray = null;
        this.postLoadExecuted = false;

        for (var i = 0; i < 256; i++) {
            this.drawChunk[i] = true;
        }

        this.textureArray = new Array(255);
        for (var i = 0; i < 256; i++) {
            this.textureArray[i] = [];
        }
    }
    getMCNKCameraIsOn(cameraVec4){
        if (!this.adtGeom) return null;
        var adtFile = this.adtGeom.adtFile;

        for (var i = 0; i < 256; i++) {
            var mcnk = adtFile.mcnkObjs[i];
            var aabb = this.aabbs[i];
            this.drawChunk[i] = false;
            if (!aabb) continue;

            //1. Check if camera position is inside Bounding Box
            var cameraOnChunk =
                (cameraVec4[0] > aabb[0][0] && cameraVec4[0] < aabb[1][0] &&
                cameraVec4[1] > aabb[0][1] && cameraVec4[1] < aabb[1][1]);
            if (cameraOnChunk ) {
                return mcnk;
            }
        }
        return null;
    }

    checkFrustumCulling (cameraVec4, frustumPlanes, num_planes, frustumPoints, hullLines, lookAtMat4, m2ObjectsCandidates, wmoCandidates) {
        if (!this.adtGeom) return false;
        var adtFile = this.adtGeom.adtFile;
        var objAdtFile = this.adtGeom.objAdt;
        var atLeastOneIsDrawn = false;

        if (this.adtGeom.loaded && !this.postLoadExecuted) {
            this.calcBoundingBoxes();
            this.loadTextures();
            this.loadM2s();
            this.loadWmos();

            this.postLoadExecuted = true;
        }

        for (var i = 0; i < 256; i++) {
            var mcnk = adtFile.mcnkObjs[i];
            var aabb = this.aabbs[i];
            this.drawChunk[i] = false;
            if (!aabb) continue;

            //1. Check if camera position is inside Bounding Box
            var cameraOnChunk =
                (cameraVec4[0] > aabb[0][0] && cameraVec4[0] < aabb[1][0] &&
                cameraVec4[1] > aabb[0][1] && cameraVec4[1] < aabb[1][1]) ;
            if (
                cameraOnChunk &&
                cameraVec4[2] > aabb[0][2] && cameraVec4[2] < aabb[1][2]
            ) {
                this.drawChunk[i] = true;
                atLeastOneIsDrawn = true;
            }


            //2. Check aabb is inside camera frustum
            var result = false;
            var checkRefs = this.drawChunk[i];
            if (!this.drawChunk[i]) {
                result = mathHelper.checkFrustum(frustumPlanes, aabb, num_planes, frustumPoints);
                checkRefs = result || mathHelper.checkFrustum2D(hullLines, aabb, hullLines.length, null);

                this.drawChunk[i] = result;
                atLeastOneIsDrawn = atLeastOneIsDrawn || result ;
            }
            if (checkRefs) {
                var mcnk = objAdtFile.mcnkObjs[i];

                if (mcnk && mcnk.m2Refs) {
                    for (var j = 0; j < mcnk.m2Refs.length; j++) {
                        var m2Ref = mcnk.m2Refs[j];
                        m2ObjectsCandidates.add(this.m2Array[m2Ref])
                    }
                }
                if (this.wmoArray && mcnk && mcnk.wmoRefs) {
                    for (var j = 0; j < mcnk.wmoRefs.length; j++) {
                        var wmoRef = mcnk.wmoRefs[j];
                        wmoCandidates.add(this.wmoArray[wmoRef])
                    }
                }
            }
        }

        return atLeastOneIsDrawn;
    }

    calcBoundingBoxes() {
        var aabbs = new Array(256);
        var adtFile = this.adtGeom.adtFile;
        for(var i = 0 ; i < 256; i++) {
            var mcnk = adtFile.mcnkObjs[i];

            //Loop over heights
            var minZ = 999999;
            var maxZ = -999999;
            for (var j = 0; j < mcnk.heights.length; j++) {
                var heightVal = mcnk.heights[j];
                if (minZ > heightVal) minZ = heightVal;
                if (maxZ < heightVal) maxZ = heightVal;
            }

            var minX = mcnk.pos.x - (533.3433333 / 16.0);
            var maxX = mcnk.pos.x;
            var minY = mcnk.pos.y - (533.3433333 / 16.0);
            var maxY = mcnk.pos.y;
            minZ += mcnk.pos.z;
            maxZ += mcnk.pos.z;

            aabbs[i] = [[minX, minY, minZ], [maxX, maxY, maxZ]];
        }

        this.aabbs = aabbs;
    }

    loadM2s() {
        var self = this;
        var m2Positions = this.adtGeom.objAdt.mddf;
        if (!m2Positions) return;

        this.m2Array = new Array(m2Positions.length);
        for (var i = 0; i < m2Positions.length; i++) {
            var doodad = m2Positions[i];
            //this.loadM2(i, doodad);
            this.m2Array[i] = this.sceneApi.objects.loadAdtM2Obj(doodad);
        }
    }

    loadWmos() {
        var self = this;
        var wmoPositions = this.adtGeom.objAdt.wmoObjs;
        if (!wmoPositions) return;

        this.wmoArray = new Array(wmoPositions.length);
        for (var i = 0; i < wmoPositions.length; i++) {
            var wmoDef = wmoPositions[i];
            self.wmoArray[i] = self.sceneApi.objects.loadAdtWmo(wmoDef);
        }
    }
    loadTextures() {
        var gl = this.gl;
        var mcnkObjs = this.adtGeom.textAdt.mcnkObjs;

        /* 1. Load rgb textures */
        for (var i = 0; i < mcnkObjs.length; i++) {
            var mcnkObj = mcnkObjs[i];

            if (mcnkObj.textureLayers && (mcnkObj.textureLayers.length > 0)) {
                for (var j = 0; j < mcnkObj.textureLayers.length; j++) {
                    //if (mcnkObj.textureLayers[j].textureID < 0)
                    this.loadTexture(i, j, mcnkObj.textureLayers[j].textureName);
                }
            }
        }
    }
    loadTexture(index, layerInd, filename) {
        var self = this;
        this.sceneApi.resources.loadTexture(filename).then(function success(textObject) {
            self.textureArray[index][layerInd] = textObject;
        }, function error() {
        });
    }

    load(modelName) {
        var self = this;

        var adtPromise = this.sceneApi.resources.loadAdtGeom(modelName);
        adtPromise.then(function (result) {
            self.adtGeom = result;
        });
    }

    draw(deltaTime) {
        if (this.adtGeom && this.adtGeom.loaded) {
            this.adtGeom.draw(this.drawChunk, this.textureArray);
        }
    }
}


export default ADTObject;