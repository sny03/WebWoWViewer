import Cache from './../cache.js';
import adtLoader from './../../services/map/adtLoader.js';

function processTexture(adtObj, wdtObj, i) {
    var mcnkObj = adtObj.mcnkObjs[i];
    var alphaArray = mcnkObj.alphaArray;
    var layers = mcnkObj.textureLayers;

    var currentLayer = new Uint8Array(((64*4) * 64));
    if (!layers || !alphaArray) return currentLayer;
    for (var j = 0; j < layers.length; j++ ) {
        var alphaOffs = layers[j].alphaMap;
        var offO = j;
        var readCnt = 0;
        var readForThisLayer = 0;

        if ((layers[j].flags & 0x200) > 0) {
            //Compressed
            //http://www.pxr.dk/wowdev/wiki/index.php?title=ADT/v18
            while( readForThisLayer < 4096 )
            {
                // fill or copy mode
                var fill = (alphaArray[alphaOffs] & 0x80 );
                var n = alphaArray[alphaOffs] & 0x7F;
                alphaOffs++;

                for ( var k = 0; k < n; k++ )
                {
                    if (readForThisLayer == 4096) break;

                    currentLayer[offO] = alphaArray[alphaOffs];
                    readCnt++; readForThisLayer++;
                    offO += 4;

                    if (readCnt >=64) {
                        readCnt = 0;
                    }

                    if( !fill ) alphaOffs++;
                }
                if( fill ) alphaOffs++;
            }
        } else {
            //Uncompressed
            if (((wdtObj.flags & 0x4) > 0) || ((wdtObj.flags & 0x80) > 0)) {
                //Uncompressed (4096)
                for (var iX =0; iX < 64; iX++) {
                    for (var iY = 0; iY < 64; iY++){
                        currentLayer[offO] = alphaArray[alphaOffs];

                        offO += 4; readCnt+=1; readForThisLayer+=1; alphaOffs++;
                     }
                }
            } else {
                //Uncompressed (2048)
                for (var iX =0; iX < 64; iX++) {
                    for (var iY = 0; iY < 32; iY++){
                        //Old world
                        currentLayer[offO] = (alphaArray[alphaOffs] & 0x0f ) * 17;
                        offO += 4;
                        currentLayer[offO] =  ((alphaArray[alphaOffs] & 0xf0 ) >> 4) * 17;
                        offO += 4;
                        readCnt+=2; readForThisLayer+=2; alphaOffs++;
                    }
                }
            }
        }
    }
    return currentLayer
}

class ADTGeom {
    constructor(sceneApi, wdtFile) {
        this.sceneApi = sceneApi;
        this.gl = sceneApi.getGlContext();
        this.alphaTexturesLoaded = 0;

        this.wdtFile = wdtFile;
        this.combinedVBO = null;

        this.alphaTextures = [];
        this.loaded = false;
    }

