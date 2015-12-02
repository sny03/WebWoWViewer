/**
 * Created by Deamon on 01/02/2015.
 */
(function (window, $, undefined) {

    var mdxLoader = angular.module('main.services.map.mdxLoader', ['main.services.linedFileLoader']);

    mdxLoader.factory('mdxLoader', ['linedFileLoader', '$log', '$q', function (linedFileLoader, $log, $q){

        var mdx_ver264 = {
            name : "header",
            type : "layout",
            layout : [
                {name: "MNameLen",              type: "int32"},
                {name: "MNameOffs",             type: "int32"},
                {name: "ModelType",             type: "int32"},
                {name: "nGlobalSequences",      type: "int32"},
                {name: "ofsGlobalSequences",    type: "int32"},
                {name: "nAnimations",           type: "int32"},
                {name: "ofsAnimations",         type: "int32"},
                {name: "nC",                    type: "int32"},
                {name: "ofsC",                  type: "int32"},
                {name: "nBones",                type: "int32"},
                {name: "ofsBones",              type: "int32"},
                {name: "nF",                    type: "int32"},
                {name: "ofsF",                  type: "int32"},
                {name: "nVertexes",             type: "int32"},
                {name: "ofsVertexes",           type: "int32"},
                {name: "nViews",                type: "int32"},
                {name: "nColors",               type: "int32"},
                {name: "ofsColors",             type: "int32"},
                {name: "nTextures",             type: "int32"},
                {name: "ofsTextures",           type: "int32"},
                {name: "nTransparency",         type: "int32"},
                {name: "ofsTransparency",       type: "int32"},
                {name: "nTexAnims",             type: "int32"},
                {name: "ofsTexAnims",           type: "int32"},
                {name: "nTexReplace",           type: "int32"},
                {name: "ofsTexReplace",         type: "int32"},
                {name: "nRenderFlags",          type: "int32"},
                {name: "ofsRenderFlags",        type: "int32"},
                {name: "nGroupBoneIDs",         type: "int32"},
                {name: "ofsGroupBoneIDs",       type: "int32"},
                {name: "nTexLookup",            type: "int32"},
                {name: "ofsTexLookup",          type: "int32"},
                {name: "nTexUnits",             type: "int32"},
                {name: "ofsTexUnits",           type: "int32"},
                {name: "nTransLookup",          type: "int32"},
                {name: "ofsTransLookup",        type: "int32"},
                {name: "nTexAnimLookup",        type: "int32"},
                {name: "ofsTexAnimLookup",      type: "int32"},
                {name: "BoundingCorner1",       type: "vector3f"},
                {name: "BoundingCorner2",       type: "vector3f"},
                {name: "BoundingRadius",        type: "float32"},
                {name: "Corner1",               type: "vector3f"},
                {name: "Corner2",               type: "vector3f"},
                {name: "Radius",                type: "float32"},
                {name: "nBoundingTriangles",    type: "int32"},
                {name: "ofsBoundingTriangles",  type: "int32"},
                {name: "nBoundingVertices",     type: "int32"},
                {name: "ofsBoundingVertices",   type: "int32"},
                {name: "nBoundingNormals",      type: "int32"},
                {name: "ofsBoundingNormals",    type: "int32"},
                {name: "nAttachments",          type: "int32"},
                {name: "ofsAttachments",        type: "int32"},
                {name: "nP",                    type: "int32"},
                {name: "ofsP",                  type: "int32"},
                {name: "nNumEvents",            type: "int32"},
                {name: "ofsNumEvents",          type: "int32"},
                {name: "nLights",               type: "int32"},
                {name: "ofsLights",             type: "int32"},
                {name: "nCameras",              type: "int32"},
                {name: "ofsCameras",            type: "int32"},
                {name: "nCameraLookup",         type: "int32"},
                {name: "ofsCameraLookup",       type: "int32"},
                {name: "nRibbonEmitters",       type: "int32"},
                {name: "ofsRibbonEmitters",     type: "int32"},
                {name: "nParticleEmitters",     type: "int32"},
                {name: "ofsParticleEmitters",   type: "int32"},
                {
                    name : "vertexes",
                    offset: "ofsVertexes",
                    type : 'uint8Array',
                    /*
                    count : "nVertexes",

                    type : "layout",
                    layout: [
                    {name: "pos",           type : "vector3f"},
                    {name: "bonesWeight",   type : "uint8Array", len: 4},
                    {name: "bones",         type : "uint8Array", len: 4},
                    {name: "normal",        type : "vector3f"},
                    {name: "textureX",      type : "float32"},
                    {name: "textureY",      type : "float32"},
                    {name : "unk1",         type : "int32"},
                    {name : "unk2",         type : "int32"}
                    ]
                    */
                    len : function(obj){
                        return obj.nVertexes
                            * (
                                (4 * 3)
                                + 4
                                + 4
                                + (4 * 3)
                                + 4
                                + 4
                                + 4
                                + 4
                            );
                    }
                },
                {
                    name : "textureDefinition",
                    offset : "ofsTextures",
                    count : "nTextures",
                    type: "layout",
                    layout: [
                        {name: "texType",         type : "uint32"},
                        {name: "flags",           type : "uint32"},
                        {name: "filenameLen",     type : "uint32"},
                        {name: "ofsFilename",     type : "uint32"},
                        {
                            name: "textureName",
                            offset : "ofsFilename",
                            len : "filenameLen",
                            type: "string"
                        }
                    ]
                },
                {
                    name : "texLookup",
                    offset: "ofsTexLookup",
                    count : "nTexLookup",
                    type: "uint16"
                },
                {
                    name : "colors",
                    offset: "ofsColors",
                    count : "nColors",
                    type: "layout",
                    layout: [
                        {
                            name: "color",
                            type: "ablock",
                            valType: "vector3f"
                        },
                        {
                            name: "alpha",
                            type: "ablock",
                            valType: "int16"
                        }
                    ]
                },
                {
                    name : "transparencies",
                    offset: "ofsTransparency",
                    count : "nTransparency",
                    type: "layout",
                    layout: [
                        {
                            name: "values",
                            type: "ablock",
                            valType: "int16"
                        }
                    ]
                },
                {
                    name : "bones",
                    offset: "ofsBones",
                    count : "nBones",
                    type: "layout",
                    layout: [
                        {name: "key_bone_id", type: "int32"},
                        {name: "flags", type: "uint32"},
                        {name: "parent_bone", type: "int16"},
                        {name: "submesh_id", type: "uint16"},
                        {name: "unk1", type: "uint16"},
                        {name: "unk2", type: "uint16"},
                        {
                            name: "translation",
                            type: "ablock",
                            valType: "vector3f"
                        },
                        {
                            name: "rotation",
                            type: "ablock",
                            valType: "int16Array",
                            len: 4
                        },
                        {
                            name: "scale",
                            type: "ablock",
                            valType: "vector3f"
                        },
                        {name: "pivot", type: "vector3f"}
                    ]
                },

                {
                    name : "transLookup",
                    offset: "ofsTransLookup",
                    count : "nTransLookup",
                    type: "int16"
                },
                {
                    name : "texReplace",
                    offset: "ofsTexReplace",
                    count : "nTexReplace",
                    type: "uint16"
                },
                {
                    name : "textUnitLookup",
                    offset: "ofsTexUnits",
                    count : "nTexUnits",
                    type: "uint16"
                },
                {
                    name : "renderFlags",
                    offset: "ofsRenderFlags",
                    count : "nRenderFlags",
                    type: "layout",
                    layout : [
                        {name: "flags",         type : "uint16"},
                        {name: "blend",         type : "uint16"}
                    ]
                }
            ]
        };
        var mdxTablePerVersion = {
            "264" : mdx_ver264
        };

        return function(filePath) {
            var promise = linedFileLoader(filePath);

            var newPromise = promise.then(function success(fileObject){
                /* Read the header */
                var offset = {offs : 0};
                var fileIdent = fileObject.readNZTString(offset, 4);
                var fileVersion  = fileObject.readInt32(offset); //is this really version?

                /* Check the ident */
                if (fileIdent != "MD20"){
                    var errorMessage = "Unknown MDX file ident = " + fileIdent + ", filepath = " +  filePath;
                    $log.error(errorMessage);
                    throw errorMessage;
                }

                /* Check the version */
                var mdxDescription = mdxTablePerVersion[fileVersion];
                if (mdxDescription == undefined) {
                    var errorMessage = "Unknown MDX file version = " + fileVersion + ", filepath = " + filePath;
                    $log.error(errorMessage);
                    throw errorMessage;
                }

                /* Parse the header */
                var resultMDXObject = {};
                    try {
                        resultMDXObject = fileObject.parseSectionDefinition(resultMDXObject, mdxDescription, fileObject, offset);
                    } catch (e) {
                        throw e;
                    }

                resultMDXObject.fileName = filePath;
                return resultMDXObject;
            },
            function error(errorObj){
                return errorObj;
            });

            return newPromise;
        }
    }]);

})(window, jQuery);
