import configService from '../services/config.js';

let parameters = {
    predefined: [
        {
        name: 'Shattrath city (WotLK)',
        source: 'zip',
        url: 'http://deamon87.github.io/WoWFiles/shattrath.zip',
        sceneType: 'map',
        mapId: 530,
        mapName: 'Expansion01',
        x: -1663,
        y: 5098,
        z: 27
    },
        {
            name: 'Ironforge (WotLK)',
            source: 'zip',
            url: 'http://deamon87.github.io/WoWFiles/ironforge.zip',
            sceneType: 'wmo',
            fileName: 'World/wmo/KhazModan/Cities/Ironforge/ironforge.wmo'
        }
    ],
    custom: [
        {
            name: 'Raw coordinates',
            source: 'http',
            sceneType: 'customMap'
        },
        {
            name: 'Azeroth adt 31-31',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'Azeroth',
            x: 0,
            y: 0,
            z: 0
        },{
            name: 'Ironforge on Map',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'Azeroth',
            x: -4981.25,
            y: -881.542,
            z: 502.66
        },{
            name: 'Caverns of Time',
            source: 'http',
            sceneType: 'map',
            mapId: 1,
            mapName: 'Kalimdor',
            x: -8181.35,
            y: -4596.92,
            z: -125.34
        },
        {
            name: 'Attacked mob',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'test',
            "x": -8966.7626953125,
            "y": -78.48555755615234,
            "z": 88.66773223876953,
        },
        /*{
         name: 'Azeroth mage tower',
         source: 'http',
         sceneType: 'map',
         mapId: 0,
         mapName: 'Azeroth',
         x: -9555.484,
         y: -714.772,
         z: 88.098
         },*/
        /*{
         name: 'Ulduar statue 03',
         source: 'http',
         sceneType: 'm2',
         modelName: 'world\\expansion02\\doodads\\ulduar\\ul_statue_03.m2'
         },*/
        {
            name: 'ul_statue_02',
            source: 'http',
            sceneType: 'm2',
            modelName: 'world\\expansion02\\doodads\\ulduar\\ul_statue_02.m2'
        },
        {
            name: 'Halls Of Reflection',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'HallsOfReflection',
            x: 5243.2461346537075,
            y: 1938.6550422193939,
            z: 717.0332923206179
        },
        {
            name: 'Darkshire',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Azeroth',
            x: -10559.7,
            y: -1189.02,
            z: 29.0698
        },
        {
            name: 'Shattrath (http)',
            source: 'http',
            sceneType: 'map',
            mapId: 530,
            mapName: 'Expansion01',
            x: -1663,
            y: 5098,
            z: 27
        },
        {
            name: 'Undercity',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Azeroth',
            x: 2031.957879860837,
            y: 236.26329900560341,
            z: 73.61365772444515
        },
        {
            name: 'Tree at dalaran zone (Halls Of Reflection)',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'HallsOfReflection',
            x: 5551.2461346537075,
            y: 993.6550422193939,
            z: 267.0332923206179
        },
        {
            name: 'Tree at dalaran zone (Northrend)',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Northrend',
            x: 5551.2461346537075,
            y: 993.6550422193939,
            z: 267.0332923206179
        },
        {
            name: 'Karazahn',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Karazahn',
            x: -10666.666666656,
            y: -1600,
            z: 170
        },
        {
            name: 'Karazahn1',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Karazahn1',
            x: -10666.666666656,
            y: -1600,
            z: 170
        },
        {
            name: 'TanaanJungleIntro',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'TanaanJungleIntro',
            x: 5000,
            y: -2500,
            z: 170
        },
        {
            name: 'TrollRaid2',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'TrollRaid2',
            x: 3500,
            y: 1500,
            z: 170
        },
        {
            name: 'Darkshire blacksmith',
            source: 'http',
            sceneType: 'wmo',
            fileName: 'WORLD\\WMO\\AZEROTH\\BUILDINGS\\DUSKWOOD_BLACKSMITH\\DUSKWOOD_BLACKSMITH.WMO'
        },
        {
            name: 'forsakencatapult',
            source: 'http',
            sceneType: 'm2',
            modelName: 'creature\\forsakencatapult\\forsakencatapult.m2'
        },
        {
            name: 'blackrock_lower_instance',
            source: 'http',
            sceneType: 'wmo',
            fileName: 'world/wmo/dungeon/az_blackrock/blackrock_lower_instance.wmo'
        },
        {
            name: 'Sniff',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'Azeroth',
            x: -8949.9501953125,
            y: -132.4929962158203,
            z: 83.53119659423828
        },
        {
            name: 'Stormwind',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'Azeroth',
            x: -9008,
            y: 482,
            z: 137

        },
        {
            name: 'Lava pots',
            source: 'zip',
            url: 'http://deamon87.github.io/WoWFiles/shattrath.zip',
            sceneType: 'm2',
            modelName: 'world\\expansion01\\doodads\\generic\\bloodelf\\banners\\be_banner_tallblack.m2'
        },
        {
            name: 'Vanilla Opening screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'Interface\\GLUES\\MODELS\\UI_MAINMENU\\UI_MainMenu.m2',
            cameraIndex: 0,
            fogStart : 0,
            fogEnd : 1200,
            fogColor : [0.25, 0.06, 0.015]
        },
        {
            name: 'BC Opening Screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'interface/glues/models/ui_mainmenu_burningcrusade/ui_mainmenu_burningcrusade.m2',
            cameraIndex: 0,
            fogStart : 0,
            fogEnd : 1200,
            fogColor : [0.25098, 0.0588235, 0.0156863]
        },
        {
            name: 'Wotlk opening screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'Interface\\GLUES\\MODELS\\UI_MainMenu_Northrend\\UI_MainMenu_Northrend.M2',
            cameraIndex: 0
        },
        {
            name: 'Cata Opening Screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'interface/glues/models/ui_mainmenu_cataclysm/ui_mainmenu_cataclysm.m2',
            cameraIndex: 0
        },
        {
            name: 'Panda Opening Screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'interface/glues/models/ui_mainmenu_pandaria/ui_mainmenu_pandaria.m2',
            cameraIndex: 0
        },
        {
            name: 'Legion Opening Screen',
            source: 'http',
            sceneType: 'm2',
            modelName: 'interface/glues/models/ui_mainmenu_legion/ui_mainmenu_legion.m2',
            cameraIndex: 0
        },

        {
            name: 'Ulduar Raid',
            source: 'http',
            sceneType: 'map',
            mapId: 0,
            mapName: 'UlduarRaid',
            x: 2290,
            y: -9.475,
            z: 470
        },
        {
            name: 'Eye of Storm',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'NetherstormBG',
            x: 2110,
            y: 1489,
            z: 1474
        },


        {
            name: 'Forsaken start',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'Azeroth',
            x: 2000,
            y: 1600,
            z: 137
        },
        {
            name: 'Deeprun Tram',
            source: 'http',
            sceneType: 'map',
            //mapId: 0,
            mapName: 'DeeprunTram',
            x: 17066.666666656,
            y: 17066.666666656,
            z: 0
        },
        {
            name: 'Gnome subway glass(Wotlk)',
            source: 'http',
            sceneType: 'm2',
            modelName: 'WORLD\\GENERIC\\GNOME\\PASSIVE DOODADS\\GNOMEMACHINE\\GNOMESUBWAYGLASS.m2'
        },            {
            name: 'S4bway car',
            source: 'http',
            sceneType: 'm2',
            modelName: 'world\\generic\\gnome\\passive doodads\\subway\\subwaycar.m2'
        },
        {
            name: 'elwyn forest tree',
            source: 'http',
            sceneType: 'm2',
            modelName: 'world\\azeroth\\elwynn\\passivedoodads\\trees\\elwynntreecanopy03.m2'
        },
        {
            name: 'Ironforge garage machine',
            source: 'http',
            sceneType: 'm2',
            modelName: 'WORLD\\KHAZMODAN\\IRONFORGE\\PASSIVEDOODADS\\GARAGEMACHINE\\GARAGEMACHINE.m2'
        },

        {
            name: 'mainmenu_warlords',
            source: 'http',
            sceneType: 'm2',
            modelName: 'interface/glues/models/ui_mainmenu_warlords/ui_mainmenu_warlords.m2'
        },
        {
            name: 'KARAZAN CHANDELIER',
            source: 'http',
            sceneType: 'm2',
            modelName: 'WORLD\\AZEROTH\\KARAZAHN\\PASSIVEDOODADS\\CHANDELIERS\\KARAZANCHANDELIER_02.m2'
        },
        {
            name: 'Test runecircle',
            source: 'http',
            sceneType: 'm2',
            modelName: 'WORLD\\EXPANSION02\\DOODADS\\CRYSTALSONGFOREST\\BUBBLE\\CAMOUFLAGEBUBBLE_CRYSTALSONG.m2'
        },


    ]
};

