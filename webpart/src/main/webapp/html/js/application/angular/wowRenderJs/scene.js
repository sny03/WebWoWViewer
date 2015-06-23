/**
 * Created by Deamon on 08/03/2015.
 */

'use strict';

(function (window, $, undefined) {
    var scene = angular.module('js.wow.render.scene', [
        'js.wow.render.geometry.wmoGeomCache',
        'js.wow.render.geometry.wmoMainCache',
        'js.wow.render.wmoObjectFactory',
        'js.wow.render.texture.textureCache',
        'js.wow.render.camera.firstPersonCamera']);
    scene.factory("scene", ['$q', '$timeout', 'wmoObjectFactory', 'wmoMainCache', 'wmoGeomCache', 'textureWoWCache', 'firstPersonCamera', function ($q, $timeout, wmoObjectFactory, wmoMainCache, wmoGeomCache, textureWoWCache, firstPersonCamera) {

        var simpleVertexShader =
            "attribute vec3 aPosition; "+
            "attribute vec3 aNormal; "+
            "attribute vec2 aTexCoord; "+

            "uniform mat4 uModelView; "+
            "uniform mat4 uPMatrix; "+

            "varying vec2 vTexCoord; "+
            "varying vec3 vNormal; "+
            "void main() { " +
            "    vTexCoord = aTexCoord; "+
            "    gl_Position = uPMatrix * uModelView * vec4(aPosition, 1);"+
            "    vNormal = aNormal; "+
            "} ";

        var simpleFragmentShader =
            "precision highp float; "+
            "varying vec3 vNormal; "+
            "varying vec2 vTexCoord; "+
            "uniform sampler2D uTexture; "+
            "void main() { "+
            "   gl_FragColor = texture2D(uTexture, vTexCoord); "+
            "}";

        return function(canvas){
            var self = this;

            function throwOnGLError(err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
            }

            self.sceneObjectList = [];

            self.initGlContext = function (canvas){
                try {
                    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
                }
                catch(e) {}

                if (!gl) {
                    alert("Unable to initialize WebGL. Your browser may not support it.");
                    gl = null;
                }
                self.gl = gl;
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);

                /* 1. Compile shaders */

                /* 1.1 Compile vertex shader */
                var vertexShader = gl.createShader(gl.VERTEX_SHADER);

                // Set the shader source code.
                gl.shaderSource(vertexShader, simpleVertexShader);

                // Compile the shader
                gl.compileShader(vertexShader);

                // Check if it compiled
                var success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
                if (!success) {
                    // Something went wrong during compilation; get the error
                    throw "could not compile shader:" + gl.getShaderInfoLog(vertexShader);
                }

                /* 1.2 Compile fragment shader */
                var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

                // Set the shader source code.
                gl.shaderSource(fragmentShader, simpleFragmentShader);

                // Compile the shader
                gl.compileShader(fragmentShader);

                // Check if it compiled
                var success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
                if (!success) {
                    // Something went wrong during compilation; get the error
                    throw "could not compile shader:" + gl.getShaderInfoLog(fragmentShader);
                }

                /* 1.3 Link the program */
                var program = gl.createProgram();

                // attach the shaders.
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);

                gl.bindAttribLocation(program, 0, "aPosition");
                gl.bindAttribLocation(program, 1, "aNormal");
                gl.bindAttribLocation(program, 2, "aTexCoord");

                // link the program.
                gl.linkProgram(program);



                // Check if it linked.
                var success = gl.getProgramParameter(program, gl.LINK_STATUS);
                if (!success) {
                    // something went wrong with the link

                    throw ("program filed to link:" + gl.getProgramInfoLog (program));
                }

                var modelViewMatrix = gl.getUniformLocation(program, "uModelView");
                var projectionMatrix = gl.getUniformLocation(program, "uPMatrix");

                self.program = program;
                self.modelViewMatrix = modelViewMatrix;
                self.projectionMatrix = projectionMatrix;
            };
            self.initGlContext(canvas);

            self.wmoGeomCache = new wmoGeomCache();
            self.wmoGeomCache.initGlContext(self.gl);

            self.wmoMainCache = new wmoMainCache();
            self.wmoMainCache.initGlContext(self.gl);

            self.textureCache = new textureWoWCache();
            self.textureCache.initGlContext(self.gl);

            self.draw = function (deltaTime){
                var gl = self.gl;

                var cameraVecs = camera.tick(deltaTime);
                var lookAtMat4 = [];
                mat4.lookAt(lookAtMat4, cameraVecs.cameraVec3, cameraVecs.lookAtVec3, [0,0,1]);

                gl.disable(gl.BLEND);
                gl.clearColor(0.7 + 0.3, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                //gl.MatrixMode(GL_MODELVIEW);
                //gl.LoadIdentity();

                gl.activeTexture(gl.TEXTURE0);

                gl.useProgram(self.program);
                gl.uniformMatrix4fv(self.modelViewMatrix, false, lookAtMat4);


                var perspectiveMatrix = [];
                mat4.perspective(perspectiveMatrix, 45.0, $(canvas).width() / $(canvas).height(), 1, 400.0);
                gl.uniformMatrix4fv(self.projectionMatrix, false, perspectiveMatrix);


                var i;
                for (i = 0; i < self.sceneObjectList.length; i ++) {
                    var sceneObject = self.sceneObjectList[i];
                    sceneObject.draw();
                }

                return cameraVecs;
            };

            self.loadWMOMap = function(filename){
                var wmoObject = new wmoObjectFactory();
                wmoObject.setCaches(self.wmoMainCache, self.wmoGeomCache, self.textureCache);
                wmoObject.load(filename);

                self.sceneObjectList = [wmoObject];
            };


            var camera = firstPersonCamera(canvas, document);

        };
    }]);
})(window, jQuery);