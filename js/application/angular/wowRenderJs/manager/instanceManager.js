
export default class InstanceManager {
    constructor(sceneApi) {
        this.sceneApi = sceneApi;
        this.mdxObjectList = [];
        this.sceneObjNumSet = new Set();
        this.lastUpdatedNumber = 0;
        this.previousObjectList = [];
    }

    clearList() {
        this.mdxObjectList = [];
        this.sceneObjNumSet = new Set();
    }
    addMDXObject(MDXObject) {
        if (this.sceneObjNumSet.has(MDXObject.sceneNumber)) return; // The object has already been added to this manager

        this.sceneObjNumSet.add(MDXObject.sceneNumber);
        this.mdxObjectList.push(MDXObject);
    }
    updatePlacementVBO() {
        var gl = this.sceneApi.getGlContext();

        var paramsVbo = this.placementVBO;
        if (!paramsVbo) {
            paramsVbo = gl.createBuffer();
            this.maxAmountWritten = 0;
        }
        var written = 0;
        var permanentBuffer = [];

        //1. Collect objects
        if (this.mdxObjectList.length > 0) {
            for (var i = 0; i < this.mdxObjectList.length; i++) {
                var mdxObject = this.mdxObjectList[i];

                var placementMatrix = mdxObject.placementMatrix;
                var diffuseColor = mdxObject.getDiffuseColor();
                for (var j = 0; j < 16; j++) {
                    permanentBuffer[written * 20 + j] = placementMatrix[j];
                }
                for (var j = 0; j < 4; j++) {
                    permanentBuffer[written * 20 + 16 + j] = diffuseColor[j];
                }

                written++;
            }

            if (written > 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, paramsVbo);
                if (written > this.maxAmountWritten) {
                    var typedBuf = new Float32Array(permanentBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, typedBuf, gl.DYNAMIC_DRAW);

                    this.maxAmountWritten = written;
                } else {
                    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(permanentBuffer));
                }
            }
        }
        this.placementVBO = paramsVbo;
        this.lastUpdatedNumber = written;
    }
    drawInstancedNonTransparentMeshes(opaqueMap) {
        if (!this.mdxObjectList[0]) return;

        var lastDrawn = null;
        for (var i = 0; i < this.mdxObjectList.length; i++) {
            opaqueMap[this.mdxObjectList[i].sceneNumber] = true;
            lastDrawn = this.mdxObjectList[i];
        }

        if (lastDrawn) {
            lastDrawn.drawInstancedNonTransparentMeshes(this.lastUpdatedNumber, this.placementVBO);
        }
    }
    drawInstancedTransparentMeshes(transparentMap) {
        if (!this.mdxObjectList[0]) return;
        var lastDrawn;
        for (var i = 0; i < this.mdxObjectList.length; i++) {
            transparentMap[this.mdxObjectList[i].sceneNumber] = true;
            lastDrawn = this.mdxObjectList[i];
        }
        if (lastDrawn) {
            lastDrawn.drawInstancedTransparentMeshes(this.lastUpdatedNumber, this.placementVBO);
        }
    }
}