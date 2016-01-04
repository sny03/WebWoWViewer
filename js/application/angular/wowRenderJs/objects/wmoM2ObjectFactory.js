'use strict';

(function (window, $, undefined) {
    var cacheTemplate = angular.module('js.wow.render.wmoM2ObjectFactory', ['js.wow.render.mdxObject']);
    cacheTemplate.factory("wmoM2ObjectFactory", ['mdxObject', '$q', '$timeout', function(mdxObject, $q, $timeout) {
        function WmoM2Object(sceneApi){
            var self = this;

            self.sceneApi = sceneApi;
            self.mdxObject = new mdxObject(sceneApi);
            self.currentDistance = 0;
            self.isRendered = true;
        }
        WmoM2Object.prototype = {
            sceneApi : null,
            mdxObject : null,

            getFileNameIdent : function (){
                return this.mdxObject.fileIdent;
            },
            getMeshesToRender : function () {
                if (!this.mdxObject) return null;
                return this.mdxObject.getMeshesToRender();
            },
            checkFrustumCulling : function (frustumPlanes) {
                var inFrustum = this.aabb && this.mdxObject.checkFrustumCulling(frustumPlanes, this.aabb)

                this.setIsRendered(this.getIsRendered() && inFrustum);
            },
            checkAgainstDepthBuffer: function (frustumMatrix, lookAtMat4, getDepth) {
                this.setIsRendered(this.getIsRendered() && this.mdxObject.checkAgainstDepthBuffer(frustumMatrix, lookAtMat4, this.placementMatrix, getDepth));
            },
            update: function (deltaTime, cameraPos) {
                if (!this.aabb) {
                    var bb = this.mdxObject.getBoundingBox();
                    if (bb) {
                        var a_ab = vec4.fromValues(bb.ab.x,bb.ab.y,bb.ab.z,1);
                        var a_cd = vec4.fromValues(bb.cd.x,bb.cd.y,bb.cd.z,1);

                        vec4.transformMat4(a_ab, a_ab, this.placementMatrix);
                        vec4.transformMat4(a_cd, a_cd, this.placementMatrix);


                        var minx = Math.min(a_ab[0], a_cd[0]);    var maxx = Math.max(a_ab[0], a_cd[0]);
                        var miny = Math.min(a_ab[1], a_cd[1]);    var maxy = Math.max(a_ab[1], a_cd[1]);
                        var minz = Math.min(a_ab[2], a_cd[2]);    var maxz = Math.max(a_ab[2], a_cd[2]);

                        this.diameter = vec3.distance([minx, miny, minz], [maxx, maxy, maxz]);
                        this.aabb = [[minx, miny, minz], [maxx, maxy, maxz]];
                    }
                }
                if (!this.getIsRendered()) return;
                this.mdxObject.update(deltaTime, cameraPos, this.placementInvertMatrix);

            },
            drawTransparentMeshes : function () {
                this.mdxObject.drawTransparentMeshes(this.placementMatrix, this.diffuseColor);
            },
            drawNonTransparentMeshes : function () {
                this.mdxObject.drawNonTransparentMeshes(this.placementMatrix, this.diffuseColor);
            },
            draw : function () {
                this.mdxObject.draw(this.placementMatrix, this.diffuseColor);
            },
            drawBB : function () {
                var gl = this.sceneApi.getGlContext();
                var uniforms = this.sceneApi.shaders.getShaderUniforms();

                var bb = this.mdxObject.getBoundingBox();

                if (bb) {
                    var bb1 = bb.ab,
                        bb2 = bb.cd;

                    var center = [
                        (bb1.x + bb2.x) / 2,
                        (bb1.y + bb2.y) / 2,
                        (bb1.z + bb2.z) / 2
                    ];

                    var scale = [
                        bb2.x - center[0],
                        bb2.y - center[1],
                        bb2.z - center[2]
                    ];

                    gl.uniform3fv(uniforms.uBBScale, new Float32Array(scale));
                    gl.uniform3fv(uniforms.uBBCenter, new Float32Array(center));
                    gl.uniform3fv(uniforms.uColor, new Float32Array([0.819607843, 0.058, 0.058])); //red
                    gl.uniformMatrix4fv(uniforms.uPlacementMat, false, this.placementMatrix);

                    gl.drawElements(gl.LINES, 48, gl.UNSIGNED_SHORT, 0);
                }
            },
            drawInstancedNonTransparentMeshes : function (instanceCount, placementVBO) {
                this.mdxObject.drawInstancedNonTransparentMeshes(instanceCount, placementVBO, this.diffuseColor);
            },
            drawInstancedTransparentMeshes : function (instanceCount, placementVBO) {
                this.mdxObject.drawInstancedTransparentMeshes(instanceCount, placementVBO, this.diffuseColor);
            },
            createPlacementMatrix : function(doodad, wmoPlacementMatrix){
                var placementMatrix = mat4.create();
                mat4.identity(placementMatrix);
                mat4.multiply(placementMatrix, placementMatrix, wmoPlacementMatrix);

                mat4.translate(placementMatrix, placementMatrix, [doodad.pos.x,doodad.pos.y,doodad.pos.z]);

                var orientMatrix = mat4.create();
                mat4.fromQuat(orientMatrix,
                    [doodad.rotation.imag.x,
                    doodad.rotation.imag.y,
                    doodad.rotation.imag.z,
                    doodad.rotation.real]
                );
                mat4.multiply(placementMatrix, placementMatrix, orientMatrix);

                mat4.scale(placementMatrix, placementMatrix, [doodad.scale, doodad.scale, doodad.scale]);

                var placementInvertMatrix = mat4.create();
                mat4.invert(placementInvertMatrix, placementMatrix);

                this.placementInvertMatrix = placementInvertMatrix;
                this.placementMatrix = placementMatrix;
            },
            calcOwnPosition : function () {
                var position = vec4.fromValues(0,0,0,1 );
                vec4.transformMat4(position, position, this.placementMatrix);

                this.position = position;
            },
            calcDistance : function (position) {
                function distance(aabb, p) {
                    var dx = Math.max(aabb[0][0] - p[0], 0, p[0] - aabb[1][0]);
                    var dy = Math.max(aabb[0][1] - p[1], 0, p[1] - aabb[1][1]);
                    var dz = Math.max(aabb[0][2] - p[2], 0, p[2] - aabb[1][2]);
                    return Math.sqrt(dx*dx + dy*dy + dz*dz);
                }

                if (this.aabb) {
                    this.currentDistance = distance(this.aabb, position);
                }
            },
            getCurrentDistance : function (){
                return this.currentDistance;
            },
            getDiameter : function () {
                return this.diameter;
            },
            setIsRendered : function (value) {
                this.isRendered = value;
            },
            getIsRendered : function () {
                return this.isRendered;
            },
            load : function (doodad, wmoPlacementMatrix, useLocalColor){
                var self = this;

                self.doodad = doodad;

                if (useLocalColor) {
                    self.diffuseColor = doodad.color;
                } else {
                    self.diffuseColor = 0xffffffff;
                }
                self.createPlacementMatrix(doodad, wmoPlacementMatrix);
                self.calcOwnPosition();

                return self.mdxObject.load(doodad.modelName, 0);
            }
        };

        return WmoM2Object;
    }]);
})(window, jQuery);