    assign(adtFile) {
        this.adtFile = adtFile;
    }
    startLoadingLod() {
        var adtFileName = this.adtFile.fileName;
        var adtFileNameTemplate = adtFileName.split(".").slice(0, -1).join("."); //remove extension
        var texFileName = adtFileNameTemplate + "_tex"+0+".adt";
        var objFileName = adtFileNameTemplate + "_obj"+0+".adt";
        var self = this;


        var texFilePromise = adtLoader(texFileName, this.adtFile).then(function success(a) {
            self.textAdt = a;
            //debugger;
        });
        var objFilePromise = adtLoader(objFileName, this.adtFile).then(function success(a) {
            self.objAdt = a;
            //debugger;
        } );
        Promise.all([texFilePromise, objFilePromise]).then(function success(a) {
            self.createTriangleStrip();
            self.createVBO();
            self.loaded = true;

        }, function error(e) {
            console.log(e);
        });
    }
    loadAlphaTextures(limit) {
        if (this.alphaTexturesLoaded>=256) return;

        var gl = this.gl;
        var mcnkObjs = this.adtFile.mcnkObjs;
        var chunkCount = mcnkObjs.length;
        var maxAlphaTexPerChunk = 4;
        var alphaTexSize = 64;

        var texWidth = alphaTexSize;
        var texHeight = alphaTexSize;

        var createdThisRun = 0;
        var alphaTextures = this.alphaTextures;
        for (var i = this.alphaTexturesLoaded; i < chunkCount; i++) {
            var alphaTexture = gl.createTexture();
            var alphaTextureData = processTexture(this.textAdt, this.wdtFile, i);

            gl.bindTexture(gl.TEXTURE_2D, alphaTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, alphaTextureData);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);
            alphaTextures.push(alphaTexture);

            createdThisRun++;
            if (createdThisRun >= limit) {
                break;
            }
        }
        this.alphaTexturesLoaded += createdThisRun;
    }
    createTriangleStrip() {
        var mcnkObjs = this.adtFile.mcnkObjs;

        function isHole(hole, i, j) {
            var holetab_h = [0x1111, 0x2222, 0x4444, 0x8888];
            var holetab_v = [0x000F, 0x00F0, 0x0F00, 0xF000];

            return (hole & holetab_h[i] & holetab_v[j]) != 0;
        }

        function indexMapBuf(x, y) {
            var result = ((y + 1) >>> 1) * 9 + (y >>> 1) * 8 + x;
            return result;
        }

        var strips = [];
        var stripOffsets = [];

        if (mcnkObjs == null) return;

        for (var i = 0; i < mcnkObjs.length; i++) {
            var mcnkObj = mcnkObjs[i];
            var hole = mcnkObj.holes;
            stripOffsets.push(strips.length);

            var j = 0;
            var first = true;
            for (var x = 0; x < 4; x++) {
                for (var y = 0; y < 4; y++) {
                    if (!isHole(hole, x, y)) {
                        var _i = x * 2;
                        var _j = y * 4;

                        for (var k = 0; k < 2; k++) {
                            if (!first) {
                                strips.push(indexMapBuf(_i, _j + k * 2));
                            } else
                                first = false;

                            for (var l = 0; l < 3; l++) {

                                strips.push(indexMapBuf(_i + l, _j + k * 2));
                                strips.push(indexMapBuf(_i + l, _j + k * 2 + 2));
                            }
                            strips.push(indexMapBuf(_i + 2, _j + k * 2 + 2));
                        }
                    }
                }
            }
        }
        stripOffsets.push(strips.length);
        var result = {strips: strips, stripOffsets: stripOffsets};
        this.triangleStrip = result;
    }
    createVBO() {
        var gl = this.gl;
        /* 1. help index + Heights + texCoords +  */
        var vboArray = [];

        /* 1.1 help index */
        this.indexOffset = vboArray.length;
        for (var i = 0; i < 9 * 9 + 8 * 8; i++) {
            vboArray.push(i);
        }

        /* 1.2 Heights */
        this.heightOffset = vboArray.length;
        var mcnkObjs = this.adtFile.mcnkObjs;
        for (var i = 0; i < mcnkObjs.length; i++) {
            for (var j = 0; j < 145; j++) {
                vboArray.push(mcnkObjs[i].heights[j]);
            }
        }

        /* 1.3 Make combinedVbo */
        this.combinedVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.combinedVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboArray), gl.STATIC_DRAW);

        /* 2. Strips */
        this.stripVBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stripVBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(this.triangleStrip.strips), gl.STATIC_DRAW);
    }
    draw(drawChunks, textureArray) {
        var gl = this.gl;
        var stripOffsets = this.triangleStrip.stripOffsets;
        var shaderUniforms = this.sceneApi.shaders.getShaderUniforms();
        var shaderAttributes = this.sceneApi.shaders.getShaderAttributes();
        var blackPixelTexture = this.sceneApi.getBlackPixelTexture();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.stripVBO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.combinedVbo);

        gl.vertexAttribPointer(shaderAttributes.aIndex, 1, gl.FLOAT, false, 0, this.indexOffset * 4);

        //Draw
        var mcnkObjs = this.adtFile.mcnkObjs;
        for (var i = 0; i < 256; i++) {
            if (!drawChunks[i]) continue;

            var mcnkObj = mcnkObjs[i];
            gl.vertexAttribPointer(shaderAttributes.aHeight, 1, gl.FLOAT, false, 0, (this.heightOffset + i * 145) * 4);
            gl.uniform3f(shaderUniforms.uPos, mcnkObj.pos.x, mcnkObj.pos.y, mcnkObj.pos.z);

            if ((textureArray[i]) && (textureArray[i][0])) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, textureArray[i][0].texture);

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.alphaTextures[i]);

                //Bind layer textures
                for (var j = 1; j < textureArray[i].length; j++) {
                    gl.activeTexture(gl.TEXTURE1 + j);
                    if ((textureArray[i][j]) && (textureArray[i][j].texture)) {
                        //gl.enable(gl.TEXTURE_2D);
                        gl.bindTexture(gl.TEXTURE_2D, textureArray[i][j].texture);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, blackPixelTexture);
                    }
                }
                for (var j = textureArray[i].length; j < 4; j++) {
                    gl.activeTexture(gl.TEXTURE1 + j);
                    gl.bindTexture(gl.TEXTURE_2D, blackPixelTexture);
                }

                var stripLength = stripOffsets[i + 1] - stripOffsets[i];
                gl.drawElements(gl.TRIANGLE_STRIP, stripLength, gl.UNSIGNED_SHORT, stripOffsets[i] * 2);
            }
        }
    }
}

class AdtGeomCache extends Cache {
    constructor (sceneApi) {
        super();
        var self = this;
        this.sceneApi = sceneApi;
    }
    load(fileName) {
        /* Must return promise */
        return adtLoader(fileName);
    }
    processCacheQueue(limit) {
        var objectsProcessed = 0;
        var chacheIter = this.cache.keys();
        var fileName = chacheIter.next().value;
        while (fileName != null) {
            var adtGeomObject = this.cache.get(fileName).obj;
            if (adtGeomObject.loaded) {
                adtGeomObject.loadAlphaTextures(limit);
            }

            fileName = chacheIter.next().value;
        }

        super.processCacheQueue(limit);
    }
    process(adtFile) {
        var adtGeomObj = new ADTGeom(this.sceneApi, this.sceneApi.getCurrentWdt());
        adtGeomObj.assign(adtFile);
        adtGeomObj.startLoadingLod();

        return adtGeomObj;
    }
    loadAdt(fileName) {
        return this.get(fileName);
    };
    unLoadAdt (fileName) {
        this.remove(fileName)
    }
}

export default AdtGeomCache;