class UrlChooserCtrl {
    constructor($scope) {
        $scope.isReadyForStart = false;
        $scope.isReadyForDownload = false;

        $scope.params = {};
        $scope.params.urlForLoading = configService.getUrlToLoadWoWFile();
        $scope.params.zipFile = null;

        $scope.selectedModeName = "Please select mode";

        $scope.files = [];
        $scope.selectionOptions = parameters;
        $scope.status = {};
        $scope.status.isopen = false;

        $scope.selectMode = function (value) {
            $scope.selectedValue = value;
            $scope.selectedSource = value.source;
            $scope.selectedModeName = value.name;

            configService.setArchiveUrl(value.url);
            configService.setFileReadMethod(value.source);
        };

        $scope.fileList = [];
        $scope.filesToBeRead = 0;
        $scope.filesRead = 0;

        $scope.list=[
            {
                title : 'test1'
            },
            {
                title : 'test2'
            }
        ]


        $scope.startApplication = function () {
            configService.setUrlToLoadWoWFile($scope.params.urlForLoading);
            $scope.params.zipUrl = configService.getArchiveUrl();
            $scope.params.downLoadProgress = 0;

            configService.setSceneParams($scope.selectedValue);

            $scope.isReadyForDownload = configService.getFileReadMethod() == "zip" ;
            $scope.isReadyForStart = configService.getFileReadMethod() == "http" ;
        };

        $scope.$watch('params.zipFile', function(newValue){
            if (newValue) {

                configService.setArchiveFile(newValue);

                $scope.isReadyForDownload = false;
                $scope.isReadyForStart = true;
            }
        })
    }

    static instantiate($scope){
        var instantiated = new UrlChooserCtrl($scope);
        return instantiated;
    }
}

UrlChooserCtrl.instantiate.$inject = ['$scope'];

export {UrlChooserCtrl}